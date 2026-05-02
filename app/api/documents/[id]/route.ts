import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateDocument, hasDuplicateIssue } from '@/lib/validation'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const document = await prisma.document.findUnique({ where: { id } })
        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }
        return NextResponse.json({ document })
    } catch (err) {
        console.error('Error fetching document:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { forceStatus, ...data } = body

        if (forceStatus) {
            const updated = await prisma.document.update({
                where: { id },
                data: { ...data, status: forceStatus, updatedAt: new Date() },
            })
            return NextResponse.json({ document: updated })
        }

        const lineItems = data.lineItems ? JSON.parse(data.lineItems) : []

        const extracted = {
            docType: data.docType ?? null,
            supplier: data.supplier ?? null,
            docNumber: data.docNumber ?? null,
            issueDate: data.issueDate ?? null,
            dueDate: data.dueDate ?? null,
            currency: data.currency ?? null,
            lineItems,
            subtotal: data.subtotal ?? null,
            tax: data.tax ?? null,
            total: data.total ?? null,
        }

        const issues = validateDocument(extracted)

        if (extracted.docNumber) {
            const existing = await prisma.document.findMany({
                where: { docNumber: extracted.docNumber, id: { not: id } },
                select: { docNumber: true },
            })
            const existingNumbers = existing.map(d => d.docNumber!)
            const dupIssue = hasDuplicateIssue(extracted.docNumber, existingNumbers)
            if (dupIssue) issues.push(dupIssue)
        }

        const hasErrors = issues.some(i => i.severity === 'error')
        const newStatus = hasErrors ? 'needs_review' : 'validated'

        const updated = await prisma.document.update({
            where: { id },
            data: {
                ...data,
                validationIssues: JSON.stringify(issues),
                status: newStatus,
                updatedAt: new Date(),
            },
        })

        return NextResponse.json({ document: updated, issues })
    } catch (err) {
        console.error('Error updating document:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}