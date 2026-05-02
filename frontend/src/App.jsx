import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
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
import AdminUsers from './pages/AdminUsers'
import AdminSessions from './pages/AdminSessions'
import AdminCredits from './pages/AdminCredits'
import AdminDisputes from './pages/AdminDisputes'
import AiChat from './pages/AiChat'

function AppInner() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/ai-chat" element={<AiChat />} />
          <Route element={<ProtectedRoute><Navbar /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:userId" element={<Profile />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/sessions" element={<AdminSessions />} />
            <Route path="/admin/credits" element={<AdminCredits />} />
            <Route path="/admin/disputes" element={<AdminDisputes />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  )
}
