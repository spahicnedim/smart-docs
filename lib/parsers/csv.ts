import Papa from 'papaparse'

export async function parseCsv(buffer: Buffer): Promise<string> {
    const text = buffer.toString('utf-8')
    const result = Papa.parse(text, { header: true })

    return JSON.stringify(result.data, null, 2)
}