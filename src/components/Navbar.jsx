import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaSun, FaMoon, FaUser, FaBell, FaBars, FaTimes,
  FaChevronDown, FaSignOutAlt
} from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import toast from 'react-hot-toast'
import logo from '/logo2.png'

const Navbar = () => {
  const user = useStore((s) => s.user)
  const userProfile = useStore((s) => s.userProfile)
  const setUserProfile = useStore((s) => s.setUserProfile)
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)

  const navigate = useNavigate()
  const location = useLocation()

  const [localProfile, setLocalProfile] = useState(null)
  const [unreadFeedback, setUnreadFeedback] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showMatchesDropdown, setShowMatchesDropdown] = useState(false)

  const isDark = theme === 'dark'
  const currentRole = userProfile?.role || localProfile?.role
  const isAdmin = currentRole?.toLowerCase() === 'admin'

  // Profile fetch
  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      if (!user) {
        setLocalProfile(null)
        return
      }
      if (userProfile) {
        setLocalProfile(userProfile)
        return
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .maybeSingle()

      if (!isMounted) return
      if (error) { console.error(error); return }
      if (data) {
        setLocalProfile(data)
        setUserProfile(data)
      }
    }

    fetchProfile()
    return () => { isMounted = false }
  }, [user, userProfile, setUserProfile])

  // Admin feedback notifications
  useEffect(() => {
    let isMounted = true
    if (!user || !isAdmin) {
      setUnreadFeedback([])
      return
    }

    const fetchUnread = async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('id, name, email, message, created_at, is_read')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
      if (error) { console.error(error); return }
      if (isMounted) setUnreadFeedback(data || [])
    }

    fetchUnread()

    const channel = supabase
      .channel('navbar-feedback')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, fetchUnread)
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [user, isAdmin])

  
const unreadCount = unreadFeedback.length

const handleFeedbackClick = async (fb, markOnly = false) => {
  try {
    const { error } = await supabase
      .from('feedback')
      .update({ is_read: true })
      .eq('id', fb.id)

    if (error) throw error

    // Update Zustand notification
    useStore.getState().markNotificationRead(String(fb.id))

    // Remove feedback from unread list
    setUnreadFeedback((prev) =>
      prev.filter((item) => item.id !== fb.id)
    )

    if (markOnly) {
      toast.success('Feedback marked as read')
      return
    }

    setShowNotifications(false)
    toast.success('Feedback marked as read')
    navigate('/dashboard')
  } catch (error) {
    toast.error(error.message || 'Unable to update feedback')
  }
}


  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) { toast.error(error.message); return }
    setLocalProfile(null)
    setUserProfile(null)
    setUnreadFeedback([])
    setShowNotifications(false)
    setMobileMenuOpen(false)
    toast.success('Logged out')
    navigate('/')
  }

  const handleMatchTab = (tab) => {
    setShowMatchesDropdown(false)
    setMobileMenuOpen(false)
    if (location.pathname === '/') {
      window.dispatchEvent(new CustomEvent('home-match-tab', { detail: tab }))
    } else {
      navigate('/', { state: { matchTab: tab } })
    }
  }

  const closeMobile = () => {
    setMobileMenuOpen(false)
    setShowMatchesDropdown(false)
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Tournaments', path: '/tournaments' },
    { name: 'About', path: '/about' }
  ]

  const showDashboard = user && ['admin', 'player'].includes(currentRole?.toLowerCase())

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isDark
        ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#262626]'
        : 'bg-white/95 backdrop-blur-md border-b border-gray-200'
    }`}>
      <div className="container-responsive">
        <div className="flex items-center justify-between py-4">

          {/* Logo */}
          <Link to="/" onClick={closeMobile} className="flex items-center gap-1 group">
            <img
    src={logo}
    alt="BOXaFIT Logo"
    className="w-auto h-14 md:h-16 object-contain group-hover:scale-110 transition-transform"
  />
  <h1 className="font-black text-xl md:text-2xl tracking-wider uppercase italic">
  <span className="gradient-text">BOX</span>
  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-400">
    a
  </span>
  <span className="gradient-text">FIT</span>
</h1>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`transition-colors ${
                  location.pathname === link.path
                    ? 'text-[#e11d48] font-semibold'
                    : isDark ? 'text-gray-300 hover:text-[#e11d48]' : 'text-gray-600 hover:text-[#e11d48]'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="relative">
              <button
                onClick={() => setShowMatchesDropdown(!showMatchesDropdown)}
                className={`flex items-center gap-2 transition-colors ${
                  isDark ? 'text-gray-300 hover:text-[#e11d48]' : 'text-gray-600 hover:text-[#e11d48]'
                }`}
              >
                Matches History
                <FaChevronDown className={`text-xs transition-transform ${showMatchesDropdown ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showMatchesDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 overflow-hidden ${
                      isDark ? 'bg-[#1f1f1f] border border-[#262626]' : 'bg-white border border-gray-200'
                    }`}
                  >
                    {[
                      { label: 'Previous Matches', tab: 'history' },
                      { label: 'Upcoming Matches', tab: 'upcoming' },
                      { label: 'Live Now', tab: 'live' }
                    ].map((item) => (
                      <button
                        key={item.tab}
                        onClick={() => handleMatchTab(item.tab)}
                        className={`block w-full text-left px-4 py-3 text-sm transition-colors ${
                          isDark ? 'text-gray-300 hover:bg-[#e11d48]/10 hover:text-[#e11d48]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#e11d48]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {showDashboard && (
              <Link
                to="/dashboard"
                className={`transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'text-[#e11d48] font-semibold'
                    : isDark ? 'text-gray-300 hover:text-[#e11d48]' : 'text-gray-600 hover:text-[#e11d48]'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-yellow-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
            </button>

            {user ? (
              <>
                {isAdmin && (
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`p-2 rounded-lg transition-colors relative ${
                        isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      aria-label="Notifications"
                    >
                      <FaBell className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-[#e11d48] text-white text-[10px] font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg shadow-lg z-50 ${
                            isDark ? 'bg-[#1f1f1f] border border-[#262626]' : 'bg-white border border-gray-200'
                          }`}
                        >
                          <div className={`p-4 border-b flex items-center justify-between ${
                            isDark ? 'border-[#262626]' : 'border-gray-200'
                          }`}>
                            <h3 className={`font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Feedback Notifications</h3>
                            <span className="text-xs text-[#e11d48] font-semibold">{unreadCount} Unread</span>
                          </div>
                          {unreadFeedback.length === 0 ? (
                            <p className={`p-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No new feedback</p>
                          ) : (
                            
unreadFeedback.map((fb) => (
  <div
    key={fb.id}
    className={`p-4 border-b ${
      isDark ? 'border-[#262626]' : 'border-gray-200'
    }`}
  >
    {/* Feedback Details */}
    <button
      type="button"
      onClick={() => handleFeedbackClick(fb)}
      className="w-full text-left"
    >
      <p className={`font-semibold text-sm ${
        isDark ? 'text-gray-200' : 'text-gray-800'
      }`}>
        {fb.name || 'New Feedback'}
      </p>

      <p className={`text-xs mt-1 ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {fb.email}
      </p>

      <p className={`text-sm mt-2 line-clamp-2 ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {fb.message}
      </p>
    </button>

    {/* Mark as Read */}
    <button
      type="button"
      onClick={() => handleFeedbackClick(fb, true)}
      className="mt-3 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-500 text-xs font-bold hover:bg-green-500/30 transition-colors"
    >
      ✓ Mark as Read
    </button>
  </div>
))

                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className={`flex items-center gap-2 p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <FaUser className="text-[#e11d48]" />
                  <span className={`text-sm font-semibold max-w-[100px] truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {userProfile?.full_name || localProfile?.full_name || user.email?.split('@')[0]}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isDark ? 'text-gray-300 hover:bg-[#e11d48]/10' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >Login</Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg bg-[#e11d48] text-white hover:bg-[#e11d48]/90 transition-colors"
                >Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-yellow-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className={`py-4 border-t space-y-3 ${isDark ? 'border-[#262626]' : 'border-gray-200'}`}>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={closeMobile}
                    className={`block px-4 py-2 rounded-lg transition-colors ${
                      isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                <div>
                  <button
                    onClick={() => setShowMatchesDropdown(!showMatchesDropdown)}
                    className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition-colors ${
                      isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Matches History
                    <FaChevronDown className={`transition-transform ${showMatchesDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showMatchesDropdown && (
                    <div className="pl-6 mt-1 space-y-1">
                      {[
                        { label: 'Previous Matches', tab: 'history' },
                        { label: 'Upcoming Matches', tab: 'upcoming' },
                        { label: 'Live Now', tab: 'live' }
                      ].map((item) => (
                        <button
                          key={item.tab}
                          onClick={() => handleMatchTab(item.tab)}
                          className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {showDashboard && (
                  <Link
                    to="/dashboard"
                    onClick={closeMobile}
                    className={`block px-4 py-2 rounded-lg transition-colors ${
                      isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                )}

                {user && isAdmin && (
                  <div className={`pt-4 border-t ${isDark ? 'border-[#262626]' : 'border-gray-200'}`}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                        isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="relative">
                        <FaBell size={19} />
                        {unreadCount > 0 && (
                          <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#e11d48] text-white text-[10px] flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </span>
                      Feedback Notifications
                    </button>
                    {showNotifications && (
                      <div className={`mt-2 rounded-lg p-3 space-y-2 ${isDark ? 'bg-[#1f1f1f]' : 'bg-gray-50'}`}>
                        {unreadFeedback.length === 0 ? (
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No new feedback</p>
                        ) : (
                          
unreadFeedback.map((fb) => (
  <div
    key={fb.id}
    className={`p-4 border-b ${
      isDark ? 'border-[#262626]' : 'border-gray-200'
    }`}
  >
    <button
      type="button"
      onClick={() => handleFeedbackClick(fb)}
      className="w-full text-left"
    >
      <p className={`font-semibold text-sm ${
        isDark ? 'text-gray-200' : 'text-gray-800'
      }`}>
        {fb.name || 'New Feedback'}
      </p>

      <p className={`text-xs mt-1 ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {fb.email}
      </p>

      <p className={`text-sm mt-2 line-clamp-2 ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {fb.message}
      </p>
    </button>

    <button
      type="button"
      onClick={() => handleFeedbackClick(fb, true)}
      className="mt-3 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-500 text-xs font-bold"
    >
      ✓ Mark as Read
    </button>
  </div>
))

                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className={`pt-4 border-t ${isDark ? 'border-[#262626]' : 'border-gray-200'}`}>
                  {user ? (
                    <div className="space-y-3">
                      <div className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <FaUser className="text-[#e11d48]" />
                        {userProfile?.full_name || localProfile?.full_name || user.email?.split('@')[0]}
                      </div>
                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors ${
                          isDark ? 'text-gray-300 hover:bg-[#e11d48]/10' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Link
                        to="/login"
                        onClick={closeMobile}
                        className={`flex-1 text-center py-3 rounded-lg font-semibold text-sm transition-colors ${
                          isDark ? 'border border-gray-600 text-gray-300 hover:bg-gray-800' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >Login</Link>
                      <Link
                        to="/signup"
                        onClick={closeMobile}
                        className="flex-1 text-center py-3 rounded-lg bg-[#e11d48] text-white font-semibold text-sm hover:bg-[#e11d48]/90 transition-colors"
                      >Sign Up</Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar