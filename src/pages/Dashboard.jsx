import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'

const Dashboard = () => {
  const { user } = useStore()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        setProfile(data)
        if (data?.status === 'approved') {
          const roleMap = { admin: '/admin-dashboard', player: '/player-dashboard', judge: '/judge-dashboard', referee: '/referee-dashboard', jury: '/jury-dashboard' }
          navigate(roleMap[data.role] || '/dashboard')
        }
      })
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen py-20">
      <div className="container-responsive">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8 text-center">
          <h1 className="font-display text-3xl font-bold gradient-text mb-4">Welcome to PunchTrack</h1>
          <p className="text-muted-foreground mb-6">Your application status: <span className="text-primary font-bold">{profile?.status || 'pending'}</span></p>
          {profile?.status === 'pending' && (<div className="bg-primary/10 border border-primary/20 rounded-lg p-4"><p className="text-sm">Your application is being reviewed by administrators.</p></div>)}
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard