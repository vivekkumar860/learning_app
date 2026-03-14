import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { BookOpenIcon, AcademicCapIcon, LightBulbIcon, ArrowUpTrayIcon, ChartBarIcon, UsersIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

const studentLinks = [
  { to: '/app/courses', label: 'Courses', icon: BookOpenIcon },
  { to: '/app/dashboard/student', label: 'My Progress', icon: ChartBarIcon },
]
const teacherLinks = [
  { to: '/app/dashboard/teacher', label: 'Dashboard', icon: ChartBarIcon },
  { to: '/app/courses', label: 'Courses', icon: BookOpenIcon },
  { to: '/app/upload', label: 'Upload Material', icon: ArrowUpTrayIcon },
  { to: '/app/suggestions', label: 'Review Suggestions', icon: LightBulbIcon },
]
const adminLinks = [
  { to: '/app/dashboard/admin', label: 'Admin', icon: UsersIcon },
  ...teacherLinks,
]

export default function Sidebar() {
  const user = useAuthStore(s => s.user)
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'teacher' ? teacherLinks : studentLinks
  return (
    <aside className="w-56 bg-white border-r border-gray-200 min-h-screen p-4">
      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            clsx('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50')}>
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
