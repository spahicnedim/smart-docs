'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import ValidationIssues from '@/components/ValidationIssues'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

type LineItem = {
    description: string
    quantity: number | null
    unitPrice: number | null
    total: number | null
}

type Document = {
    id: string
    filename: string
    fileType: string
    docType: string | null
    supplier: string | null
    docNumber: string | null
    issueDate: string | null
    dueDate: string | null
    currency: string | null
    lineItems: string | null
    subtotal: number | null
    tax: number | null
    total: number | null
    status: string
    validationIssues: string | null
    createdAt: string
}

export default function ReviewPage() {
    const params = useParams()
    const router = useRouter()
    const [doc, setDoc] = useState<Document | null>(null)
    const [form, setForm] = useState<Partial<Document>>({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch(`/api/documents/${params.id}`)
            .then(r => r.json())
            .then(data => {
                setDoc(data.document)
                setForm(data.document)
            })
    }, [params.id])

    const issues = doc?.validationIssues ? JSON.parse(doc.validationIssues) : []
    const lineItems: LineItem[] = doc?.lineItems ? JSON.parse(doc.lineItems) : []
    const errorCount = issues.filter((i: any) => i.severity === 'error').length

    const handleSave = async (newStatus?: string) => {
        setSaving(true)
        const res = await fetch(`/api/documents/${params.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                ...(newStatus ? { forceStatus: newStatus } : {}),
            }),
        })

        if (res.ok) {
            const data = await res.json()
            setDoc(data.document)
            setForm(data.document)

            if (newStatus === 'validated') {
                toast.success('Document validated')
                router.push('/')
            } else if (newStatus === 'rejected') {
                toast.error('Document rejected')
                router.push('/')
            } else {
                toast.success('Saved & revalidated')
            }
        } else {
            toast.error('Failed to save')
        }
        setSaving(false)
    }

    if (!doc) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <svg className="animate-spin w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm font-semibold text-gray-900">{doc.filename}</h1>
                                <StatusBadge status={doc.status} />
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 font-mono">
                                {doc.docNumber || 'No document number'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSave('rejected')}
                            disabled={saving}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                            Reject
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleSave('validated')}
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {saving ? 'Saving...' : 'Confirm & Validate'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
                {/* Validation Issues */}
                <div className={`rounded-xl border p-5 ${errorCount > 0 ? 'bg-red-50/50 border-red-100' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-gray-900">Validation</h2>
                        {issues.length > 0 && (
                            <span className="text-xs text-gray-400">
                {issues.length} issue{issues.length > 1 ? 's' : ''}
              </span>
                        )}
                    </div>
                    <ValidationIssues issues={issues} />
                </div>

                {/* Extracted Data */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Extracted Data</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Document Type', key: 'docType' },
                            { label: 'Supplier', key: 'supplier' },
                            { label: 'Document Number', key: 'docNumber' },
                            { label: 'Currency', key: 'currency' },
                            { label: 'Issue Date', key: 'issueDate' },
                            { label: 'Due Date', key: 'dueDate' },
                        ].map(({ label, key }) => (
                            <div key={key} className="space-y-1.5">
                                <Label className="text-xs text-gray-400 uppercase tracking-wide">
                                    {label}
                                </Label>
                                <Input
                                    value={(form as any)[key] || ''}
                                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                    placeholder="—"
                                    className="h-9 text-sm"
                                />
                            </div>
                        ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Subtotal', key: 'subtotal' },
                            { label: 'Tax', key: 'tax' },
                            { label: 'Total', key: 'total' },
                        ].map(({ label, key }) => (
                            <div key={key} className="space-y-1.5">
                                <Label className="text-xs text-gray-400 uppercase tracking-wide">
                                    {label}
                                </Label>
                                <Input
                                    type="number"
                                    value={(form as any)[key] || ''}
                                    onChange={e => setForm(f => ({ ...f, [key]: parseFloat(e.target.value) }))}
                                    placeholder="0.00"
                                    className={`h-9 text-sm font-medium ${key === 'total' ? 'border-gray-300' : ''}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Line Items */}
                {lineItems.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-900">Line Items</h2>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lineItems.map((item, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{item.description}</TableCell>
                                        <TableCell className="text-right text-gray-500">{item.quantity ?? '—'}</TableCell>
                                        <TableCell className="text-right text-gray-500">{item.unitPrice ?? '—'}</TableCell>
                                        <TableCell className="text-right font-semibold">{item.total ?? '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Save */}
                <Button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                >
                    {saving ? 'Saving...' : 'Save & Revalidate'}
                </Button>
            </div>
        </div>
    )
}