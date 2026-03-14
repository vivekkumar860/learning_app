import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/Dashboard/StudentDashboard'
import TeacherDashboard from './pages/Dashboard/TeacherDashboard'
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import CourseList from './pages/Course/CourseList'
import CourseDetail from './pages/Course/CourseDetail'
import AiTutor from './pages/Learn/AiTutor'
import QuizPage from './pages/Learn/QuizPage'
import FlashCards from './pages/Learn/FlashCards'
import MaterialUpload from './pages/Upload/MaterialUpload'
import ReviewSuggestions from './pages/Upload/ReviewSuggestions'
import PageWrapper from './components/layout/PageWrapper'
import CSE332Material from './pages/StudyMaterial/CSE332Material'

function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.accessToken)
  return token ? children : <Navigate to="/login" replace />
}

function DashboardRedirect() {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />

  const role = user.role?.toLowerCase()
  switch (role) {
    case 'student':
      return <Navigate to="/app/dashboard/student" replace />
    case 'teacher':
      return <Navigate to="/app/dashboard/teacher" replace />
    case 'admin':
      return <Navigate to="/app/dashboard/admin" replace />
    default:
      return <Navigate to="/app/dashboard/student" replace />
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/app" element={<PrivateRoute><PageWrapper /></PrivateRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard">
          <Route index element={<DashboardRedirect />} />
          <Route path="student" element={<StudentDashboard />} />
          <Route path="teacher" element={<TeacherDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
        <Route path="courses" element={<CourseList />} />
        <Route path="courses/:courseId" element={<CourseDetail />} />
        <Route path="learn/:moduleId/tutor" element={<AiTutor />} />
        <Route path="learn/:moduleId/quiz" element={<QuizPage />} />
        <Route path="learn/:moduleId/flashcards" element={<FlashCards />} />
        <Route path="upload" element={<MaterialUpload />} />
        <Route path="suggestions" element={<ReviewSuggestions />} />
        <Route path="materials/cse332" element={<CSE332Material />} />
      </Route>
    </Routes>
  )
}
