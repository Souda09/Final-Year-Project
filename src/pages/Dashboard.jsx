// import React, { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { motion } from 'framer-motion'
// import { supabase } from '../lib/supabase'
// import useStore from '../store/useStore'

// const Dashboard = () => {
//   const { user } = useStore()
//   const navigate = useNavigate()
//   const [profile, setProfile] = useState(null)

//   useEffect(() => {
//     if (user) {
//       supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
//         setProfile(data)
//         if (data?.status === 'approved') {
//           const roleMap = { admin: '/admin-dashboard', player: '/player-dashboard', judge: '/judge-dashboard', referee: '/referee-dashboard', jury: '/jury-dashboard' }
//           navigate(roleMap[data.role] || '/dashboard')
//         }
//       })
//     }
//   }, [user, navigate])

//   return (
//     <div className="min-h-screen py-20">
//       <div className="container-responsive">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8 text-center">
//           <h1 className="font-display text-3xl font-bold gradient-text mb-4">Welcome to PunchTrack</h1>
//           <p className="text-muted-foreground mb-6">Your application status: <span className="text-primary font-bold">{profile?.status || 'pending'}</span></p>
//           {profile?.status === 'pending' && (<div className="bg-primary/10 border border-primary/20 rounded-lg p-4"><p className="text-sm">Your application is being reviewed by administrators.</p></div>)}
//         </motion.div>
//       </div>
//     </div>
//   )
// }

// export default Dashboard

import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import { FaHome, FaLock, FaUser } from 'react-icons/fa'

const Dashboard = () => {
  const { user } = useStore()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data)
        setLoading(false)
        if (data?.status === 'approved') {
          const roleMap = {
            admin: '/admin-dashboard',
            player: '/player-dashboard',
            judge: '/judge-dashboard',
            referee: '/referee-dashboard',
            jury: '/jury-dashboard'
          }
          // user role ke liye koi dashboard nahi — /dashboard par hi rahe
          if (roleMap[data.role]) {
            navigate(roleMap[data.role])
          }
        }
      })
  }, [user, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#e11d48] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Simple user ya koi bhi jiska dashboard nahi
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container-responsive max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-[#e11d48]/20 flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-4xl text-[#e11d48]" />
          </div>
          <h1 className="font-display text-2xl font-bold gradient-text mb-2">
            Welcome, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Aapka account active hai. Home page par ja kar live matches, upcoming fixtures aur match history dekh sakte hain.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#e11d48] text-white rounded-lg font-display font-bold hover:scale-105 transition-transform"
          >
            <FaHome /> Go to Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard