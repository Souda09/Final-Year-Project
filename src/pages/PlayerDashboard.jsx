import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaTrophy, FaChartLine, FaMedal, FaCalendarAlt } from 'react-icons/fa'
import { GiProgression } from 'react-icons/gi'
import useStore from '../store/useStore'
import MatchCard from '../components/MatchCard'

const PlayerDashboard = () => {
  const { theme } = useStore()
  const [stats] = useState({
    totalMatches: 24,
    wins: 18,
    losses: 5,
    draws: 1,
    knockouts: 12
  })

  const upcomingMatches = [
    { fighter1: { name: "You" }, fighter2: { name: "John Doe" }, score1: 0, score2: 0, round: 1, date: '2024-12-20', status: 'scheduled' },
    { fighter1: { name: "You" }, fighter2: { name: "Mike Smith" }, score1: 0, score2: 0, round: 1, date: '2024-12-25', status: 'scheduled' }
  ]

  const recentMatches = [
    { fighter1: { name: "You" }, fighter2: { name: "Tom Brown" }, score1: 95, score2: 92, round: 10, winner: "You", status: "completed" },
    { fighter1: { name: "You" }, fighter2: { name: "James Wilson" }, score1: 88, score2: 94, round: 10, winner: "James Wilson", status: "completed" }
  ]

  const statCards = [
    { icon: FaTrophy, label: 'Total Matches', value: stats.totalMatches, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: FaMedal, label: 'Wins', value: stats.wins, color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: FaChartLine, label: 'Win Rate', value: `${((stats.wins / stats.totalMatches) * 100).toFixed(1)}%`, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { icon: GiProgression, label: 'Knockouts', value: stats.knockouts, color: 'text-red-500', bg: 'bg-red-500/10' },
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
            Player Dashboard
          </h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Track your boxing career and upcoming matches
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
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

        {/* Upcoming Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className={`font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Upcoming Matches
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingMatches.map((match, index) => (
              <MatchCard key={index} match={match} />
            ))}
          </div>
        </motion.div>

        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className={`font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Recent Matches
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentMatches.map((match, index) => (
              <MatchCard key={index} match={match} isWinner={match.winner === "You"} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PlayerDashboard