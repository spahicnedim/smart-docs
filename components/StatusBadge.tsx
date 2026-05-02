type Status = 'uploaded' | 'processing' | 'needs_review' | 'validated' | 'rejected'

const config: Record<Status, { label: string; className: string; dot: string }> = {
    uploaded:     { label: 'Uploaded',     className: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',         dot: 'bg-gray-400' },
    processing:   { label: 'Processing',   className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',           dot: 'bg-blue-500' },
    needs_review: { label: 'Needs Review', className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',        dot: 'bg-amber-500' },
    validated:    { label: 'Validated',    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',  dot: 'bg-emerald-500' },
    rejected:     { label: 'Rejected',     className: 'bg-red-50 text-red-700 ring-1 ring-red-200',             dot: 'bg-red-500' },
}

export default function StatusBadge({ status }: { status: string }) {
    const s = config[status as Status] ?? { label: status, className: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200', dot: 'bg-gray-400' }
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
    </span>
    )
}