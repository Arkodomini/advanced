import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './components/auth/LoginPage'
import HomePage from './pages/HomePage'
import BoardPage from './pages/BoardPage'
import TemplatesPage from './pages/TemplatesPage'
import ProtectedRoute from './components/common/ProtectedRoute'

export default function App() {
  const { initialize, initialized } = useAuthStore()
  useEffect(() => { initialize() }, [initialize])

  if (!initialized) return (
    <div className="h-screen flex items-center justify-center bg-canvas">
      <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/board/:id" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
