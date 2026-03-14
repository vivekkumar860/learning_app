import { useState } from 'react'
import { useUpload } from '../../hooks/useUpload'
import FileDropZone from '../../components/ui/FileDropZone'
import ProgressBar from '../../components/ui/ProgressBar'
import client from '../../api/client'
import { useEffect } from 'react'

export default function MaterialUpload() {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [modules, setModules] = useState([])
  const { upload, progress, uploading } = useUpload()

  useEffect(() => {
    client.get('/courses').then(r => {
      const mods = r.data.flatMap(c => (c.modules || []).map(m => ({ ...m, courseTitle: c.title })))
      setModules(mods)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file || !title || !moduleId) return
    await upload(moduleId, title, file)
    setFile(null); setTitle('')
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Upload Material</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Module</label>
          <select className="input" value={moduleId} onChange={e => setModuleId(e.target.value)} required>
            <option value="">Select module...</option>
            {modules.map(m => <option key={m.id} value={m.id}>{m.courseTitle} → {m.title}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Title</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <FileDropZone onFile={setFile} />
        {file && <p className="text-sm text-gray-500">Selected: {file.name}</p>}
        {uploading && <ProgressBar value={progress} />}
        <button type="submit" className="btn-primary w-full" disabled={uploading || !file || !title || !moduleId}>
          {uploading ? `Uploading ${progress}%...` : 'Upload & Process'}
        </button>
      </form>
    </div>
  )
}
