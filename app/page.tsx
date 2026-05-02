'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

type Document = {
    id: string
    filename: string
    fileType: string
    supplier: string | null
    docNumber: string | null
    docType: string | null
    total: number | null
    currency: string | null
    status: string
    createdAt: string
    validationIssues: string | null
}

export default function Dashboard() {
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/documents')
            .then(r => r.json())
            .then(data => {
                setDocuments(data.documents || [])
                setLoading(false)
            })
    }, [])

    const stats = useMemo(() => ({
        total: documents.length,
        validated: documents.filter(d => d.status === 'validated').length,
        needsReview: documents.filter(d => d.status === 'needs_review').length,
        rejected: documents.filter(d => d.status === 'rejected').length,
    }), [documents])

    const statsByCurrency = useMemo(() => {
        const map: Record<string, number> = {}
        documents.forEach(doc => {
            if (doc.total && doc.currency) {
                map[doc.currency] = (map[doc.currency] || 0) + doc.total
            }
        })
        return map
    }, [documents])

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Smart Docs</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Document Processing System</p>
                    </div>
                    <Button asChild size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                        <Link href="/upload">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Upload
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">

                <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Documents', value: stats.total, color: 'text-gray-900' },
                        { label: 'Validated', value: stats.validated, color: 'text-emerald-600' },
                        { label: 'Needs Review', value: stats.needsReview, color: 'text-amber-600' },
                        { label: 'Rejected', value: stats.rejected, color: 'text-red-500' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className={`text-3xl font-bold tracking-tight ${stat.color}`}>{stat.value}</div>
                            <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{stat.label}</div>
                        </div>
                    ))}
                </div>


                {Object.keys(statsByCurrency).length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                            Totals by Currency
                        </p>
                        <div className="flex gap-8">
                            {Object.entries(statsByCurrency).map(([currency, total]) => (
                                <div key={currency} className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 tracking-tight">
                    {total.toFixed(2)}
                  </span>
                                    <span className="text-sm font-semibold text-gray-400">{currency}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">Documents</h2>
                        <span className="text-xs text-gray-400">{documents.length} total</span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <svg className="animate-spin w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-900">No documents yet</p>
                                <p className="text-xs text-gray-400 mt-1">Upload your first invoice or purchase order</p>
                            </div>
                            <Button asChild variant="link" size="sm" className="text-blue-600">
                                <Link href="/upload">Upload document →</Link>
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Document</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Issues</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map(doc => {
                                    const issues = doc.validationIssues ? JSON.parse(doc.validationIssues) : []
                                    const errorCount = issues.filter((i: any) => i.severity === 'error').length
                                    const warnCount = issues.filter((i: any) => i.severity === 'warning').length

                                    return (
                                        <TableRow key={doc.id}>
                                            <TableCell>
                                                <div className="font-medium text-gray-900 text-sm">{doc.filename}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-0.5">{doc.docNumber || '—'}</div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {doc.supplier || '—'}
                                            </TableCell>
                                            <TableCell>
                                                {doc.docType ? (
                                                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded capitalize">
                            {doc.docType.replace('_', ' ')}
                          </span>
                                                ) : '—'}
                                            </TableCell>
                                            <TableCell className="text-sm font-semibold text-gray-900">
                                                {doc.total ? `${doc.currency || ''} ${doc.total.toFixed(2)}` : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1.5">
                                                    {errorCount > 0 && (
                                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                              {errorCount} error{errorCount > 1 ? 's' : ''}
                            </span>
                                                    )}
                                                    {warnCount > 0 && (
                                                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                              {warnCount} warn{warnCount > 1 ? 's' : ''}
                            </span>
                                                    )}
                                                    {errorCount === 0 && warnCount === 0 && (
                                                        <span className="text-xs text-emerald-600 font-medium">✓ Clean</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={doc.status} />
                                            </TableCell>
                                            <TableCell>
                                                <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-gray-900">
                                                    <Link href={`/document/${doc.id}`}>Review →</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    )
}