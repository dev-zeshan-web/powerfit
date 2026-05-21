import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 spinner mx-auto" />
          <p className="text-gray-500 font-body">Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />

  // Profile loaded, wrong role → redirect to correct dashboard
  if (profile && requiredRole && profile.role !== requiredRole) {
    if (profile.role === 'admin') return <Navigate to="/dashboard/admin" replace />
    if (profile.role === 'trainer') return <Navigate to="/dashboard/trainer" replace />
    return <Navigate to="/dashboard/member" replace />
  }

  return children
}
