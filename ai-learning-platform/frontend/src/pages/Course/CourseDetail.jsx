import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCourse } from '../../api/courses'
import { BookOpenIcon, QuestionMarkCircleIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

export default function CourseDetail() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  useEffect(() => { getCourse(courseId).then(r => setCourse(r.data)) }, [courseId])
  if (!course) return <div className="text-gray-400">Loading...</div>
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{course.title}</h1>
      <p className="text-gray-500">{course.description}</p>
      <div className="space-y-3">
        {course.modules?.map(mod => (
          <div key={mod.id} className="card">
            <h3 className="font-semibold mb-3">{mod.title}</h3>
            <div className="flex gap-3">
              <Link to={`/app/learn/${mod.id}/tutor?course=${courseId}`} className="btn-ghost text-sm flex items-center gap-1.5">
                <ChatBubbleLeftIcon className="w-4 h-4" /> AI Tutor
              </Link>
              <Link to={`/app/learn/${mod.id}/quiz`} className="btn-ghost text-sm flex items-center gap-1.5">
                <QuestionMarkCircleIcon className="w-4 h-4" /> Quiz
              </Link>
              <Link to={`/app/learn/${mod.id}/flashcards`} className="btn-ghost text-sm flex items-center gap-1.5">
                <BookOpenIcon className="w-4 h-4" /> Flashcards
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
