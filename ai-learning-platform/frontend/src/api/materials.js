import client from './client'
export const listMaterials = (moduleId)  => client.get(`/materials/${moduleId}`)
export const uploadText    = (data)      => client.post('/materials/text', data)
export const deleteMaterial= (id)        => client.delete(`/materials/${id}`)

export const uploadFile = (moduleId, title, file, onProgress) => {
  const form = new FormData()
  form.append('module_id', moduleId)
  form.append('title', title)
  form.append('file', file)
  return client.post('/materials/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(Math.round(e.loaded * 100 / e.total)),
  })
}
