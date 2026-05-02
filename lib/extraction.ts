import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export type ExtractedDocument = {
    docType: string | null
    supplier: string | null
    docNumber: string | null
    issueDate: string | null
    dueDate: string | null
    currency: string | null
    lineItems: LineItem[]
    subtotal: number | null
    tax: number | null
    total: number | null
}

export type LineItem = {
    description: string
    quantity: number | null
    unitPrice: number | null
    total: number | null
}

const EXTRACTION_PROMPT = `You are a document data extraction assistant. 
Extract structured data from the document and return ONLY a valid JSON object, no other text.

Extract these fields:
- docType: "invoice" or "purchase_order" (or null if unclear)
- supplier: company or supplier name
- docNumber: document/invoice/PO number
- issueDate: issue date in YYYY-MM-DD format (or null)
- dueDate: due date in YYYY-MM-DD format (or null)
- currency: currency code like USD, EUR, BAM (or null)
- lineItems: array of {description, quantity, unitPrice, total}
- subtotal: numeric subtotal amount (or null)
- tax: numeric tax amount (or null)
- total: numeric total amount (or null)

Rules:
- Return ONLY the JSON object, no markdown, no explanation
- Use null for any field you cannot find
- All numeric values should be numbers, not strings
- If a field is missing from the document, use null`

export async function extractDocument(
    text: string,
    isImage: boolean,
    mimeType?: string
): Promise<ExtractedDocument> {
    let response

    if (isImage) {
        const base64Data = text.split(',')[1]
        response = await client.messages.create({
            model: 'claude-sonnet-4-5',
            max_tokens: 1024,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
                                data: base64Data,
                            },
                        },
                        {
                            type: 'text',
                            text: EXTRACTION_PROMPT,
                        },
                    ],
                },
            ],
        })
    } else {
        response = await client.messages.create({
            model: 'claude-sonnet-4-5',
            max_tokens: 1024,
            messages: [
                {
                    role: 'user',
                    content: `${EXTRACTION_PROMPT}\n\nDocument content:\n${text}`,
                },
            ],
        })
    }

    const content = response.content[0]
    if (content.type !== 'text') {
        throw new Error('Unexpected response from Claude')
    }

    try {
        const cleaned = content.text
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim()
        return JSON.parse(cleaned) as ExtractedDocument
    } catch {
        throw new Error(`Failed to parse Claude response: ${content.text}`)
    }
}