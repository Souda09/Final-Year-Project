import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaClipboardList, FaExclamationTriangle, FaShieldAlt, FaCalendarCheck } from 'react-icons/fa'
import { GiWhistle, GiCheckeredFlag } from 'react-icons/gi' // Using Game Icons
import useStore from '../store/useStore'

const RefereeDashboard = () => {
  const { theme } = useStore()
  const [stats] = useState({
    totalAssigned: 6,
    completed: 4,
    upcoming: 2
  })

  const upcomingMatches = [
    { id: 1, fighter1: "Mike Tyson", fighter2: "Evander Holyfield", date: "2024-12-15", venue: "Las Vegas Arena", round: 12 },
    { id: 2, fighter1: "Canelo Alvarez", fighter2: "GGG Golovkin", date: "2024-12-20", venue: "Madison Square Garden", round: 12 }
  ]

  const statCards = [
    { icon: GiWhistle, label: 'Assigned Matches', value: stats.totalAssigned, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: GiCheckeredFlag, label: 'Completed', value: stats.completed, color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: FaClipboardList, label: 'Upcoming', value: stats.upcoming, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ]

  return (
    <div className="min-h-screen py-20">
      <div className="container-responsive">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`font-display text-3xl sm:text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Referee Dashboard
          </h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Oversee matches and ensure fair play
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bg} rounded-xl p-4 sm:p-6 backdrop-blur-sm ${theme === 'dark' ? 'border border-gray-800' : 'border border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`text-2xl sm:text-3xl ${stat.color}`} />
                <span className={`text-xl sm:text-2xl font-display font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </span>
              </div>
              <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-xl p-4 sm:p-6 mb-8 ${theme === 'dark' ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'}`}
        >
          <h2 className={`font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Upcoming Matches
          </h2>
          <div className="space-y-4">
            {upcomingMatches.map((match) => (
              <div key={match.id} className={`border rounded-lg p-4 transition-all hover:scale-[1.02] ${
                theme === 'dark' ? 'border-gray-800 hover:border-[#e11d48]' : 'border-gray-200 hover:border-[#e11d48]'
              }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className={`font-display font-bold text-base sm:text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {match.fighter1} vs {match.fighter2}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(match.date).toLocaleDateString()} • {match.venue} • {match.round} Rounds
                    </p>
                  </div>
                  <button className="px-4 sm:px-6 py-2 bg-[#e11d48] text-white rounded-lg hover:scale-105 transition-transform text-sm sm:text-base whitespace-nowrap">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-xl p-4 sm:p-6 ${theme === 'dark' ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'}`}
        >
          <h2 className={`font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Referee Guidelines
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className="font-display font-bold text-[#e11d48] mb-2 flex items-center gap-2">
                <FaExclamationTriangle /> Safety First
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Always prioritize fighter safety. Stop the fight when necessary</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className="font-display font-bold text-[#e11d48] mb-2 flex items-center gap-2">
                <FaShieldAlt /> Fair Play
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Enforce rules consistently and fairly for both fighters</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className="font-display font-bold text-[#e11d48] mb-2 flex items-center gap-2">
                <FaCalendarCheck /> Count System
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Proper 10-count for knockdowns. Mandatory 8-count for safety</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className="font-display font-bold text-[#e11d48] mb-2 flex items-center gap-2">
                <FaExclamationTriangle /> Foul Calls
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Issue warnings, deduct points, or disqualify for severe fouls</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RefereeDashboard