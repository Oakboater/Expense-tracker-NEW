import { ReactNode, useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../api/client'

interface LayoutProps {
  children: ReactNode
  title?: string
}

export default function Layout({ children, title = 'Expense Tracker' }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authApi.getCurrentUser()
        setUser(data)
      } catch (err) {
        console.error("Failed to fetch user:", err)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = () => {
    authApi.logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/expenses', label: 'Expenses', icon: '💰' },
    { path: '/income', label: 'Income', icon: '💵' },
    { path: '/budgets', label: 'Budgets', icon: '🎯' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>💰 Expense Tracker</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="close-sidebar"
          >
            ✕
          </button>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            {user?.profile_emoji || '👤'}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.firstname} {user?.lastname}</div>
            <div className="user-username">@{user?.username}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="logout-button"
          >
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Top bar */}
        <header className="top-bar">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="menu-toggle"
          >
            ☰
          </button>

          <h1 className="page-title">{title}</h1>

          <div className="user-menu">
            <div className="current-user">
              <span className="user-greeting">Hello, {user?.firstname}</span>
              <div className="user-avatar-small">
                {user?.profile_emoji || '👤'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}