import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const documents = await prisma.document.findMany({
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ documents })
    } catch (err) {
        console.error('Error fetching documents:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}