import axios from 'axios'

const client = axios.create({ baseURL: '/api' })

client.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth-storage')
  if (raw) {
    const { state } = JSON.parse(raw)
    if (state?.accessToken) {
      config.headers.Authorization = `Bearer ${state.accessToken}`
    }
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const raw = localStorage.getItem('auth-storage')
      if (raw) {
        const { state } = JSON.parse(raw)
        if (state?.refreshToken) {
          try {
            const { data } = await axios.post('/api/auth/refresh', {
              refresh_token: state.refreshToken,
            })
            // Update stored token
            const parsed = JSON.parse(raw)
            parsed.state.accessToken = data.access_token
            localStorage.setItem('auth-storage', JSON.stringify(parsed))
            err.config.headers.Authorization = `Bearer ${data.access_token}`
            return client(err.config)
          } catch {
            localStorage.removeItem('auth-storage')
            window.location.href = '/login'
          }
        }
      }
    }
    return Promise.reject(err)
  }
)

export default client
