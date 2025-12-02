import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ExpensesPage from './pages/ExpensesPage'
import CategoriesManager from './components/CategoriesManager'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css' // We'll create this

// Placeholder pages for now - RENAMED to avoid conflicts
const IncomePagePlaceholder = () => (
  <div style={{ padding: '24px' }}>
    <h1>Income Page</h1>
    <p>Coming soon...</p>
  </div>
)

const CategoriesPagePlaceholder = () => (
  <div style={{ padding: '24px' }}>
    <h1>Categories Page</h1>
    <p>Coming soon...</p>
  </div>
)

const ProfilePagePlaceholder = () => (
  <div style={{ padding: '24px' }}>
    <h1>Profile Page</h1>
    <p>Coming soon...</p>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/expenses" element={
          <ProtectedRoute>
            <ExpensesPage />
          </ProtectedRoute>
        } />

        <Route path="/income" element={
          <ProtectedRoute>
            <IncomePagePlaceholder />
          </ProtectedRoute>
        } />

        <Route path="/categories" element={
          <ProtectedRoute>
            <CategoriesPagePlaceholder />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePagePlaceholder />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App