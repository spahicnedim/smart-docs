export async function parseImage(buffer: Buffer, mimeType: string): Promise<string> {
    const base64 = buffer.toString('base64')
    return `data:${mimeType};base64,${base64}`
}