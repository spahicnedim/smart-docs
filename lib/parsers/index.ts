import { parsePdf } from './pdf'
import { parseImage } from './image'
import { parseCsv } from './csv'
import { parseTxt } from './txt'

export type ParseResult = {
    text: string
    isImage: boolean
    mimeType?: string
}

export async function parseFile(
    buffer: Buffer,
    filename: string,
    mimeType: string
): Promise<ParseResult> {
    const ext = filename.split('.').pop()?.toLowerCase()

    if (ext === 'pdf') {
        const text = await parsePdf(buffer)
        return { text, isImage: false }
    }

    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
        const text = await parseImage(buffer, mimeType)
        return { text, isImage: true, mimeType }
    }

    if (ext === 'csv') {
        const text = await parseCsv(buffer)
        return { text, isImage: false }
    }


    const text = await parseTxt(buffer)
    return { text, isImage: false }
}