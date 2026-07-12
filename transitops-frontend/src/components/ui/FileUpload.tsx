import { useRef, useState, type DragEvent } from 'react'
import { UploadCloud, File as FileIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  label?: string
  accept?: string
  onFilesSelected?: (files: File[]) => void
}

export function FileUpload({ label = 'Drag & drop files here, or click to browse', accept, onFilesSelected }: FileUploadProps) {
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(list: FileList | null) {
    if (!list) return
    const arr = Array.from(list)
    setFiles((f) => [...f, ...arr])
    onFilesSelected?.(arr)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
          dragging ? 'border-signal bg-signal-soft' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50',
        )}
      >
        <UploadCloud className="h-5 w-5 text-slate-400" />
        <p className="text-xs text-slate-500">{label}</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs">
              <FileIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="flex-1 truncate text-ink">{f.name}</span>
              <span className="text-slate-400 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setFiles((prev) => prev.filter((_, idx) => idx !== i))
                }}
                aria-label={`Remove ${f.name}`}
              >
                <X className="h-3.5 w-3.5 text-slate-400 hover:text-alert" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
