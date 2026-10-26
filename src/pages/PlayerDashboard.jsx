// import React, { useState } from 'react'
// import { motion } from 'framer-motion'
// import { FaTrophy, FaChartLine, FaMedal, FaCalendarAlt } from 'react-icons/fa'
// import { GiProgression } from 'react-icons/gi'
// import useStore from '../store/useStore'
// import MatchCard from '../components/MatchCard'

// const PlayerDashboard = () => {
//   const { theme } = useStore()
//   const [stats] = useState({
//     totalMatches: 24,
//     wins: 18,
//     losses: 5,
//     draws: 1,
//     knockouts: 12
//   })

//   const upcomingMatches = [
//     { fighter1: { name: "You" }, fighter2: { name: "John Doe" }, score1: 0, score2: 0, round: 1, date: '2024-12-20', status: 'scheduled' },
//     { fighter1: { name: "You" }, fighter2: { name: "Mike Smith" }, score1: 0, score2: 0, round: 1, date: '2024-12-25', status: 'scheduled' }
//   ]

//   const recentMatches = [
//     { fighter1: { name: "You" }, fighter2: { name: "Tom Brown" }, score1: 95, score2: 92, round: 10, winner: "You", status: "completed" },
//     { fighter1: { name: "You" }, fighter2: { name: "James Wilson" }, score1: 88, score2: 94, round: 10, winner: "James Wilson", status: "completed" }
//   ]

//   const statCards = [
//     { icon: FaTrophy, label: 'Total Matches', value: stats.totalMatches, color: 'text-blue-500', bg: 'bg-blue-500/10' },
//     { icon: FaMedal, label: 'Wins', value: stats.wins, color: 'text-green-500', bg: 'bg-green-500/10' },
//     { icon: FaChartLine, label: 'Win Rate', value: `${((stats.wins / stats.totalMatches) * 100).toFixed(1)}%`, color: 'text-purple-500', bg: 'bg-purple-500/10' },
//     { icon: GiProgression, label: 'Knockouts', value: stats.knockouts, color: 'text-red-500', bg: 'bg-red-500/10' },
//   ]

//   return (
//     <div className="min-h-screen py-20">
//       <div className="container-responsive">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <h1 className={`font-display text-3xl sm:text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//             Player Dashboard
//           </h1>
//           <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
//             Track your boxing career and upcoming matches
//           </p>
//         </motion.div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
//           {statCards.map((stat, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className={`${stat.bg} rounded-xl p-4 sm:p-6 backdrop-blur-sm ${theme === 'dark' ? 'border border-gray-800' : 'border border-gray-200'}`}
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <stat.icon className={`text-2xl sm:text-3xl ${stat.color}`} />
//                 <span className={`text-xl sm:text-2xl font-display font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   {stat.value}
//                 </span>
//               </div>
//               <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
//             </motion.div>
//           ))}
//         </div>

//         {/* Upcoming Matches */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className="mb-8"
//         >
//           <h2 className={`font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//             Upcoming Matches
//           </h2>
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {upcomingMatches.map((match, index) => (
//               <MatchCard key={index} match={match} />
//             ))}
//           </div>
//         </motion.div>

//         {/* Recent Matches */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//         >
//           <h2 className={`font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//             Recent Matches
//           </h2>
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {recentMatches.map((match, index) => (
//               <MatchCard key={index} match={match} isWinner={match.winner === "You"} />
//             ))}
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   )
// }

// export default PlayerDashboard

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaUser, FaHistory, FaCalendarAlt, FaSignOutAlt,
  FaTrophy, FaMapMarkerAlt, FaFistRaised, FaCheckCircle, FaTimesCircle,
  FaFileMedical, FaEye
} from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import toast from 'react-hot-toast'

const PlayerDashboard = () => {
  const { user, theme } = useStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [playerRecord, setPlayerRecord] = useState(null)
  const [profile, setProfile] = useState(null)
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [historyMatches, setHistoryMatches] = useState([])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchAll()
  }, [user])

  const fetchAll = async () => {
    setLoading(true)
    try {
      // 1. Profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(prof)

      // 2. Player record (players table, user_id se linked)
      const { data: player, error: pErr } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (pErr || !player) {
toast.error('Player record not found. Please contact the administrator.')
        setLoading(false)
        return
      }
      setPlayerRecord(player)

      // 3. Upcoming matches (scheduled) jisme ye player hai
      const { data: upcoming } = await supabase
        .from('matches')
        .select(`
          *,
          tournaments(title, venue),
          player1:players!matches_player1_id_fkey(id, full_name, club_name),
          player2:players!matches_player2_id_fkey(id, full_name, club_name)
        `)
        .or(`player1_id.eq.${player.id},player2_id.eq.${player.id}`)
        .eq('status', 'scheduled')
        .order('match_date', { ascending: true })
      setUpcomingMatches(upcoming || [])

      // 4. History matches (completed)
      const { data: history } = await supabase
        .from('matches')
        .select(`
          *,
          tournaments(title, venue),
          player1:players!matches_player1_id_fkey(id, full_name, club_name),
          player2:players!matches_player2_id_fkey(id, full_name, club_name)
        `)
        .or(`player1_id.eq.${player.id},player2_id.eq.${player.id}`)
        .eq('status', 'completed')
        .order('match_date', { ascending: false })
      setHistoryMatches(history || [])
    } catch (e) {
      console.error(e)
toast.error('Unable to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  // Stats calculate karein history se
  const stats = React.useMemo(() => {
    if (!playerRecord) return { total: 0, wins: 0, losses: 0, draws: 0 }
    let wins = 0, losses = 0, draws = 0
    historyMatches.forEach(m => {
      if (!m.winner_id) { draws++; return }
      if (m.winner_id === playerRecord.id) wins++
      else losses++
    })
    return { total: historyMatches.length, wins, losses, draws }
  }, [historyMatches, playerRecord])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#e11d48] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!playerRecord) {
    return (
      <div className={`min-h-screen py-20 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md px-4">
          <FaFistRaised className="text-5xl text-[#e11d48] mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">
  Player Record Not Found
</h2>
<p className="text-muted-foreground mb-6">
  Your player registration is not complete. Please contact the administrator to complete your registration.
</p>
          
<button
  onClick={handleLogout}
  className="px-4 py-2 rounded-lg bg-[#e11d48] text-white hover:bg-[#e11d48]/90 transition-colors flex items-center gap-2 text-sm font-bold"
>
  <FaSignOutAlt /> Logout
</button>

        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen py-8 sm:py-12 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container-responsive max-w-5xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className={`font-display text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            My Dashboard
          </h1>
          
<button
  onClick={handleLogout}
  className="px-4 py-2 rounded-lg bg-[#e11d48] text-white hover:bg-[#e11d48]/90 transition-colors flex items-center gap-2 text-sm font-bold"
>
  <FaSignOutAlt /> Logout
</button>

        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass rounded-2xl p-5 sm:p-6 mb-6 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'}`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#e11d48]/30 to-[#fbbf24]/30 flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#e11d48]/30">
  {playerRecord.photo_url ? (
    <img
      src={playerRecord.photo_url}
      alt={playerRecord.full_name}
      className="w-full h-full object-cover"
    />
  ) : (
    <FaUser className="text-4xl text-[#e11d48]" />
  )}
</div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className={`font-display text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {playerRecord.full_name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {playerRecord.club_name || 'No Club'} • {playerRecord.weight} KG • {playerRecord.stance}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                CNIC: {playerRecord.cnic} • Experience: <span className="capitalize">{playerRecord.experience_level}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  playerRecord.clearance_status === 'passed'
                    ? 'bg-green-500/20 text-green-500'
                    : playerRecord.clearance_status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-red-500/20 text-red-500'
                }`}>
                  Medical: {playerRecord.clearance_status}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-500">
                  {playerRecord.gender}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* My Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`glass rounded-2xl p-5 sm:p-6 mb-6 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'}`}
        >
          <h2 className={`font-display text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaFileMedical className="text-[#e11d48]" /> My Documents
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Clearance Status */}
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
              <p className="text-xs text-muted-foreground mb-1">Medical Clearance</p>
              <p className={`font-display font-bold capitalize ${
                playerRecord.clearance_status === 'passed' ? 'text-green-500'
                : playerRecord.clearance_status === 'pending' ? 'text-yellow-500'
                : 'text-red-500'
              }`}>
                {playerRecord.clearance_status === 'passed' && '✅ '}
                {playerRecord.clearance_status === 'pending' && '⏳ '}
                {playerRecord.clearance_status === 'failed' && '❌ '}
                {playerRecord.clearance_status || 'N/A'}
              </p>
            </div>

            {/* Checkup Date */}
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
              <p className="text-xs text-muted-foreground mb-1">Checkup Date</p>
              <p className={`font-display font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {playerRecord.checkup_date ? new Date(playerRecord.checkup_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
            </div>

            {/* Doctor Name */}
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
              <p className="text-xs text-muted-foreground mb-1">Doctor</p>
              <p className={`font-display font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {playerRecord.doctor_name || 'N/A'}
              </p>
            </div>

            {/* Fit for Combat */}
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
              <p className="text-xs text-muted-foreground mb-1">Fit for Combat</p>
              <p className={`font-display font-bold ${playerRecord.fit_for_combat ? 'text-green-500' : 'text-red-500'}`}>
                {playerRecord.fit_for_combat ? '✅ Yes' : '❌ No'}
              </p>
            </div>

            {/* CNIC */}
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
              <p className="text-xs text-muted-foreground mb-1">CNIC</p>
              <p className={`font-display font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {playerRecord.cnic || 'N/A'}
              </p>
            </div>

            {/* Medical Certificate Link */}
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
              <p className="text-xs text-muted-foreground mb-1">Medical Certificate</p>
              {playerRecord.medical_certificate_url ? (
                <div className="flex flex-wrap gap-2">
                  <a
                    href={playerRecord.medical_certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#e11d48] text-white rounded text-xs font-bold hover:scale-105 transition-transform"
                  >
                    <FaEye /> View
                  </a>
                  <a
                    href={playerRecord.medical_certificate_url}
                    download
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:scale-105 transition-transform"
                  >
                    <FaFileMedical /> Download
                  </a>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Not uploaded</p>
              )}
            </div>
          </div>
        </motion.div>
                
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'Total Matches', value: stats.total, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Wins', value: stats.wins, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Losses', value: stats.losses, color: 'text-red-500', bg: 'bg-red-500/10' },
            { label: 'Draws', value: stats.draws, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${s.bg} rounded-xl p-4 ${theme === 'dark' ? 'border border-gray-800' : 'border border-gray-200'}`}
            >
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{s.label}</p>
              <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className={`font-display text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaCalendarAlt className="text-[#e11d48]" /> Upcoming Matches
          </h2>
          {upcomingMatches.length === 0 ? (
            <div className="glass rounded-xl p-6 text-center text-muted-foreground text-sm">
No upcoming matches available. Matches scheduled by the administrator will appear here.            </div>
          ) : (
            upcomingMatches.map(m => {
              const isRed = m.player1_id === playerRecord.id
              const opponent = isRed ? m.player2 : m.player1
              return (
                <div
                  key={m.id}
                  className={`glass rounded-xl p-4 mb-3 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <FaTrophy className="text-[#e11d48]" /> {m.tournaments?.title || '—'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#fbbf24]/20 text-[#fbbf24] font-bold">
                      {m.weight_class ? `${m.weight_class} KG` : '—'}
                    </span>
                  </div>
                  <p className={`font-display font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    You ({isRed ? '🔴 RED' : '🔵 BLUE'}) vs {opponent?.full_name || 'TBD'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {opponent?.club_name || ''}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border flex-wrap gap-1">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt />
                      {m.match_date ? new Date(m.match_date).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : 'TBD'}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt /> {m.venue || m.tournaments?.venue || '—'}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </motion.div>

        {/* Match History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className={`font-display text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaHistory className="text-[#e11d48]" /> Match History
          </h2>
          {historyMatches.length === 0 ? (
            <div className="glass rounded-xl p-6 text-center text-muted-foreground text-sm">
No match history available. Your match records will appear here once you have competed in a match.            </div>
          ) : (
            historyMatches.map(m => {
              const isRed = m.player1_id === playerRecord.id
              const opponent = isRed ? m.player2 : m.player1
              const isWinner = m.winner_id === playerRecord.id
              const isDraw = !m.winner_id
              return (
                <div
                  key={m.id}
                  className={`glass rounded-xl p-4 mb-3 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <FaTrophy className="text-[#e11d48]" /> {m.tournaments?.title || '—'}
                    </span>
                    <div className="flex items-center gap-2">
                      {isDraw ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-500">DRAW</span>
                      ) : isWinner ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-500 flex items-center gap-1">
                          <FaCheckCircle /> WON
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-500 flex items-center gap-1">
                          <FaTimesCircle /> LOST
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`font-display font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    You ({isRed ? '🔴' : '🔵'}) vs {opponent?.full_name || '—'} ({isRed ? '🔵' : '🔴'})
                  </p>
                  <p className="text-xs text-muted-foreground">{opponent?.club_name || ''}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border flex-wrap gap-1">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt />
                      {m.match_date ? new Date(m.match_date).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      }) : '—'}
                    </span>
                    <span className="font-bold">
                      Score: {m.score1 ?? 0} - {m.score2 ?? 0}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </motion.div>

      </div>
    </div>
  )
}

export default PlayerDashboard