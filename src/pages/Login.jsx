import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLock } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const inputValue = formData.email.trim()
    const finalEmail = inputValue.includes('@')
      ? inputValue
      : `${inputValue}@punchtrack.com`

    const { error } = await supabase.auth.signInWithPassword({
      email: finalEmail,
      password: formData.password
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Login successful!')
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-bold gradient-text mb-2">Welcome Back</h2>
          <p className="text-muted-foreground">Login to your PunchTrack account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email / CNIC */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Email / CNIC</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}


className="w-full pl-10 pr-4 py-2 bg-secondary text-foreground rounded-lg border border-border focus:border-primary focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-300"
placeholder="Enter your email or CNIC"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}


className="w-full pl-10 pr-4 py-2 bg-secondary text-foreground rounded-lg border border-border focus:border-primary focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-300"
placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-display font-bold hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Login