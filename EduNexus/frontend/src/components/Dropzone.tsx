import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Dropzone({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void
  disabled?: boolean
}) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length) onFiles(accepted)
    },
    [onFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 50 * 1024 * 1024,
    multiple: true,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-12 text-center transition',
        isDragActive
          ? 'border-brand-400 bg-brand-500/10'
          : 'border-white/15 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      <input {...getInputProps()} />
      <div className="rounded-2xl bg-gradient-to-br from-brand-500/30 to-purple-500/20 p-3 ring-1 ring-white/10">
        <UploadCloud className="h-7 w-7 text-brand-200" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-100">
          {isDragActive ? 'Drop your files here' : 'Drag and drop files, or click to browse'}
        </p>
        <p className="mt-1 text-xs text-slate-400">PDF, PPTX, DOCX, TXT — up to 50 MB each</p>
      </div>
    </div>
  )
}
