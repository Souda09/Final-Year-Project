import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaGavel, FaClipboardList, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa'
import useStore from '../store/useStore'

const JudgeDashboard = () => {
  const { theme } = useStore()
  const [stats] = useState({
    totalAssigned: 8,
    completed: 5,
    pending: 3
  })

  const pendingMatches = [
    { id: 1, fighter1: "Mike Tyson", fighter2: "Evander Holyfield", date: "2024-12-15", venue: "Las Vegas Arena" },
    { id: 2, fighter1: "Canelo Alvarez", fighter2: "GGG Golovkin", date: "2024-12-20", venue: "Madison Square Garden" },
    { id: 3, fighter1: "Manny Pacquiao", fighter2: "Floyd Mayweather", date: "2024-12-25", venue: "Wembley Stadium" }
  ]

  const statCards = [
    { icon: FaGavel, label: 'Assigned Matches', value: stats.totalAssigned, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: FaCheckCircle, label: 'Completed', value: stats.completed, color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: FaHourglassHalf, label: 'Pending', value: stats.pending, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
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
            Judge Dashboard
          </h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Score matches and track your judging assignments
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
            Pending Matches to Judge
          </h2>
          <div className="space-y-4">
            {pendingMatches.map((match) => (
              <div key={match.id} className={`border rounded-lg p-4 transition-all hover:scale-[1.02] ${
                theme === 'dark' ? 'border-gray-800 hover:border-[#e11d48]' : 'border-gray-200 hover:border-[#e11d48]'
              }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className={`font-display font-bold text-base sm:text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {match.fighter1} vs {match.fighter2}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(match.date).toLocaleDateString()} • {match.venue}
                    </p>
                  </div>
                  <button className="px-4 sm:px-6 py-2 bg-[#e11d48] text-white rounded-lg hover:scale-105 transition-transform text-sm sm:text-base whitespace-nowrap">
                    Score Match
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
            Scoring Guidelines
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className="font-display font-bold text-[#e11d48] mb-2">10-Point Must System</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Winner of round gets 10 points, loser gets 9 or less</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className="font-display font-bold text-[#e11d48] mb-2">Scoring Criteria</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Clean punching, effective aggression, ring generalship, defense</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className="font-display font-bold text-[#e11d48] mb-2">Knockdowns</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Deduct 1 point for each knockdown</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className="font-display font-bold text-[#e11d48] mb-2">Fouls</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Point deductions for intentional fouls</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default JudgeDashboard