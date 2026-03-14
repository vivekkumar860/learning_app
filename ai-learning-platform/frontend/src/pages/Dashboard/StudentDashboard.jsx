import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCourses } from '../../api/courses'
import ProgressBar from '../../components/ui/ProgressBar'
import {
  BookOpenIcon,
  ClockIcon,
  AcademicCapIcon,
  ChartBarIcon,
  SparklesIcon,
  TrophyIcon,
  FireIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function StudentDashboard() {
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    hoursLearned: 45,
    currentStreak: 7
  })

  useEffect(() => {
    listCourses()
      .then(r => {
        setCourses(r.data)
        setStats(prev => ({
          ...prev,
          totalCourses: r.data.length,
          completedCourses: r.data.filter(c => c.progress_pct === 100).length
        }))
      })
      .catch(err => {
        console.error('Failed to load courses:', err)
        setCourses([])
      })
  }, [])

  const quickActions = [
    { icon: SparklesIcon, label: 'AI Tutor', path: '/app/learn/tutor', color: 'from-purple-500 to-pink-500' },
    { icon: BookOpenIcon, label: 'CSE332 Ethics', path: '/app/materials/cse332', color: 'from-indigo-500 to-blue-500', isNew: true },
    { icon: BookOpenIcon, label: 'Browse Courses', path: '/app/courses', color: 'from-blue-500 to-cyan-500' },
    { icon: TrophyIcon, label: 'Achievements', path: '/app/achievements', color: 'from-yellow-500 to-orange-500' },
    { icon: ChartBarIcon, label: 'Progress', path: '/app/progress', color: 'from-green-500 to-emerald-500' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Student!</h1>
          <p className="text-gray-600">Continue your learning journey from where you left off</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary-50 to-white border-primary-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-xl">
                <BookOpenIcon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-white border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <AcademicCapIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hours Learned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.hoursLearned}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-50 to-white border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Day Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.currentStreak} 🔥</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <FireIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {quickActions.map((action, idx) => (
              <Link
                key={idx}
                to={action.path}
                className="card hover:shadow-xl transition-all duration-300 group relative"
              >
                {action.isNew && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                    NEW
                  </span>
                )}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} mb-3`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                  {action.label}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Continue Learning Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Continue Learning</h2>
            <Link to="/app/courses" className="text-primary hover:text-primary-600 font-medium flex items-center">
              View All
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map(course => (
                <Link
                  key={course.id}
                  to={`/app/courses/${course.id}`}
                  className="card card-hover group"
                >
                  {/* Course Image Placeholder */}
                  <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl mb-4 flex items-center justify-center">
                    <BookOpenIcon className="h-16 w-16 text-primary-400" />
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium text-gray-900">{course.progress_pct || 0}%</span>
                    </div>
                    <ProgressBar value={course.progress_pct || 0} />
                  </div>

                  {course.progress_pct === 100 && (
                    <div className="mt-3 inline-flex items-center text-sm text-green-600 font-medium">
                      <TrophyIcon className="h-4 w-4 mr-1" />
                      Completed
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-6">Start your learning journey by browsing available courses</p>
              <Link to="/app/courses" className="btn-primary inline-flex items-center">
                Browse Courses
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="card">
            <div className="space-y-4">
              {[
                { time: '2 hours ago', action: 'Completed quiz', course: 'Introduction to AI', score: '95%' },
                { time: '5 hours ago', action: 'Studied flashcards', course: 'Data Science Basics', cards: '20 cards' },
                { time: 'Yesterday', action: 'Watched lecture', course: 'Machine Learning', duration: '45 min' }
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start space-x-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <ClockIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.course}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                  {activity.score && (
                    <span className="badge badge-success">{activity.score}</span>
                  )}
                  {activity.cards && (
                    <span className="badge badge-primary">{activity.cards}</span>
                  )}
                  {activity.duration && (
                    <span className="badge badge-warning">{activity.duration}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}