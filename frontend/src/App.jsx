import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import Skills from './pages/Skills'
import Sessions from './pages/Sessions'
import Matches from './pages/Matches'
import Profile from './pages/Profile'
import Wallet from './pages/Wallet'
import AdminDisputes from './pages/AdminDisputes'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/" element={<ProtectedRoute><Navbar /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="skills" element={<Skills />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="matches" element={<Matches />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="profile" element={<Profile />} />
            <Route path="user/:userId" element={<Profile />} />
            <Route path="admin/disputes" element={<AdminDisputes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
