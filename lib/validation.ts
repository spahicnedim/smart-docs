import type { ExtractedDocument } from './extraction'

export type ValidationIssue = {
    field: string
    message: string
    severity: 'error' | 'warning'
}

export function validateDocument(doc: ExtractedDocument): ValidationIssue[] {
    const issues: ValidationIssue[] = []


    if (!doc.supplier) {
        issues.push({
            field: 'supplier',
            message: 'Supplier name is missing',
            severity: 'error',
        })
    }

    if (!doc.docNumber) {
        issues.push({
            field: 'docNumber',
            message: 'Document number is missing',
            severity: 'error',
        })
    }

    if (!doc.docType) {
        issues.push({
            field: 'docType',
            message: 'Could not determine document type (invoice or purchase order)',
            severity: 'warning',
        })
    }


    if (doc.issueDate && doc.dueDate) {
        const issue = new Date(doc.issueDate)
        const due = new Date(doc.dueDate)
        if (issue > due) {
            issues.push({
                field: 'dueDate',
                message: `Due date (${doc.dueDate}) is before issue date (${doc.issueDate})`,
                severity: 'error',
            })
        }
    }

    if (!doc.issueDate) {
        issues.push({
            field: 'issueDate',
            message: 'Issue date is missing',
            severity: 'warning',
        })
    }


    if (doc.subtotal !== null && doc.tax !== null && doc.total !== null) {
        const calculated = Math.round((doc.subtotal + doc.tax) * 100) / 100
        const actual = Math.round(doc.total * 100) / 100
        const diff = Math.abs(calculated - actual)

        if (diff > 0.01) {
            issues.push({
                field: 'total',
                message: `Total mismatch: ${doc.subtotal} + ${doc.tax} (tax) = ${calculated}, but document says ${actual}`,
                severity: 'error',
            })
        }
    }

    if (doc.total === null) {
        issues.push({
            field: 'total',
            message: 'Total amount is missing',
            severity: 'error',
        })
    }


    if (doc.lineItems && doc.lineItems.length > 0) {
        doc.lineItems.forEach((item, index) => {
            if (item.quantity !== null && item.unitPrice !== null && item.total !== null) {
                const calculated = Math.round(item.quantity * item.unitPrice * 100) / 100
                const actual = Math.round(item.total * 100) / 100
                const diff = Math.abs(calculated - actual)

                if (diff > 0.01) {
                    issues.push({
                        field: `lineItems[${index}]`,
                        message: `Line item "${item.description}": ${item.quantity} × ${item.unitPrice} = ${calculated}, but document says ${actual}`,
                        severity: 'error',
                    })
                }
            }
        })
    } else {
        issues.push({
            field: 'lineItems',
            message: 'No line items found',
            severity: 'warning',
        })
    }

    return issues
}


export function hasDuplicateIssue(docNumber: string, existingNumbers: string[]): ValidationIssue | null {
    if (existingNumbers.includes(docNumber)) {
        return {
            field: 'docNumber',
            message: `Document number "${docNumber}" already exists in the system`,
            severity: 'error',
        }
    }
    return null
}