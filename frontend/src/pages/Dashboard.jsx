import { useAuth } from '../context/AuthContext'
import AdminDashboard from './AdminDashboard'
import UserDashboard from './UserDashboard'

export default function Dashboard() {
  const { user } = useAuth()

  if (user?.role === 'ADMIN') {
    return <AdminDashboard />
  }

  return <UserDashboard />
}
