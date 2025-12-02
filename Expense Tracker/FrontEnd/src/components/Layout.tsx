import { ReactNode, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../api/client'
import '../App.css'

interface LayoutProps {
  children: ReactNode
  title?: string
}

export default function Layout({ children, title = 'Expense Tracker' }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    authApi.logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/expenses', label: 'Expenses', icon: '💰' },
    { path: '/income', label: 'Income', icon: '💵' },
    { path: '/categories', label: 'Categories', icon: '🏷️' },
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
            className="btn-outline"
            style={{ padding: '4px 8px', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={handleLogout}
              className="sidebar-link"
              style={{ color: '#dc2626' }}
            >
              <span className="sidebar-icon">🚪</span>
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Top bar */}
        <header className="top-bar">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-outline"
            style={{ padding: '8px 12px' }}
          >
            ☰
          </button>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome!</span>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#2563eb' }}>👤</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="content">
          {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  )
}