import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import useStore from './store/useStore'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import About from './pages/About'
import Tournaments from './pages/Tournaments'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import PlayerDashboard from './pages/PlayerDashboard'
import JudgeDashboard from './pages/JudgeDashboard'
import RefereeDashboard from './pages/RefereeDashboard'
import JuryDashboard from './pages/JuryDashboard'

function App() {
  const { user, setUser, theme, toggleTheme } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [theme])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [setUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#e11d48] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground font-display">Loading PunchTrack...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navbar toggleTheme={toggleTheme} theme={theme} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/admin-dashboard" element={user ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/player-dashboard" element={user ? <PlayerDashboard /> : <Navigate to="/login" />} />
          <Route path="/judge-dashboard" element={user ? <JudgeDashboard /> : <Navigate to="/login" />} />
          <Route path="/referee-dashboard" element={user ? <RefereeDashboard /> : <Navigate to="/login" />} />
          <Route path="/jury-dashboard" element={user ? <JuryDashboard /> : <Navigate to="/login" />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: theme === 'dark' ? '#1f1f1f' : '#ffffff',
              color: theme === 'dark' ? '#ffffff' : '#1f2937',
              border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
            }
          }}
        />
      </div>
    </Router>
  )
}

export default App