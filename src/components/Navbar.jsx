import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSun, FaMoon, FaUser, FaBell, FaBars, FaTimes } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import toast from 'react-hot-toast'
import logo from '/logo.png'

const Navbar = ({ toggleTheme, theme }) => {
  const { user, notifications } = useStore()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    navigate('/')
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/tournaments', label: 'Tournaments' },
    { to: '/about', label: 'About' },
    ...(user ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
  ]

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#262626]' 
        : 'bg-white/95 backdrop-blur-md border-b border-gray-200'
    }`}>
      <div className="container-responsive">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            <img 
              src={logo} 
              alt="PunchTrack Logo" 
              className="w-10 h-10 md:w-15 md:h-15 object-contain group-hover:scale-110 transition-transform"
            />
            <h1 className={`font-display text-xl md:text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              PunchTrack
            </h1>
          </Link>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className={`transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-[#e11d48]' : 'text-gray-600 hover:text-[#e11d48]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-yellow-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {theme === 'dark' ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
            </button>

            {user ? (
              <>
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)} 
                    className={`p-2 rounded-lg transition-colors relative ${
                      theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <FaBell className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-[#e11d48] rounded-full animate-pulse"></span>
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg z-50 ${
                          theme === 'dark' ? 'bg-[#1f1f1f] border border-[#262626]' : 'bg-white border border-gray-200'
                        }`}
                      >
                        <div className={`p-4 border-b ${theme === 'dark' ? 'border-[#262626]' : 'border-gray-200'}`}>
                          <h3 className={`font-display font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className={`p-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No notifications</p>
                          ) : (
                            notifications.map((notif) => (
                              <div key={notif.id} className={`p-4 border-b ${theme === 'dark' ? 'border-[#262626] hover:bg-[#e11d48]/10' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{notif.messa }</p>
                                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {new Date(notif.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="relative group">
                  <button className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}>
                    <FaUser className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
                    <span className={`max-w-[100px] truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {user.email?.split('@')[0]}
                    </span>
                  </button>
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all ${
                    theme === 'dark' ? 'bg-[#1f1f1f] border border-[#262626]' : 'bg-white border border-gray-200'
                  }`}>
                    <button 
                      onClick={handleLogout} 
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        theme === 'dark' ? 'text-gray-300 hover:bg-[#e11d48]/10' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 rounded-lg bg-[#e11d48] text-white hover:bg-[#e11d48]/90 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className={`md:hidden p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }} 
              className="md:hidden overflow-hidden"
            >
              <div className={`py-4 border-t space-y-3 ${
                theme === 'dark' ? 'border-[#262626]' : 'border-gray-200'
              }`}>
                {navLinks.map((link) => (
                  <Link 
                    key={link.to} 
                    to={link.to} 
                    onClick={() => setMobileMenuOpen(false)} 
                    className={`block px-4 py-2 rounded-lg transition-colors ${
                      theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className={`pt-4 border-t ${
                  theme === 'dark' ? 'border-[#262626]' : 'border-gray-200'
                }`}>
                  <button 
                    onClick={toggleTheme} 
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {theme === 'dark' ? <FaSun /> : <FaMoon />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>

                  {user ? (
                    <button 
                      onClick={handleLogout} 
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Logout
                    </button>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2 rounded-lg transition-colors ${
                        theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                      }`}>Login</Link>
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 bg-[#e11d48] text-white rounded-lg transition-colors text-center">Sign Up</Link>
                    </>
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