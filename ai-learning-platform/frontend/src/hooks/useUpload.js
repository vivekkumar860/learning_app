import { useState } from 'react'
import { uploadFile } from '../api/materials'
import toast from 'react-hot-toast'

export function useUpload() {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const upload = async (moduleId, title, file) => {
    setUploading(true)
    setError(null)
    setProgress(0)
    try {
      const result = await uploadFile(moduleId, title, file, setProgress)
      toast.success('File uploaded! Processing in background...')
      return result.data
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed'
      setError(msg)
      toast.error(msg)
      return null
    } finally {
      setUploading(false)
    }
  }

  return { upload, progress, uploading, error }
}
