import { validateDocument, hasDuplicateIssue } from '@/lib/validation'

const baseDoc = {
    docType: 'invoice',
    supplier: 'Test Supplier',
    docNumber: 'INV-001',
    issueDate: '2024-01-01',
    dueDate: '2024-02-01',
    currency: 'USD',
    lineItems: [
        { description: 'Service A', quantity: 2, unitPrice: 50, total: 100 },
    ],
    subtotal: 100,
    tax: 20,
    total: 120,
}

describe('validateDocument', () => {
    test('valid document has no issues', () => {
        const issues = validateDocument(baseDoc)
        expect(issues).toHaveLength(0)
    })

    test('detects missing supplier', () => {
        const issues = validateDocument({ ...baseDoc, supplier: null })
        expect(issues.some(i => i.field === 'supplier')).toBe(true)
    })

    test('detects missing docNumber', () => {
        const issues = validateDocument({ ...baseDoc, docNumber: null })
        expect(issues.some(i => i.field === 'docNumber')).toBe(true)
    })

    test('detects missing total', () => {
        const issues = validateDocument({ ...baseDoc, total: null })
        expect(issues.some(i => i.field === 'total')).toBe(true)
    })

    test('detects total mismatch', () => {
        const issues = validateDocument({ ...baseDoc, total: 999 })
        const totalIssue = issues.find(i => i.field === 'total')
        expect(totalIssue).toBeDefined()
        expect(totalIssue?.severity).toBe('error')
    })

    test('valid totals pass without issues', () => {
        const issues = validateDocument({ ...baseDoc, subtotal: 100, tax: 20, total: 120 })
        expect(issues.some(i => i.field === 'total')).toBe(false)
    })

    test('detects due date before issue date', () => {
        const issues = validateDocument({
            ...baseDoc,
            issueDate: '2024-05-01',
            dueDate: '2024-01-01',
        })
        const dateIssue = issues.find(i => i.field === 'dueDate')
        expect(dateIssue).toBeDefined()
        expect(dateIssue?.severity).toBe('error')
    })

    test('detects line item calculation error', () => {
        const issues = validateDocument({
            ...baseDoc,
            lineItems: [
                { description: 'Service A', quantity: 2, unitPrice: 50, total: 999 },
            ],
        })
        expect(issues.some(i => i.field === 'lineItems[0]')).toBe(true)
    })

    test('warns when no line items', () => {
        const issues = validateDocument({ ...baseDoc, lineItems: [] })
        const issue = issues.find(i => i.field === 'lineItems')
        expect(issue).toBeDefined()
        expect(issue?.severity).toBe('warning')
    })

    test('warns on missing issue date', () => {
        const issues = validateDocument({ ...baseDoc, issueDate: null })
        const issue = issues.find(i => i.field === 'issueDate')
        expect(issue?.severity).toBe('warning')
    })

    test('handles missing tax (treats as 0)', () => {
        const issues = validateDocument({
            ...baseDoc,
            tax: null,
            subtotal: 100,
            total: 100,
        })
        expect(issues.some(i => i.field === 'total')).toBe(false)
    })
})

describe('hasDuplicateIssue', () => {
    test('returns null when no duplicate', () => {
        const result = hasDuplicateIssue('INV-001', ['INV-002', 'INV-003'])
        expect(result).toBeNull()
    })

    test('returns issue when duplicate found', () => {
        const result = hasDuplicateIssue('INV-001', ['INV-001', 'INV-002'])
        expect(result).not.toBeNull()
        expect(result?.field).toBe('docNumber')
        expect(result?.severity).toBe('error')
    })

    test('returns null for empty list', () => {
        const result = hasDuplicateIssue('INV-001', [])
        expect(result).toBeNull()
    })
})