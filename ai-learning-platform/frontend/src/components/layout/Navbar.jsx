import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, signOut } = useAuth()
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/app" className="font-bold text-lg text-primary">LearnAI</Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 capitalize">{user?.role}</span>
        <button onClick={signOut} className="btn-ghost text-sm">Logout</button>
      </div>
    </nav>
  )
}
