import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = user?.role === 'ADMIN'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="navbar-brand">SkillBank</div>
        <div className="navbar-links">
          {isAdmin ? (
            <>
              <NavLink to="/dashboard">Overview</NavLink>
              <NavLink to="/admin/users">Users</NavLink>
              <NavLink to="/admin/sessions">Sessions</NavLink>
              <NavLink to="/admin/credits">Credits</NavLink>
              <NavLink to="/admin/disputes">Disputes</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/skills">Skills</NavLink>
              <NavLink to="/sessions">Sessions</NavLink>
              <NavLink to="/matches">Matches</NavLink>
              <NavLink to="/wallet">Wallet</NavLink>
              <NavLink to="/profile">My Profile</NavLink>
            </>
          )}
        </div>
        <div className="navbar-user">
          <span>{user?.name}{isAdmin ? ' (Admin)' : ''}</span>
          <button className="btn btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
