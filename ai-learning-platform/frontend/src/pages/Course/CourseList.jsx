import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCourses, enroll } from '../../api/courses'
import toast from 'react-hot-toast'

export default function CourseList() {
  const [courses, setCourses] = useState([])
  useEffect(() => {
    listCourses()
      .then(r => setCourses(r.data))
      .catch(err => {
        console.error('Failed to load courses:', err)
        setCourses([])
      })
  }, [])
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(c => (
          <div key={c.id} className="card space-y-3">
            <Link to={`/app/courses/${c.id}`} className="font-semibold text-gray-900 hover:text-primary">{c.title}</Link>
            <p className="text-sm text-gray-500">{c.description}</p>
            <p className="text-xs text-gray-400">{c.modules?.length || 0} modules</p>
            <button onClick={async () => {
              try {
                await enroll(c.id)
                toast.success('Enrolled!')
              } catch (err) {
                console.error('Enrollment failed:', err)
                toast.error('Could not enroll')
              }
            }}
              className="btn-primary w-full text-sm">Enroll</button>
          </div>
        ))}
      </div>
    </div>
  )
}
