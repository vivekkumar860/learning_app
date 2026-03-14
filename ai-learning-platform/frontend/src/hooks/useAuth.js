import { useAuthStore } from '../store/authStore'
import { login as apiLogin } from '../api/auth'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const { setAuth, logout, user, accessToken } = useAuthStore()
  const navigate = useNavigate()

  const login = async (email, password) => {
    const { data } = await apiLogin(email, password)

    // Safely decode JWT token
    let payload
    try {
      const tokenParts = data.access_token?.split('.')
      if (!tokenParts || tokenParts.length !== 3) {
        throw new Error('Invalid token format')
      }

      // Add padding if needed for base64 decoding
      const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64 + '=='.substring(0, (4 - base64.length % 4) % 4)

      payload = JSON.parse(atob(padded))
    } catch (error) {
      console.error('Failed to decode token:', error)
      toast.error('Authentication failed. Please try again.')
      throw new Error('Invalid authentication token')
    }

    const userRole = payload.role || 'student'
    setAuth({ id: payload.sub, role: userRole }, data.access_token, data.refresh_token)
    navigate(`/app/dashboard/${userRole.toLowerCase()}`)
  }

  const signOut = () => {
    logout()
    navigate('/login')
    toast.success('Logged out')
  }

  return { login, signOut, user, isAuthenticated: !!accessToken }
}
