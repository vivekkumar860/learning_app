import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export default function FileDropZone({ onFile, accept = { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } }) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept,
    maxFiles: 1,
    onDrop: files => files[0] && onFile(files[0]),
  })
  return (
    <div {...getRootProps()} className={clsx(
      'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
      isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
    )}>
      <input {...getInputProps()} />
      <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
      {acceptedFiles[0]
        ? <p className="text-sm font-medium text-primary">{acceptedFiles[0].name}</p>
        : <p className="text-sm text-gray-500">Drop PDF or DOCX here, or click to select</p>}
    </div>
  )
}
