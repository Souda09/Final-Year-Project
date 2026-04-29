import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaGavel, FaClipboardCheck, FaFileAlt, FaCommentDots, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import useStore from '../store/useStore'

const JuryDashboard = () => {
  const { theme } = useStore()
  const [disputes, setDisputes] = useState([
    { id: 1, match: "Tyson vs Holyfield", description: "Low blow in round 8", filedBy: "Team Tyson", status: "pending", date: "2024-12-10" },
    { id: 2, match: "Alvarez vs Golovkin", description: "Headbutt controversy", filedBy: "Team Golovkin", status: "pending", date: "2024-12-12" }
  ])
  const [resolvedDisputes] = useState([
    { id: 3, match: "Pacquiao vs Mayweather", decision: "Approved", date: "2024-12-05" }
  ])

  const stats = {
    totalDisputes: 5,
    pending: 2,
    resolved: 3
  }

  const statCards = [
    { icon: FaGavel, label: 'Total Disputes', value: stats.totalDisputes, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: FaFileAlt, label: 'Pending', value: stats.pending, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { icon: FaClipboardCheck, label: 'Resolved', value: stats.resolved, color: 'text-green-500', bg: 'bg-green-500/10' },
  ]

  const handleResolveDispute = (disputeId, decision) => {
    setDisputes(disputes.filter(d => d.id !== disputeId))
    toast.success(`Dispute ${decision}`)
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container-responsive">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`font-display text-3xl sm:text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Jury Dashboard
          </h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Review disputes and ensure fair competition
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
            Pending Disputes
          </h2>
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <div key={dispute.id} className={`border rounded-lg p-4 ${
                theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <p className={`font-display font-bold text-base sm:text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Match: {dispute.match}
                    </p>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {dispute.description}
                    </p>
                    <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Filed by: {dispute.filedBy} • {new Date(dispute.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs whitespace-nowrap">
                    Pending Review
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleResolveDispute(dispute.id, 'approved')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:scale-105 transition-transform"
                  >
                    <FaCheckCircle className="inline mr-1" /> Approve
                  </button>
                  <button
                    onClick={() => handleResolveDispute(dispute.id, 'rejected')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:scale-105 transition-transform"
                  >
                    <FaTimesCircle className="inline mr-1" /> Reject
                  </button>
                  <button className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                    theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}>
                    <FaCommentDots /> Review Details
                  </button>
                </div>
              </div>
            ))}
            {disputes.length === 0 && (
              <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                No pending disputes
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-xl p-4 sm:p-6 ${theme === 'dark' ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'}`}
        >
          <h2 className={`font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Recently Resolved
          </h2>
          <div className="space-y-3">
            {resolvedDisputes.map((dispute) => (
              <div key={dispute.id} className={`border rounded-lg p-3 ${
                theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <p className={`font-display font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {dispute.match}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Decision: <span className="text-green-500">{dispute.decision}</span>
                    </p>
                  </div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {new Date(dispute.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default JuryDashboard