import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCourses, createCourse } from '../../api/courses'
import toast from 'react-hot-toast'

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([])
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => { listCourses().then(r => setCourses(r.data)) }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    try {
      const { data } = await createCourse({ title, is_published: false })
      setCourses(prev => [data, ...prev])
      setTitle('')
      toast.success('Course created!')
    } catch {
      toast.error('Failed to create course')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
      <div className="card">
        <h2 className="font-semibold mb-3">Create New Course</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input className="input flex-1" placeholder="Course title" value={title} onChange={e => setTitle(e.target.value)} />
          <button className="btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button>
        </form>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(c => (
          <Link key={c.id} to={`/app/courses/${c.id}`} className="card hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-1">{c.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${c.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {c.is_published ? 'Published' : 'Draft'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
