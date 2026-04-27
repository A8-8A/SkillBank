import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="navbar-brand">SkillBank</div>
        <div className="navbar-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/skills">Skills</NavLink>
          <NavLink to="/sessions">Sessions</NavLink>
          <NavLink to="/matches">Matches</NavLink>
          <NavLink to="/wallet">Wallet</NavLink>
          <NavLink to="/profile">My Profile</NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin/disputes">Disputes</NavLink>
          )}
        </div>
        <div className="navbar-user">
          <span>{user?.name}</span>
          <button className="btn btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
