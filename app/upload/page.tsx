'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {Button} from "@/components/ui/button";

const SUPPORTED_FORMATS = [
    { ext: 'PDF', color: 'bg-red-100 text-red-700' },
    { ext: 'JPG', color: 'bg-yellow-100 text-yellow-700' },
    { ext: 'PNG', color: 'bg-blue-100 text-blue-700' },
    { ext: 'CSV', color: 'bg-green-100 text-green-700' },
    { ext: 'TXT', color: 'bg-gray-100 text-gray-700' },
]

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [dragging, setDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleFile = useCallback((f: File) => {
        setFile(f)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
    }, [handleFile])

    const handleUpload = useCallback(async () => {
        if (!file) return
        setUploading(true)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || 'Upload failed')
                return
            }
            toast.success('Document uploaded successfully')
            router.push(`/document/${data.document.id}`)
        } catch {
            toast.error('Network error — please try again')
        } finally {
            setUploading(false)
        }
    }, [file, router])

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
                    <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-lg font-semibold text-gray-900">Upload Document</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-12">
                <div className="mb-8 text-center">
                    <p className="text-gray-500 text-sm">
                        Upload an invoice or purchase order — AI will extract and validate the data automatically.
                    </p>
                </div>


                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
                        dragging
                            ? 'border-blue-400 bg-blue-50 scale-[1.01]'
                            : file
                                ? 'border-emerald-400 bg-emerald-50'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.csv,.txt"
                        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />

                    {file ? (
                        <div className="space-y-3">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{file.name}</p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null) }}
                                className="text-sm text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                            >
                                Remove file
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">Drop your file here</p>
                                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                            </div>
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                {SUPPORTED_FORMATS.map(f => (
                                    <span key={f.ext} className={`text-xs font-medium px-2 py-0.5 rounded ${f.color}`}>
                    {f.ext}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="mt-4 w-full bg-gray-900 hover:bg-gray-800 text-white cursor-pointer"
                    size="lg"
                >
                    {uploading ? (
                        <span className="flex items-center gap-2">
      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Extracting data...
    </span>
                    ) : 'Upload & Extract'}
                </Button>

                {uploading && (
                    <p className="text-center text-xs text-gray-400 mt-2">
                        This may take a few seconds
                    </p>
                )}
            </div>
        </div>
    )
}