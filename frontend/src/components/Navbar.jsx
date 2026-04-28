import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
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
        <Outlet />
      </main>
    </div>
  )
}
