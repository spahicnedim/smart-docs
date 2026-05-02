type Issue = {
    field: string
    message: string
    severity: 'error' | 'warning'
}

export default function ValidationIssues({ issues }: { issues: Issue[] }) {
    if (!issues || issues.length === 0) {
        return (
            <div className="flex items-center gap-2.5 text-emerald-600 text-sm font-medium">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-xs">✓</span>
                All checks passed
            </div>
        )
    }

    const errors = issues.filter(i => i.severity === 'error')
    const warnings = issues.filter(i => i.severity === 'warning')

    return (
        <div className="space-y-2">
            {errors.length > 0 && (
                <div className="space-y-1.5">
                    {errors.map((issue, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                            <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-red-200 text-red-700 text-xs flex items-center justify-center font-bold">!</span>
                            <div className="text-sm text-red-800">
                                <span className="font-semibold">{issue.field}</span>
                                <span className="text-red-600"> — </span>
                                {issue.message}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {warnings.length > 0 && (
                <div className="space-y-1.5">
                    {warnings.map((issue, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                            <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-amber-200 text-amber-700 text-xs flex items-center justify-center font-bold">!</span>
                            <div className="text-sm text-amber-800">
                                <span className="font-semibold">{issue.field}</span>
                                <span className="text-amber-600"> — </span>
                                {issue.message}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}