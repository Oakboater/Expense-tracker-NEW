import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ExpensesPage from './pages/ExpensesPage'
import IncomePage from './pages/IncomePage'
import BudgetsPage from './pages/BudgetsPage'
import ReportsPage from './pages/ReportsPage'
import ProfilesPage from "./pages/ProfilesPage";
import ProtectedRoute from './components/ProtectedRoute'

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
            <IncomePage />
          </ProtectedRoute>
        } />

        <Route path="/budgets" element={
          <ProtectedRoute>
            <BudgetsPage />
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilesPage />  {/* ← FIXED: Changed to ProfilesPage */}
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App