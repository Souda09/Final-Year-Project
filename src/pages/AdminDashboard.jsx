import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import { FaUsers, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaEye, FaUserCheck, FaUserClock } from 'react-icons/fa'
// Remove FaBoxingGlove, use simple icon instead
import { GiProgression } from 'react-icons/gi'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { addNotification, theme } = useStore()
  const [applications, setApplications] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApplications: 0,
    approvedUsers: 0,
    rejectedUsers: 0
  })
  const [activeTab, setActiveTab] = useState('applications')

  useEffect(() => {
    fetchApplications()
    fetchUsers()
  }, [])

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'pending')
    if (!error && data) setApplications(data)
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*')
    if (!error && data) {
      setUsers(data)
      setStats({
        totalUsers: data.length,
        pendingApplications: data.filter(u => u.status === 'pending').length,
        approvedUsers: data.filter(u => u.status === 'approved').length,
        rejectedUsers: data.filter(u => u.status === 'rejected').length
      })
    }
  }

  const handleApplication = async (userId, status) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: status })
      .eq('id', userId)

    if (!error) {
      toast.success(`Application ${status}`)
      fetchApplications()
      fetchUsers()
      
      await supabase.from('notifications').insert([{
        user_id: userId,
        message: `Your application has been ${status}`,
        type: status
      }])
      
      addNotification({
        user_id: userId,
        message: `Your application has been ${status}`,
        type: status
      })
    } else {
      toast.error('Error updating application')
    }
  }

  const statCards = [
    { icon: FaUsers, label: 'Total Users', value: stats.totalUsers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: FaUserClock, label: 'Pending', value: stats.pendingApplications, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { icon: FaUserCheck, label: 'Approved', value: stats.approvedUsers, color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: FaTimesCircle, label: 'Rejected', value: stats.rejectedUsers, color: 'text-red-500', bg: 'bg-red-500/10' },
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
            Admin Dashboard
          </h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Manage users, tournaments, and applications
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

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-6 overflow-x-auto">
          {['applications', 'users', 'tournaments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-2 rounded-lg font-display font-semibold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#e11d48] text-white'
                  : theme === 'dark'
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Pending Applications */}
        {activeTab === 'applications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 sm:p-6 ${theme === 'dark' ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'}`}
          >
            <h2 className={`font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Pending Applications
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
                    <th className="text-left py-3 px-3 sm:px-4">Name</th>
                    <th className="text-left py-3 px-3 sm:px-4">Email</th>
                    <th className="text-left py-3 px-3 sm:px-4">Role</th>
                    <th className="text-left py-3 px-3 sm:px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
                      <td className="py-3 px-3 sm:px-4">{app.full_name}</td>
                      <td className="py-3 px-3 sm:px-4">{app.email}</td>
                      <td className="py-3 px-3 sm:px-4 capitalize">{app.role}</td>
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApplication(app.id, 'approved')}
                            className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                          >
                            <FaCheckCircle />
                          </button>
                          <button
                            onClick={() => handleApplication(app.id, 'rejected')}
                            className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <FaTimesCircle />
                          </button>
                          <button className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors">
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {applications.length === 0 && (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  No pending applications
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Users List */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 sm:p-6 ${theme === 'dark' ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'}`}
          >
            <h2 className={`font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              All Users
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
                    <th className="text-left py-3 px-3 sm:px-4">Name</th>
                    <th className="text-left py-3 px-3 sm:px-4">Email</th>
                    <th className="text-left py-3 px-3 sm:px-4">Role</th>
                    <th className="text-left py-3 px-3 sm:px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
                      <td className="py-3 px-3 sm:px-4">{user.full_name}</td>
                      <td className="py-3 px-3 sm:px-4">{user.email}</td>
                      <td className="py-3 px-3 sm:px-4 capitalize">{user.role}</td>
                      <td className="py-3 px-3 sm:px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                          user.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {user.status}
                        </span>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard