import { NextRequest, NextResponse } from 'next/server'
import { parseFile } from '@/lib/parsers'
import { extractDocument } from '@/lib/extraction'
import { validateDocument, hasDuplicateIssue } from '@/lib/validation'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        // 1. Uzmi fajl iz request-a
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // 2. Provjeri tip fajla
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/csv', 'text/plain']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: `File type ${file.type} is not supported` }, { status: 400 })
        }

        // 3. Pretvori fajl u buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // 4. Parsiraj fajl (izvuci tekst ili base64)
        const parsed = await parseFile(buffer, file.name, file.type)

        // 5. Spremi dokument u bazu sa statusom "processing"
        const doc = await prisma.document.create({
            data: {
                filename: file.name,
                fileType: file.type,
                status: 'processing',
            },
        })

        // 6. Pozovi Claude da ekstrahuje podatke
        let extracted
        try {
            extracted = await extractDocument(parsed.text, parsed.isImage, parsed.mimeType)
        } catch (err) {
            console.error('Extraction error:', err)
            // Ako Claude API ne radi (npr. nema key), označi kao needs_review
            await prisma.document.update({
                where: { id: doc.id },
                data: { status: 'needs_review' },
            })
            return NextResponse.json({
                error: 'Extraction failed — check your API key',
                documentId: doc.id,
            }, { status: 422 })
        }

        // 7. Provjeri duplikate u bazi
        const issues = validateDocument(extracted)

        if (extracted.docNumber) {
            const existing = await prisma.document.findMany({
                where: {
                    docNumber: extracted.docNumber,
                    id: { not: doc.id }, // isključi trenutni dokument
                },
                select: { docNumber: true },
            })
            const existingNumbers = existing.map(d => d.docNumber!)
            const dupIssue = hasDuplicateIssue(extracted.docNumber, existingNumbers)
            if (dupIssue) issues.push(dupIssue)
        }

        // 8. Odredi status na osnovu validacije
        const hasErrors = issues.some(i => i.severity === 'error')
        const status = hasErrors ? 'needs_review' : 'validated'

        // 9. Ažuriraj dokument u bazi sa svim podacima
        const updated = await prisma.document.update({
            where: { id: doc.id },
            data: {
                docType: extracted.docType,
                supplier: extracted.supplier,
                docNumber: extracted.docNumber,
                issueDate: extracted.issueDate,
                dueDate: extracted.dueDate,
                currency: extracted.currency,
                lineItems: JSON.stringify(extracted.lineItems),
                subtotal: extracted.subtotal,
                tax: extracted.tax,
                total: extracted.total,
                status,
                validationIssues: JSON.stringify(issues),
            },
        })

        return NextResponse.json({
            success: true,
            document: updated,
            issues,
        })

    } catch (err) {
        console.error('Upload error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}