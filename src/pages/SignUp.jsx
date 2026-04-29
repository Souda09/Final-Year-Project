import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaUser, FaEnvelope, FaLock, FaUserTag } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const SignUp = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'player' })
  const roles = [{ value: 'player', label: 'Player / Boxer' }, { value: 'judge', label: 'Judge' }, { value: 'referee', label: 'Referee' }, { value: 'jury', label: 'Jury Member' }]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email: formData.email, password: formData.password, options: { data: { full_name: formData.fullName, role: formData.role } } })
    if (error) toast.error(error.message)
    else { toast.success('Account created! Please wait for admin approval.'); navigate('/login') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8"><h2 className="font-display text-3xl font-bold gradient-text mb-2">Join PunchTrack</h2><p className="text-muted-foreground">Create your account to get started</p></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><label className="block text-sm font-medium mb-2">Full Name</label><div className="relative"><FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input type="text" name="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg border border-border focus:border-primary focus:outline-none" placeholder="Enter your full name" required /></div></div>
          <div><label className="block text-sm font-medium mb-2">Email</label><div className="relative"><FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg border border-border focus:border-primary focus:outline-none" placeholder="Enter your email" required /></div></div>
          <div><label className="block text-sm font-medium mb-2">Password</label><div className="relative"><FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input type="password" name="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg border border-border focus:border-primary focus:outline-none" placeholder="Create a password" required /></div></div>
          <div><label className="block text-sm font-medium mb-2">Role</label><div className="relative"><FaUserTag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><select name="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg border border-border focus:border-primary focus:outline-none">{roles.map(role => (<option key={role.value} value={role.value}>{role.label}</option>))}</select></div></div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-display font-bold hover:scale-105 transition-transform">{loading ? 'Creating Account...' : 'Sign Up'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link></p>
      </motion.div>
    </div>
  )
}

export default SignUp