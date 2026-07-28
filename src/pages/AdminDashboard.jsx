// import React, { useEffect, useState } from 'react'
// import { motion } from 'framer-motion'
// import { supabase } from '../lib/supabase'
// import useStore from '../store/useStore'
// import { FaUsers, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaEye, FaUserCheck, FaUserClock } from 'react-icons/fa'
// // Remove FaBoxingGlove, use simple icon instead
// import { GiProgression } from 'react-icons/gi'

// import toast from 'react-hot-toast'

// const AdminDashboard = () => {
//   const { addNotification, theme } = useStore()
//   const [applications, setApplications] = useState([])
//   const [users, setUsers] = useState([])
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     pendingApplications: 0,
//     approvedUsers: 0,
//     rejectedUsers: 0
//   })
//   const [activeTab, setActiveTab] = useState('applications')

//   useEffect(() => {
//     fetchApplications()
//     fetchUsers()
//   }, [])

//   const fetchApplications = async () => {
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('status', 'pending')
//     if (!error && data) setApplications(data)
//   }

//   const fetchUsers = async () => {
//     const { data, error } = await supabase.from('profiles').select('*')
//     if (!error && data) {
//       setUsers(data)
//       setStats({
//         totalUsers: data.length,
//         pendingApplications: data.filter(u => u.status === 'pending').length,
//         approvedUsers: data.filter(u => u.status === 'approved').length,
//         rejectedUsers: data.filter(u => u.status === 'rejected').length
//       })
//     }
//   }

//   const handleApplication = async (userId, status) => {
//     const { error } = await supabase
//       .from('profiles')
//       .update({ status: status })
//       .eq('id', userId)

//     if (!error) {
//       toast.success(`Application ${status}`)
//       fetchApplications()
//       fetchUsers()
      
//       await supabase.from('notifications').insert([{
//         user_id: userId,
//         message: `Your application has been ${status}`,
//         type: status
//       }])
      
//       addNotification({
//         user_id: userId,
//         message: `Your application has been ${status}`,
//         type: status
//       })
//     } else {
//       toast.error('Error updating application')
//     }
//   }

//   const statCards = [
//     { icon: FaUsers, label: 'Total Users', value: stats.totalUsers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
//     { icon: FaUserClock, label: 'Pending', value: stats.pendingApplications, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
//     { icon: FaUserCheck, label: 'Approved', value: stats.approvedUsers, color: 'text-green-500', bg: 'bg-green-500/10' },
//     { icon: FaTimesCircle, label: 'Rejected', value: stats.rejectedUsers, color: 'text-red-500', bg: 'bg-red-500/10' },
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
//             Admin Dashboard
//           </h1>
//           <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
//             Manage users, tournaments, and applications
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

//         {/* Tabs */}
//         <div className="flex gap-2 sm:gap-4 mb-6 overflow-x-auto">
//           {['applications', 'users', 'tournaments'].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 sm:px-6 py-2 rounded-lg font-display font-semibold transition-all whitespace-nowrap ${
//                 activeTab === tab
//                   ? 'bg-[#e11d48] text-white'
//                   : theme === 'dark'
//                   ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
//                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//               }`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </div>

//         {/* Pending Applications */}
//         {activeTab === 'applications' && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className={`rounded-xl p-4 sm:p-6 ${theme === 'dark' ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'}`}
//           >
//             <h2 className={`font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//               Pending Applications
//             </h2>
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[500px]">
//                 <thead>
//                   <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
//                     <th className="text-left py-3 px-3 sm:px-4">Name</th>
//                     <th className="text-left py-3 px-3 sm:px-4">Email</th>
//                     <th className="text-left py-3 px-3 sm:px-4">Role</th>
//                     <th className="text-left py-3 px-3 sm:px-4">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {applications.map((app) => (
//                     <tr key={app.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
//                       <td className="py-3 px-3 sm:px-4">{app.full_name}</td>
//                       <td className="py-3 px-3 sm:px-4">{app.email}</td>
//                       <td className="py-3 px-3 sm:px-4 capitalize">{app.role}</td>
//                       <td className="py-3 px-3 sm:px-4">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => handleApplication(app.id, 'approved')}
//                             className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
//                           >
//                             <FaCheckCircle />
//                           </button>
//                           <button
//                             onClick={() => handleApplication(app.id, 'rejected')}
//                             className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
//                           >
//                             <FaTimesCircle />
//                           </button>
//                           <button className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors">
//                             <FaEye />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               {applications.length === 0 && (
//                 <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                   No pending applications
//                 </p>
//               )}
//             </div>
//           </motion.div>
//         )}

//         {/* Users List */}
//         {activeTab === 'users' && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className={`rounded-xl p-4 sm:p-6 ${theme === 'dark' ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'}`}
//           >
//             <h2 className={`font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//               All Users
//             </h2>
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[500px]">
//                 <thead>
//                   <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
//                     <th className="text-left py-3 px-3 sm:px-4">Name</th>
//                     <th className="text-left py-3 px-3 sm:px-4">Email</th>
//                     <th className="text-left py-3 px-3 sm:px-4">Role</th>
//                     <th className="text-left py-3 px-3 sm:px-4">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {users.map((user) => (
//                     <tr key={user.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
//                       <td className="py-3 px-3 sm:px-4">{user.full_name}</td>
//                       <td className="py-3 px-3 sm:px-4">{user.email}</td>
//                       <td className="py-3 px-3 sm:px-4 capitalize">{user.role}</td>
//                       <td className="py-3 px-3 sm:px-4">
//                         <span className={`px-2 py-1 rounded-full text-xs ${
//                           user.status === 'approved' ? 'bg-green-500/20 text-green-500' :
//                           user.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
//                           'bg-red-500/20 text-red-500'
//                         }`}>
//                           {user.status}
//                         </span>
//                        </td>
//                      </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default AdminDashboard

// import React, { useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { 
//   FaUsers, FaUserPlus, FaTrophy, FaCalendarAlt, 
//   FaFileAlt, FaCheckCircle, FaTimesCircle, FaClock,
//   FaWeight, FaRulerVertical, FaUserMd, FaFileUpload,
//   FaPlus, FaEdit, FaTrash, FaEye, FaSearch,
//   FaVenusMars, FaPhone, FaEnvelope,
//   FaIdCard, FaCalendarCheck, FaUserCheck, FaShieldAlt,
//   FaSpinner
// } from 'react-icons/fa'
// import { GiBoxingGlove } from 'react-icons/gi'
// import useStore from '../store/useStore'
// import { supabase } from '../lib/supabase'
// import toast from 'react-hot-toast'

// const AdminDashboard = () => {
//   const { theme } = useStore()
//   const [activeTab, setActiveTab] = useState('applications')
//   const [players, setPlayers] = useState([])
//   const [tournaments, setTournaments] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [showPlayerForm, setShowPlayerForm] = useState(false)
//   const [showTournamentForm, setShowTournamentForm] = useState(false)
//   const [editingPlayer, setEditingPlayer] = useState(null)
//   const [editingTournament, setEditingTournament] = useState(null)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [formLoading, setFormLoading] = useState(false)

//   // Player Registration Form State
//   const [playerForm, setPlayerForm] = useState({
//     fullName: '',
//     cnic: '',
//     dateOfBirth: '',
//     gender: 'male',
//     contactNumber: '',
//     emergencyContact: '',
//     weight: '',
//     height: '',
//     stance: 'orthodox',
//     experienceLevel: 'beginner',
//     clubName: '',
//     clearanceStatus: 'pending',
//     checkupDate: '',
//     fitForCombat: false,
//     doctorName: '',
//     medicalNotes: '',
//     photo: null,
//     medicalCertificate: null
//   })

//   // Tournament Form State
//   const [tournamentForm, setTournamentForm] = useState({
//     title: '',
//     weightClasses: [],
//     startDate: '',
//     endDate: '',
//     venue: '',
//     location: '',
//     registrationDeadline: '',
//     maxPlayers: '',
//     status: 'upcoming',
//     rules: '',
//     medicalRequirements: ''
//   })

//   // Fetch Data
//   const fetchPlayers = async () => {
//     const { data, error } = await supabase
//       .from('players')
//       .select('*')
//       .order('created_at', { ascending: false })
//     if (!error && data) {
//       setPlayers(data)
//     }
//   }

//   const fetchTournaments = async () => {
//     const { data, error } = await supabase
//       .from('tournaments')
//       .select('*')
//       .order('created_at', { ascending: false })
//     if (!error && data) {
//       setTournaments(data)
//     }
//   }

//   useEffect(() => {
//     fetchPlayers()
//     fetchTournaments()
//     setLoading(false)
//   }, [])

//   // ==================== PLAYER CRUD OPERATIONS ====================

//   // CREATE Player
//   const handlePlayerSubmit = async (e) => {
//     e.preventDefault()
//     setFormLoading(true)

//     const playerData = {
//       full_name: playerForm.fullName,
//       cnic: playerForm.cnic,
//       date_of_birth: playerForm.dateOfBirth,
//       gender: playerForm.gender,
//       contact_number: playerForm.contactNumber,
//       emergency_contact: playerForm.emergencyContact,
//       weight: parseFloat(playerForm.weight),
//       height: parseFloat(playerForm.height),
//       stance: playerForm.stance,
//       experience_level: playerForm.experienceLevel,
//       club_name: playerForm.clubName,
//       clearance_status: playerForm.clearanceStatus,
//       checkup_date: playerForm.checkupDate || null,
//       fit_for_combat: playerForm.fitForCombat,
//       doctor_name: playerForm.doctorName,
//       medical_notes: playerForm.medicalNotes
//     }

//     let result
//     if (editingPlayer) {
//       // UPDATE Player
//       result = await supabase
//         .from('players')
//         .update(playerData)
//         .eq('id', editingPlayer.id)
//     } else {
//       // CREATE Player
//       result = await supabase
//         .from('players')
//         .insert([playerData])
//     }

//     if (result.error) {
//       toast.error('Error: ' + result.error.message)
//     } else {
//       toast.success(editingPlayer ? 'Player updated successfully!' : 'Player registered successfully!')
//       fetchPlayers()
//       resetPlayerForm()
//       setShowPlayerForm(false)
//       setEditingPlayer(null)
//     }
//     setFormLoading(false)
//   }

//   // READ Player - Open Edit Form
//   const handleEditPlayer = (player) => {
//     setEditingPlayer(player)
//     setPlayerForm({
//       fullName: player.full_name || '',
//       cnic: player.cnic || '',
//       dateOfBirth: player.date_of_birth || '',
//       gender: player.gender || 'male',
//       contactNumber: player.contact_number || '',
//       emergencyContact: player.emergency_contact || '',
//       weight: player.weight || '',
//       height: player.height || '',
//       stance: player.stance || 'orthodox',
//       experienceLevel: player.experience_level || 'beginner',
//       clubName: player.club_name || '',
//       clearanceStatus: player.clearance_status || 'pending',
//       checkupDate: player.checkup_date || '',
//       fitForCombat: player.fit_for_combat || false,
//       doctorName: player.doctor_name || '',
//       medicalNotes: player.medical_notes || '',
//       photo: null,
//       medicalCertificate: null
//     })
//     setShowPlayerForm(true)
//   }

//   // DELETE Player
//   const handleDeletePlayer = async (playerId) => {
//     if (!window.confirm('Are you sure you want to delete this player?')) return
    
//     const { error } = await supabase
//       .from('players')
//       .delete()
//       .eq('id', playerId)

//     if (error) {
//       toast.error('Error deleting player: ' + error.message)
//     } else {
//       toast.success('Player deleted successfully!')
//       fetchPlayers()
//     }
//   }

//   const resetPlayerForm = () => {
//     setPlayerForm({
//       fullName: '',
//       cnic: '',
//       dateOfBirth: '',
//       gender: 'male',
//       contactNumber: '',
//       emergencyContact: '',
//       weight: '',
//       height: '',
//       stance: 'orthodox',
//       experienceLevel: 'beginner',
//       clubName: '',
//       clearanceStatus: 'pending',
//       checkupDate: '',
//       fitForCombat: false,
//       doctorName: '',
//       medicalNotes: '',
//       photo: null,
//       medicalCertificate: null
//     })
//   }

//   // ==================== TOURNAMENT CRUD OPERATIONS ====================

//   // CREATE Tournament
//   const handleTournamentSubmit = async (e) => {
//     e.preventDefault()
//     setFormLoading(true)

//     const tournamentData = {
//       title: tournamentForm.title,
//       weight_classes: tournamentForm.weightClasses || [],
//       start_date: tournamentForm.startDate,
//       end_date: tournamentForm.endDate,
//       venue: tournamentForm.venue,
//       location: tournamentForm.location,
//       registration_deadline: tournamentForm.registrationDeadline,
//       max_players: parseInt(tournamentForm.maxPlayers) || null,
//       status: tournamentForm.status,
//       rules: tournamentForm.rules,
//       medical_requirements: tournamentForm.medicalRequirements
//     }

//     let result
//     if (editingTournament) {
//       // UPDATE Tournament
//       result = await supabase
//         .from('tournaments')
//         .update(tournamentData)
//         .eq('id', editingTournament.id)
//     } else {
//       // CREATE Tournament
//       result = await supabase
//         .from('tournaments')
//         .insert([tournamentData])
//     }

//     if (result.error) {
//       toast.error('Error: ' + result.error.message)
//     } else {
//       toast.success(editingTournament ? 'Tournament updated successfully!' : 'Tournament created successfully!')
//       fetchTournaments()
//       resetTournamentForm()
//       setShowTournamentForm(false)
//       setEditingTournament(null)
//     }
//     setFormLoading(false)
//   }

//   // READ Tournament - Open Edit Form
//   const handleEditTournament = (tournament) => {
//     setEditingTournament(tournament)
//     setTournamentForm({
//       title: tournament.title || '',
//       weightClasses: tournament.weight_classes || [],
//       startDate: tournament.start_date || '',
//       endDate: tournament.end_date || '',
//       venue: tournament.venue || '',
//       location: tournament.location || '',
//       registrationDeadline: tournament.registration_deadline || '',
//       maxPlayers: tournament.max_players || '',
//       status: tournament.status || 'upcoming',
//       rules: tournament.rules || '',
//       medicalRequirements: tournament.medical_requirements || ''
//     })
//     setShowTournamentForm(true)
//   }

//   // DELETE Tournament
//   const handleDeleteTournament = async (tournamentId) => {
//     if (!window.confirm('Are you sure you want to delete this tournament?')) return
    
//     const { error } = await supabase
//       .from('tournaments')
//       .delete()
//       .eq('id', tournamentId)

//     if (error) {
//       toast.error('Error deleting tournament: ' + error.message)
//     } else {
//       toast.success('Tournament deleted successfully!')
//       fetchTournaments()
//     }
//   }

//   const resetTournamentForm = () => {
//     setTournamentForm({
//       title: '',
//       weightClasses: [],
//       startDate: '',
//       endDate: '',
//       venue: '',
//       location: '',
//       registrationDeadline: '',
//       maxPlayers: '',
//       status: 'upcoming',
//       rules: '',
//       medicalRequirements: ''
//     })
//   }

//   // ==================== FILTERS ====================
//   const filteredPlayers = players.filter(p => 
//     p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     p.cnic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     p.club_name?.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   const filteredTournaments = tournaments.filter(t =>
//     t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     t.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     t.location?.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   // ==================== STATS ====================
//   const stats = {
//     totalPlayers: players.length,
//     approvedPlayers: players.filter(p => p.clearance_status === 'passed').length,
//     pendingPlayers: players.filter(p => p.clearance_status === 'pending').length,
//     totalTournaments: tournaments.length,
//     activeTournaments: tournaments.filter(t => t.status === 'ongoing').length
//   }

//   // Weight classes options
//   const weightClasses = [
//     'Flyweight (51kg)',
//     'Bantamweight (54kg)',
//     'Featherweight (57kg)',
//     'Lightweight (60kg)',
//     'Light Welterweight (63.5kg)',
//     'Welterweight (67kg)',
//     'Light Middleweight (71kg)',
//     'Middleweight (75kg)',
//     'Light Heavyweight (79kg)',
//     'Cruiserweight (86kg)',
//     'Heavyweight (91kg)',
//     'Super Heavyweight (91kg+)'
//   ]

//   const statusOptions = ['upcoming', 'ongoing', 'completed', 'draft']

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <FaSpinner className="text-4xl text-[#e11d48] animate-spin" />
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen py-8 md:py-12">
//       <div className="container-responsive">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <h1 className={`font-display text-3xl md:text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//             Admin Dashboard
//           </h1>
//           <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
//             Manage players, applications, and tournaments
//           </p>
//         </motion.div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
//           {[
//             { icon: FaUsers, label: 'Total Players', value: stats.totalPlayers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
//             { icon: FaUserCheck, label: 'Cleared', value: stats.approvedPlayers, color: 'text-green-500', bg: 'bg-green-500/10' },
//             { icon: FaClock, label: 'Pending', value: stats.pendingPlayers, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
//             { icon: FaTrophy, label: 'Tournaments', value: stats.totalTournaments, color: 'text-purple-500', bg: 'bg-purple-500/10' },
//             { icon: FaCalendarCheck, label: 'Active', value: stats.activeTournaments, color: 'text-red-500', bg: 'bg-red-500/10' }
//           ].map((stat, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className={`${stat.bg} rounded-xl p-4 backdrop-blur-sm ${theme === 'dark' ? 'border border-gray-800' : 'border border-gray-200'}`}
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <stat.icon className={`text-2xl ${stat.color}`} />
//                 <span className={`text-xl font-display font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   {stat.value}
//                 </span>
//               </div>
//               <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
//             </motion.div>
//           ))}
//         </div>

//         {/* Tabs */}
//         <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
//           <button
//             onClick={() => setActiveTab('players')}
//             className={`px-4 sm:px-6 py-2 rounded-lg font-display font-semibold transition-all flex items-center gap-2 ${
//               activeTab === 'players'
//                 ? 'bg-[#e11d48] text-white'
//                 : theme === 'dark'
//                 ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
//                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//             }`}
//           >
//             <FaUsers />
//             Player Management
//           </button>
//           <button
//             onClick={() => setActiveTab('tournaments')}
//             className={`px-4 sm:px-6 py-2 rounded-lg font-display font-semibold transition-all flex items-center gap-2 ${
//               activeTab === 'tournaments'
//                 ? 'bg-[#e11d48] text-white'
//                 : theme === 'dark'
//                 ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
//                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//             }`}
//           >
//             <FaTrophy />
//             Tournament Management
//           </button>
//         </div>

//         {/* Tab Content */}
//         <AnimatePresence mode="wait">
//           {activeTab === 'players' ? (
//             <motion.div
//               key="players"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3 }}
//             >
//               {/* Player Management */}
//               <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
//                 <div className="relative flex-1 max-w-md">
//                   <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
//                   <input
//                     type="text"
//                     placeholder="Search players..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                       theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
//                     }`}
//                   />
//                 </div>
//                 <button
//                   onClick={() => {
//                     setEditingPlayer(null)
//                     resetPlayerForm()
//                     setShowPlayerForm(true)
//                   }}
//                   className="px-4 py-2 bg-[#e11d48] text-white rounded-lg font-display font-semibold hover:scale-105 transition-transform flex items-center gap-2"
//                 >
//                   <FaUserPlus /> Register Player
//                 </button>
//               </div>

//               {/* Players Table */}
//               <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'}`}>
//                 <div className="overflow-x-auto">
//                   <table className="w-full min-w-[800px]">
//                     <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
//                       <tr>
//                         <th className="text-left py-3 px-4">Name</th>
//                         <th className="text-left py-3 px-4">CNIC</th>
//                         <th className="text-left py-3 px-4">Weight</th>
//                         <th className="text-left py-3 px-4">Club</th>
//                         <th className="text-left py-3 px-4">Medical</th>
//                         <th className="text-left py-3 px-4">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredPlayers.length === 0 ? (
//                         <tr>
//                           <td colSpan="6" className="text-center py-8 text-gray-500">
//                             No players registered yet
//                           </td>
//                         </tr>
//                       ) : (
//                         filteredPlayers.map((player) => (
//                           <tr key={player.id} className={`border-t ${theme === 'dark' ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50'}`}>
//                             <td className="py-3 px-4 font-medium">{player.full_name}</td>
//                             <td className="py-3 px-4">{player.cnic}</td>
//                             <td className="py-3 px-4">{player.weight} kg</td>
//                             <td className="py-3 px-4">{player.club_name || '-'}</td>
//                             <td className="py-3 px-4">
//                               <span className={`px-2 py-1 rounded-full text-xs ${
//                                 player.clearance_status === 'passed' ? 'bg-green-500/20 text-green-500' :
//                                 player.clearance_status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
//                                 'bg-red-500/20 text-red-500'
//                               }`}>
//                                 {player.clearance_status}
//                               </span>
//                             </td>
//                             <td className="py-3 px-4">
//                               <div className="flex gap-2">
//                                 <button
//                                   onClick={() => handleEditPlayer(player)}
//                                   className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors"
//                                   title="Edit"
//                                 >
//                                   <FaEdit />
//                                 </button>
//                                 <button
//                                   onClick={() => handleDeletePlayer(player.id)}
//                                   className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
//                                   title="Delete"
//                                 >
//                                   <FaTrash />
//                                 </button>
//                                 <button
//                                   className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
//                                   title="View"
//                                 >
//                                   <FaEye />
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </motion.div>
//           ) : (
//             <motion.div
//               key="tournaments"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3 }}
//             >
//               {/* Tournament Management */}
//               <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
//                 <div className="relative flex-1 max-w-md">
//                   <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
//                   <input
//                     type="text"
//                     placeholder="Search tournaments..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                       theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
//                     }`}
//                   />
//                 </div>
//                 <button
//                   onClick={() => {
//                     setEditingTournament(null)
//                     resetTournamentForm()
//                     setShowTournamentForm(true)
//                   }}
//                   className="px-4 py-2 bg-[#e11d48] text-white rounded-lg font-display font-semibold hover:scale-105 transition-transform flex items-center gap-2"
//                 >
//                   <FaPlus /> Create Tournament
//                 </button>
//               </div>

//               {/* Tournaments Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {filteredTournaments.length === 0 ? (
//                   <div className="col-span-full text-center py-12 text-gray-500">
//                     <FaTrophy className="text-6xl mx-auto mb-4 opacity-20" />
//                     <p>No tournaments created yet</p>
//                     <button
//                       onClick={() => {
//                         setEditingTournament(null)
//                         resetTournamentForm()
//                         setShowTournamentForm(true)
//                       }}
//                       className="mt-4 px-4 py-2 bg-[#e11d48] text-white rounded-lg hover:scale-105 transition-transform"
//                     >
//                       Create your first tournament
//                     </button>
//                   </div>
//                 ) : (
//                   filteredTournaments.map((tournament) => (
//                     <motion.div
//                       key={tournament.id}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: 0.1 }}
//                       className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'}`}
//                     >
//                       <div className="flex items-start justify-between mb-4">
//                         <div className="flex-1">
//                           <h3 className={`font-display font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                             {tournament.title}
//                           </h3>
//                           <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
//                             {tournament.venue || 'Venue TBD'}
//                           </p>
//                         </div>
//                         <span className={`px-2 py-1 rounded-full text-xs ${
//                           tournament.status === 'ongoing' ? 'bg-green-500/20 text-green-500' :
//                           tournament.status === 'upcoming' ? 'bg-blue-500/20 text-blue-500' :
//                           tournament.status === 'completed' ? 'bg-gray-500/20 text-gray-500' :
//                           'bg-yellow-500/20 text-yellow-500'
//                         }`}>
//                           {tournament.status}
//                         </span>
//                       </div>
//                       <div className="space-y-2 text-sm">
//                         <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
//                           <FaCalendarAlt className="inline mr-2" />
//                           {tournament.start_date} - {tournament.end_date}
//                         </p>
//                         <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
//                           <FaUsers className="inline mr-2" />
//                           Max Players: {tournament.max_players || 'Unlimited'}
//                         </p>
//                         <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
//                           <FaWeight className="inline mr-2" />
//                           {tournament.weight_classes?.join(', ') || 'All Classes'}
//                         </p>
//                       </div>
//                       <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
//                         <button
//                           onClick={() => handleEditTournament(tournament)}
//                           className="flex-1 px-3 py-1 bg-blue-500/20 text-blue-500 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
//                         >
//                           <FaEdit className="inline mr-1" /> Edit
//                         </button>
//                         <button
//                           onClick={() => handleDeleteTournament(tournament.id)}
//                           className="flex-1 px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
//                         >
//                           <FaTrash className="inline mr-1" /> Delete
//                         </button>
//                       </div>
//                     </motion.div>
//                   ))
//                 )}
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Player Registration Modal */}
//       {showPlayerForm && (
//         <PlayerRegistrationForm
//           playerForm={playerForm}
//           setPlayerForm={setPlayerForm}
//           onSubmit={handlePlayerSubmit}
//           onClose={() => {
//             setShowPlayerForm(false)
//             setEditingPlayer(null)
//             resetPlayerForm()
//           }}
//           theme={theme}
//           editingPlayer={editingPlayer}
//           loading={formLoading}
//         />
//       )}

//       {/* Tournament Form Modal */}
//       {showTournamentForm && (
//         <TournamentForm
//           tournamentForm={tournamentForm}
//           setTournamentForm={setTournamentForm}
//           onSubmit={handleTournamentSubmit}
//           onClose={() => {
//             setShowTournamentForm(false)
//             setEditingTournament(null)
//             resetTournamentForm()
//           }}
//           theme={theme}
//           weightClasses={weightClasses}
//           statusOptions={statusOptions}
//           editingTournament={editingTournament}
//           loading={formLoading}
//         />
//       )}
//     </div>
//   )
// }

// // ==================== PLAYER REGISTRATION FORM COMPONENT ====================
// const PlayerRegistrationForm = ({ playerForm, setPlayerForm, onSubmit, onClose, theme, editingPlayer, loading }) => {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${
//           theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow-2xl'
//         }`}
//       >
//         <div className="flex justify-between items-center mb-6">
//           <h2 className={`font-display text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//             <FaUserPlus className="inline mr-2 text-[#e11d48]" />
//             {editingPlayer ? 'Edit Player' : 'Boxing Player Registration'}
//           </h2>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
//           >
//             ✕
//           </button>
//         </div>

//         <form onSubmit={onSubmit} className="space-y-6">
//           {/* Personal Information */}
//           <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
//             <h3 className={`font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//               <FaUserMd className="text-[#e11d48]" />
//               Personal Information
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Full Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={playerForm.fullName}
//                   onChange={(e) => setPlayerForm({ ...playerForm, fullName: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   CNIC / B-Form *
//                 </label>
//                 <input
//                   type="text"
//                   value={playerForm.cnic}
//                   onChange={(e) => setPlayerForm({ ...playerForm, cnic: e.target.value })}
//                   placeholder="XXXXX-XXXXXXX-X"
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Date of Birth *
//                 </label>
//                 <input
//                   type="date"
//                   value={playerForm.dateOfBirth}
//                   onChange={(e) => setPlayerForm({ ...playerForm, dateOfBirth: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Gender *
//                 </label>
//                 <select
//                   value={playerForm.gender}
//                   onChange={(e) => setPlayerForm({ ...playerForm, gender: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 >
//                   <option value="male">Male</option>
//                   <option value="female">Female</option>
//                   <option value="other">Other</option>
//                 </select>
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Contact Number *
//                 </label>
//                 <input
//                   type="tel"
//                   value={playerForm.contactNumber}
//                   onChange={(e) => setPlayerForm({ ...playerForm, contactNumber: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Emergency Contact *
//                 </label>
//                 <input
//                   type="tel"
//                   value={playerForm.emergencyContact}
//                   onChange={(e) => setPlayerForm({ ...playerForm, emergencyContact: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Boxing Specs */}
//           <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
//             <h3 className={`font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//               <GiBoxingGlove className="text-[#e11d48]" />
//               Boxing Specifications
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Weight (kg) *
//                 </label>
//                 <input
//                   type="number"
//                   step="0.1"
//                   value={playerForm.weight}
//                   onChange={(e) => setPlayerForm({ ...playerForm, weight: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Height (cm) *
//                 </label>
//                 <input
//                   type="number"
//                   step="0.1"
//                   value={playerForm.height}
//                   onChange={(e) => setPlayerForm({ ...playerForm, height: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Boxing Stance *
//                 </label>
//                 <select
//                   value={playerForm.stance}
//                   onChange={(e) => setPlayerForm({ ...playerForm, stance: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 >
//                   <option value="orthodox">Orthodox</option>
//                   <option value="southpaw">Southpaw</option>
//                 </select>
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Experience Level *
//                 </label>
//                 <select
//                   value={playerForm.experienceLevel}
//                   onChange={(e) => setPlayerForm({ ...playerForm, experienceLevel: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 >
//                   <option value="beginner">Beginner</option>
//                   <option value="intermediate">Intermediate</option>
//                   <option value="pro">Professional</option>
//                 </select>
//               </div>
//               <div className="md:col-span-2">
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Club / Academy Name
//                 </label>
//                 <input
//                   type="text"
//                   value={playerForm.clubName}
//                   onChange={(e) => setPlayerForm({ ...playerForm, clubName: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Medical Clearance */}
//           <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
//             <h3 className={`font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//               <FaShieldAlt className="text-[#e11d48]" />
//               Medical Clearance (Mandatory)
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Clearance Status *
//                 </label>
//                 <select
//                   value={playerForm.clearanceStatus}
//                   onChange={(e) => setPlayerForm({ ...playerForm, clearanceStatus: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 >
//                   <option value="pending">Pending</option>
//                   <option value="passed">Passed</option>
//                   <option value="failed">Failed</option>
//                 </select>
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Checkup Date
//                 </label>
//                 <input
//                   type="date"
//                   value={playerForm.checkupDate}
//                   onChange={(e) => setPlayerForm({ ...playerForm, checkupDate: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Fit for Combat
//                 </label>
//                 <div className="flex items-center gap-4 pt-2">
//                   <label className="flex items-center gap-2">
//                     <input
//                       type="radio"
//                       checked={playerForm.fitForCombat === true}
//                       onChange={() => setPlayerForm({ ...playerForm, fitForCombat: true })}
//                       className="w-4 h-4 accent-[#e11d48]"
//                     />
//                     Yes
//                   </label>
//                   <label className="flex items-center gap-2">
//                     <input
//                       type="radio"
//                       checked={playerForm.fitForCombat === false}
//                       onChange={() => setPlayerForm({ ...playerForm, fitForCombat: false })}
//                       className="w-4 h-4 accent-[#e11d48]"
//                     />
//                     No
//                   </label>
//                 </div>
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Doctor / Medical Officer Name
//                 </label>
//                 <input
//                   type="text"
//                   value={playerForm.doctorName}
//                   onChange={(e) => setPlayerForm({ ...playerForm, doctorName: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                 />
//               </div>
//               <div className="md:col-span-2">
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Medical Notes / Allergies
//                 </label>
//                 <textarea
//                   value={playerForm.medicalNotes}
//                   onChange={(e) => setPlayerForm({ ...playerForm, medicalNotes: e.target.value })}
//                   rows="2"
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   placeholder="Any allergies or medical conditions..."
//                 />
//               </div>
//             </div>
//           </div>

//           {/* File Uploads */}
//           <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
//             <h3 className={`font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//               <FaFileUpload className="text-[#e11d48]" />
//               File Uploads
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Passport Size Photo *
//                 </label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => setPlayerForm({ ...playerForm, photo: e.target.files[0] })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required={!editingPlayer}
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Medical Fitness Certificate *
//                 </label>
//                 <input
//                   type="file"
//                   accept=".pdf,.jpg,.png"
//                   onChange={(e) => setPlayerForm({ ...playerForm, medicalCertificate: e.target.files[0] })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required={!editingPlayer}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="flex gap-4 justify-end">
//             <button
//               type="button"
//               onClick={onClose}
//               className={`px-6 py-2 rounded-lg font-display font-semibold transition-colors ${
//                 theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
//               }`}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-6 py-2 bg-[#e11d48] text-white rounded-lg font-display font-semibold hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
//             >
//               {loading ? <FaSpinner className="animate-spin" /> : null}
//               {editingPlayer ? 'Update Player' : 'Register Player'}
//             </button>
//           </div>
//         </form>
//       </motion.div>
//     </div>
//   )
// }

// // ==================== TOURNAMENT FORM COMPONENT ====================
// const TournamentForm = ({ tournamentForm, setTournamentForm, onSubmit, onClose, theme, weightClasses, statusOptions, editingTournament, loading }) => {
//   const [selectedWeightClasses, setSelectedWeightClasses] = useState(tournamentForm.weightClasses || [])

//   const handleWeightClassToggle = (weightClass) => {
//     if (selectedWeightClasses.includes(weightClass)) {
//       setSelectedWeightClasses(selectedWeightClasses.filter(w => w !== weightClass))
//     } else {
//       setSelectedWeightClasses([...selectedWeightClasses, weightClass])
//     }
//     setTournamentForm({ ...tournamentForm, weightClasses: selectedWeightClasses })
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${
//           theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow-2xl'
//         }`}
//       >
//         <div className="flex justify-between items-center mb-6">
//           <h2 className={`font-display text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//             <FaTrophy className="inline mr-2 text-[#e11d48]" />
//             {editingTournament ? 'Edit Tournament' : 'Create New Tournament'}
//           </h2>
//           <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
//             ✕
//           </button>
//         </div>

//         <form onSubmit={onSubmit} className="space-y-6">
//           <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
//             <h3 className={`font-display font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//               <FaCalendarAlt className="inline mr-2 text-[#e11d48]" />
//               Tournament Details
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Title *
//                 </label>
//                 <input
//                   type="text"
//                   value={tournamentForm.title}
//                   onChange={(e) => setTournamentForm({ ...tournamentForm, title: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Status *
//                 </label>
//                 <select
//                   value={tournamentForm.status}
//                   onChange={(e) => setTournamentForm({ ...tournamentForm, status: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 >
//                   {statusOptions.map((status) => (
//                     <option key={status} value={status}>
//                       {status.charAt(0).toUpperCase() + status.slice(1)}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
//             <h3 className={`font-display font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//               <FaWeight className="inline mr-2 text-[#e11d48]" />
//               Weight Classes
//             </h3>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//               {weightClasses.map((weightClass) => (
//                 <label key={weightClass} className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={selectedWeightClasses.includes(weightClass)}
//                     onChange={() => handleWeightClassToggle(weightClass)}
//                     className="w-4 h-4 accent-[#e11d48]"
//                   />
//                   <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                     {weightClass}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
//             <h3 className={`font-display font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//               <FaCalendarCheck className="inline mr-2 text-[#e11d48]" />
//               Schedule & Location
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Start Date *
//                 </label>
//                 <input
//                   type="date"
//                   value={tournamentForm.startDate}
//                   onChange={(e) => setTournamentForm({ ...tournamentForm, startDate: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   End Date *
//                 </label>
//                 <input
//                   type="date"
//                   value={tournamentForm.endDate}
//                   onChange={(e) => setTournamentForm({ ...tournamentForm, endDate: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Venue *
//                 </label>
//                 <input
//                   type="text"
//                   value={tournamentForm.venue}
//                   onChange={(e) => setTournamentForm({ ...tournamentForm, venue: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Location / City
//                 </label>
//                 <input
//                   type="text"
//                   value={tournamentForm.location}
//                   onChange={(e) => setTournamentForm({ ...tournamentForm, location: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Registration Deadline *
//                 </label>
//                 <input
//                   type="date"
//                   value={tournamentForm.registrationDeadline}
//                   onChange={(e) => setTournamentForm({ ...tournamentForm, registrationDeadline: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Maximum Players Allowed
//                 </label>
//                 <input
//                   type="number"
//                   value={tournamentForm.maxPlayers}
//                   onChange={(e) => setTournamentForm({ ...tournamentForm, maxPlayers: e.target.value })}
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
//             <h3 className={`font-display font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//               <FaFileAlt className="inline mr-2 text-[#e11d48]" />
//               Rules & Requirements
//             </h3>
//             <div className="grid grid-cols-1 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Tournament Rules
//                 </label>
//                 <textarea
//                   value={tournamentForm.rules}
//                   onChange={(e) => setTournamentForm({ ...tournamentForm, rules: e.target.value })}
//                   rows="3"
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   placeholder="Enter tournament rules and regulations..."
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Medical Requirements
//                 </label>
//                 <textarea
//                   value={tournamentForm.medicalRequirements}
//                   onChange={(e) => setTournamentForm({ ...tournamentForm, medicalRequirements: e.target.value })}
//                   rows="2"
//                   className={`w-full p-2 rounded-lg border focus:outline-none focus:border-[#e11d48] ${
//                     theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                   }`}
//                   placeholder="Medical requirements for participants..."
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="flex gap-4 justify-end">
//             <button
//               type="button"
//               onClick={onClose}
//               className={`px-6 py-2 rounded-lg font-display font-semibold transition-colors ${
//                 theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
//               }`}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-6 py-2 bg-[#e11d48] text-white rounded-lg font-display font-semibold hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
//             >
//               {loading ? <FaSpinner className="animate-spin" /> : null}
//               {editingTournament ? 'Update Tournament' : 'Create Tournament'}
//             </button>
//           </div>
//         </form>
//       </motion.div>
//     </div>
//   )
// }

// export default AdminDashboard  





// import React, { useEffect, useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { supabase } from '../lib/supabase'
// import useStore from '../store/useStore'
// import { 
//   FaUsers, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaEye, 
//   FaUserCheck, FaUserClock, FaUser, FaIdCard, FaVenusMars, 
//   FaPhone, FaWeight, FaRulerVertical, FaUserGraduate, FaHospital, 
//   FaFileMedical, FaImage, FaFilePdf, FaTrophy, FaBoxes, 
//   FaMapMarkerAlt, FaSave, FaUndo, FaPlus
// } from 'react-icons/fa'
// import { GiProgression } from 'react-icons/gi'
// import toast from 'react-hot-toast'

// const AdminDashboard = () => {
//   const { addNotification, theme } = useStore()
//   const [applications, setApplications] = useState([])
//   const [users, setUsers] = useState([])
//   const [players, setPlayers] = useState([])
//   const [activeTab, setActiveTab] = useState('applications')
//   const [loading, setLoading] = useState(false)
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     pendingApplications: 0,
//     approvedUsers: 0,
//     rejectedUsers: 0
//   })

//   // ====================== PLAYER FORM STATE ======================
//   const [playerForm, setPlayerForm] = useState({
//     fullName: '',
//     cnic: '',
//     dateOfBirth: '',
//     gender: '',
//     contactNumber: '',
//     emergencyContact: '',
//     weight: '',
//     height: '',
//     stance: '',
//     experienceLevel: '',
//     clubName: '',
//     clearanceStatus: '',
//     checkupDate: '',
//     fitForCombat: false,
//     doctorName: '',
//     medicalNotes: '',
//     photo: null,
//     medicalCertificate: null,
//   })

//   // ====================== TOURNAMENT FORM STATE ======================
//   const [tournamentForm, setTournamentForm] = useState({
//     title: '',
//     weightClasses: '',
//     startDate: '',
//     endDate: '',
//     venue: '',
//     registrationDeadline: '',
//     maxPlayers: '',
//     status: 'upcoming',
//     rulesNotes: '',
//   })

//   // ====================== VALIDATION ERRORS ======================
//   const [errors, setErrors] = useState({})

//   // ====================== FETCH DATA ======================
//   useEffect(() => {
//     fetchApplications()
//     fetchUsers()
//     fetchPlayers()
//   }, [])

//   const fetchApplications = async () => {
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('status', 'pending')
//     if (!error && data) setApplications(data)
//   }

//   const fetchUsers = async () => {
//     const { data, error } = await supabase.from('profiles').select('*')
//     if (!error && data) {
//       setUsers(data)
//       setStats({
//         totalUsers: data.length,
//         pendingApplications: data.filter(u => u.status === 'pending').length,
//         approvedUsers: data.filter(u => u.status === 'approved').length,
//         rejectedUsers: data.filter(u => u.status === 'rejected').length
//       })
//     }
//   }

//   const fetchPlayers = async () => {
//     const { data, error } = await supabase
//       .from('players')
//       .select('*')
//       .order('created_at', { ascending: false })
//     if (!error && data) {
//       setPlayers(data)
//     }
//   }

//   // ====================== APPLICATION HANDLER ======================
//   const handleApplication = async (userId, status) => {
//     const { error } = await supabase
//       .from('profiles')
//       .update({ status: status })
//       .eq('id', userId)

//     if (!error) {
//       toast.success(`Application ${status}`)
//       fetchApplications()
//       fetchUsers()
      
//       await supabase.from('notifications').insert([{
//         user_id: userId,
//         message: `Your application has been ${status}`,
//         type: status
//       }])
      
//       addNotification({
//         user_id: userId,
//         message: `Your application has been ${status}`,
//         type: status
//       })
//     } else {
//       toast.error('Error updating application')
//     }
//   }

//   // ====================== PLAYER FORM HANDLERS ======================
//   const handlePlayerChange = (e) => {
//     const { name, value, type, checked } = e.target
//     setPlayerForm({
//       ...playerForm,
//       [name]: type === 'checkbox' ? checked : value,
//     })
//     if (errors[name]) {
//       setErrors({ ...errors, [name]: '' })
//     }
//   }

//   const handleFileChange = (e, fieldName) => {
//     const file = e.target.files[0]
//     if (file) {
//       setPlayerForm({ ...playerForm, [fieldName]: file })
//       if (errors[fieldName]) {
//         setErrors({ ...errors, [fieldName]: '' })
//       }
//     }
//   }

//   const validatePlayerForm = () => {
//     const newErrors = {}
    
//     if (!playerForm.fullName?.trim()) newErrors.fullName = 'Full Name is required'
//     if (!playerForm.cnic?.trim()) newErrors.cnic = 'CNIC / B-Form is required'
//     if (!playerForm.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required'
//     if (!playerForm.gender) newErrors.gender = 'Gender is required'
//     if (!playerForm.contactNumber?.trim()) newErrors.contactNumber = 'Contact Number is required'
//     if (!playerForm.emergencyContact?.trim()) newErrors.emergencyContact = 'Emergency Contact is required'
//     if (!playerForm.weight) newErrors.weight = 'Weight is required'
//     if (!playerForm.height) newErrors.height = 'Height is required'
//     if (!playerForm.stance) newErrors.stance = 'Boxing Stance is required'
//     if (!playerForm.experienceLevel) newErrors.experienceLevel = 'Experience Level is required'
//     if (!playerForm.clubName?.trim()) newErrors.clubName = 'Club / Academy Name is required'
    
//     if (!playerForm.clearanceStatus) {
//       newErrors.clearanceStatus = 'Medical Clearance Status is required'
//     } else if (playerForm.clearanceStatus === 'failed') {
//       newErrors.clearanceStatus = '❌ Cannot register player with FAILED medical clearance'
//     } else if (playerForm.clearanceStatus === 'pending') {
//       newErrors.clearanceStatus = '⏳ Medical clearance must be PASSED to register'
//     }
    
//     if (!playerForm.checkupDate) newErrors.checkupDate = 'Checkup Date is required'
//     if (!playerForm.doctorName?.trim()) newErrors.doctorName = 'Doctor Name is required'
//     if (!playerForm.photo) newErrors.photo = 'Passport Size Photo is required'
//     if (!playerForm.medicalCertificate) newErrors.medicalCertificate = 'Medical Fitness Certificate is required'
    
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   // ====================== FIXED PLAYER SUBMIT ======================
//   const handlePlayerSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
    
//     if (!validatePlayerForm()) {
//       setLoading(false)
//       toast.error('Please fix all validation errors')
//       return
//     }

//     try {
//       console.log('📝 Starting player registration...')

//       // ✅ FIX: Use count instead of single() to avoid 406 error
//       const { count, error: countError } = await supabase
//         .from('players')
//         .select('*', { count: 'exact', head: true })
//         .eq('cnic', playerForm.cnic)

//       if (countError) {
//         console.error('Count error:', countError)
//       }

//       if (count && count > 0) {
//         toast.error('Player with this CNIC already exists!')
//         setLoading(false)
//         return
//       }

//       // Create auth user
//       const tempEmail = `${playerForm.cnic}@punchtrack.com`
//       const tempPassword = 'Temp@123456'

//       console.log('📧 Creating auth user with email:', tempEmail)

//       const { data: authData, error: authError } = await supabase.auth.signUp({
//         email: tempEmail,
//         password: tempPassword,
//         options: {
//           data: {
//             full_name: playerForm.fullName,
//             role: 'player'
//           }
//         }
//       })

//       if (authError) {
//         console.error('❌ Auth error:', authError)
//         if (authError.message.includes('already registered')) {
//           toast.error('User already exists with this CNIC')
//         } else {
//           toast.error('Auth error: ' + authError.message)
//         }
//         setLoading(false)
//         return
//       }

//       if (!authData?.user) {
//         console.error('❌ No user returned from auth')
//         toast.error('Failed to create user account')
//         setLoading(false)
//         return
//       }

//       console.log('✅ Auth user created:', authData.user.id)

//       // Insert player data
//       const playerData = {
//         user_id: authData.user.id,
//         full_name: playerForm.fullName,
//         cnic: playerForm.cnic,
//         date_of_birth: playerForm.dateOfBirth,
//         gender: playerForm.gender,
//         contact_number: playerForm.contactNumber,
//         emergency_contact: playerForm.emergencyContact,
//         weight: parseFloat(playerForm.weight),
//         height: parseFloat(playerForm.height),
//         stance: playerForm.stance,
//         experience_level: playerForm.experienceLevel,
//         club_name: playerForm.clubName,
//         clearance_status: playerForm.clearanceStatus,
//         checkup_date: playerForm.checkupDate,
//         fit_for_combat: playerForm.fitForCombat,
//         doctor_name: playerForm.doctorName,
//         medical_notes: playerForm.medicalNotes,
//         status: 'active'
//       }

//       console.log('📤 Inserting player data:', playerData)

//       const { data: insertedData, error: playerError } = await supabase
//         .from('players')
//         .insert([playerData])
//         .select()

//       if (playerError) {
//         console.error('❌ Player insert error:', playerError)
//         toast.error('Database error: ' + playerError.message)
//         setLoading(false)
//         return
//       }

//       console.log('✅ Player inserted successfully:', insertedData)

//       // Update profile status
//       await supabase
//         .from('profiles')
//         .update({ status: 'approved' })
//         .eq('id', authData.user.id)

//       toast.success('✅ Player registered successfully!')
//       resetPlayerForm()
//       fetchPlayers()
//       fetchUsers()
      
//     } catch (error) {
//       console.error('❌ Unexpected error:', error)
//       toast.error(error.message || 'Error registering player')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const resetPlayerForm = () => {
//     setPlayerForm({
//       fullName: '', cnic: '', dateOfBirth: '', gender: '', contactNumber: '', emergencyContact: '',
//       weight: '', height: '', stance: '', experienceLevel: '', clubName: '',
//       clearanceStatus: '', checkupDate: '', fitForCombat: false, doctorName: '', medicalNotes: '',
//       photo: null, medicalCertificate: null,
//     })
//     setErrors({})
//   }

//   // ====================== TOURNAMENT FORM HANDLERS ======================
//   const handleTournamentChange = (e) => {
//     const { name, value } = e.target
//     setTournamentForm({ ...tournamentForm, [name]: value })
//   }

//   const handleTournamentSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)

//     if (!tournamentForm.title?.trim()) {
//       toast.error('Tournament Title is required')
//       setLoading(false)
//       return
//     }
//     if (!tournamentForm.startDate || !tournamentForm.endDate) {
//       toast.error('Start and End Dates are required')
//       setLoading(false)
//       return
//     }

//     try {
//       console.log('📝 Creating tournament:', tournamentForm)

//       const { data, error } = await supabase
//         .from('tournaments')
//         .insert([{
//           title: tournamentForm.title,
//           weight_classes: tournamentForm.weightClasses,
//           start_date: tournamentForm.startDate,
//           end_date: tournamentForm.endDate,
//           venue: tournamentForm.venue,
//           registration_deadline: tournamentForm.registrationDeadline || null,
//           max_players: tournamentForm.maxPlayers ? parseInt(tournamentForm.maxPlayers) : 32,
//           status: tournamentForm.status,
//           rules_notes: tournamentForm.rulesNotes
//         }])
//         .select()

//       if (error) {
//         console.error('❌ Tournament insert error:', error)
//         throw error
//       }

//       console.log('✅ Tournament created:', data)
//       toast.success('✅ Tournament created successfully!')
      
//       setTournamentForm({
//         title: '', weightClasses: '', startDate: '', endDate: '', 
//         venue: '', registrationDeadline: '', maxPlayers: '', 
//         status: 'upcoming', rulesNotes: '',
//       })
      
//     } catch (error) {
//       console.error('Tournament error:', error)
//       toast.error(error.message || 'Error creating tournament')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ====================== STAT CARDS ======================
//   const statCards = [
//     { icon: FaUsers, label: 'Total Users', value: stats.totalUsers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
//     { icon: FaUserClock, label: 'Pending', value: stats.pendingApplications, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
//     { icon: FaUserCheck, label: 'Approved', value: stats.approvedUsers, color: 'text-green-500', bg: 'bg-green-500/10' },
//     { icon: FaTimesCircle, label: 'Rejected', value: stats.rejectedUsers, color: 'text-red-500', bg: 'bg-red-500/10' },
//   ]

//   // ====================== RENDER FUNCTIONS ======================
//   const renderPlayerForm = () => (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       transition={{ duration: 0.3 }}
//       className="space-y-6"
//     >
//       <form onSubmit={handlePlayerSubmit} className="space-y-6">
//         {/* Personal Info */}
//         <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
//           <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//             <FaUser className="text-[#e11d48]" /> Personal Information
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Full Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="fullName"
//                 value={playerForm.fullName}
//                 onChange={handlePlayerChange}
//                 placeholder="Enter full name"
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   errors.fullName 
//                     ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
//                     : theme === 'dark' 
//                       ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                       : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//               {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 CNIC / B-Form <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="cnic"
//                 value={playerForm.cnic}
//                 onChange={handlePlayerChange}
//                 placeholder="XXXXX-XXXXXXX-X"
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   errors.cnic 
//                     ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
//                     : theme === 'dark' 
//                       ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                       : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//               {errors.cnic && <p className="text-red-500 text-xs mt-1">{errors.cnic}</p>}
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Date of Birth <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 name="dateOfBirth"
//                 value={playerForm.dateOfBirth}
//                 onChange={handlePlayerChange}
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   errors.dateOfBirth 
//                     ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
//                     : theme === 'dark' 
//                       ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                       : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//               {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Gender <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="gender"
//                 value={playerForm.gender}
//                 onChange={handlePlayerChange}
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   errors.gender 
//                     ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
//                     : theme === 'dark' 
//                       ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                       : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               >
//                 <option value="">Select Gender</option>
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//                 <option value="other">Other</option>
//               </select>
//               {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Contact Number <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="tel"
//                 name="contactNumber"
//                 value={playerForm.contactNumber}
//                 onChange={handlePlayerChange}
//                 placeholder="03XX-XXXXXXX"
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   errors.contactNumber 
//                     ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
//                     : theme === 'dark' 
//                       ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                       : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//               {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Emergency Contact <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="tel"
//                 name="emergencyContact"
//                 value={playerForm.emergencyContact}
//                 onChange={handlePlayerChange}
//                 placeholder="03XX-XXXXXXX"
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   errors.emergencyContact 
//                     ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
//                     : theme === 'dark' 
//                       ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                       : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//               {errors.emergencyContact && <p className="text-red-500 text-xs mt-1">{errors.emergencyContact}</p>}
//             </div>
//           </div>
//         </div>

//         {/* Boxing Specs */}
//         <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
//           <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//             <FaBoxes className="text-[#e11d48]" /> Boxing Specifications
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Weight (kg) <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="number"
//                 name="weight"
//                 value={playerForm.weight}
//                 onChange={handlePlayerChange}
//                 placeholder="75"
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   errors.weight 
//                     ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
//                     : theme === 'dark' 
//                       ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                       : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//               {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Height (cm) <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="number"
//                 name="height"
//                 value={playerForm.height}
//                 onChange={handlePlayerChange}
//                 placeholder="180"
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   errors.height 
//                     ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
//                     : theme === 'dark' 
//                       ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                       : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//               {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Boxing Stance <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="stance"
//                 value={playerForm.stance}
//                 onChange={handlePlayerChange}
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   errors.stance 
//                     ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
//                     : theme === 'dark' 
//                       ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                       : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               >
//                 <option value="">Select Stance</option>
//                 <option value="orthodox">Orthodox</option>
//                 <option value="southpaw">Southpaw</option>
//               </select>
//               {errors.stance && <p className="text-red-500 text-xs mt-1">{errors.stance}</p>}
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Experience Level <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="experienceLevel"
//                 value={playerForm.experienceLevel}
//                 onChange={handlePlayerChange}
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   errors.experienceLevel 
//                     ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
//                     : theme === 'dark' 
//                       ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                       : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               >
//                 <option value="">Select Level</option>
//                 <option value="beginner">Beginner</option>
//                 <option value="intermediate">Intermediate</option>
//                 <option value="pro">Professional</option>
//               </select>
//               {errors.experienceLevel && <p className="text-red-500 text-xs mt-1">{errors.experienceLevel}</p>}
//             </div>
//             <div className="md:col-span-2">
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Club / Academy Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="clubName"
//                 value={playerForm.clubName}
//                 onChange={handlePlayerChange}
//                 placeholder="Knockout Boxing Academy"
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   errors.clubName 
//                     ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
//                     : theme === 'dark' 
//                       ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                       : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//               {errors.clubName && <p className="text-red-500 text-xs mt-1">{errors.clubName}</p>}
//             </div>
//           </div>
//         </div>

//         {/* Medical Clearance */}
//         <div className={`rounded-xl p-6 border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-[#e11d48]/30' : 'bg-gray-50 border-[#e11d48]/20'}`}>
//           <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//             <FaHospital className="text-[#e11d48]" /> Medical Clearance <span className="text-red-500">* (Mandatory)</span>
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Clearance Status <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="clearanceStatus"
//                 value={playerForm.clearanceStatus}
//                 onChange={handlePlayerChange}
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   errors.clearanceStatus 
//                     ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
//                     : theme === 'dark' 
//                       ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                       : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               >
//                 <option value="">Select Status</option>
//                 <option value="passed">✅ Passed</option>
//                 <option value="pending">⏳ Pending</option>
//                 <option value="failed">❌ Failed</option>
//               </select>
//               {errors.clearanceStatus && <p className="text-red-500 text-xs mt-1">{errors.clearanceStatus}</p>}
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Checkup Date <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 name="checkupDate"
//                 value={playerForm.checkupDate}
//                 onChange={handlePlayerChange}
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   errors.checkupDate 
//                     ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
//                     : theme === 'dark' 
//                       ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                       : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//               {errors.checkupDate && <p className="text-red-500 text-xs mt-1">{errors.checkupDate}</p>}
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Fit for Combat
//               </label>
//               <div className="flex items-center gap-4 mt-2">
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     name="fitForCombat"
//                     checked={playerForm.fitForCombat}
//                     onChange={handlePlayerChange}
//                     className="w-5 h-5 rounded border-gray-300 text-[#e11d48] focus:ring-[#e11d48]"
//                   />
//                   <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Yes, fit for combat</span>
//                 </label>
//               </div>
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Doctor Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="doctorName"
//                 value={playerForm.doctorName}
//                 onChange={handlePlayerChange}
//                 placeholder="Dr. John Smith"
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   errors.doctorName 
//                     ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
//                     : theme === 'dark' 
//                       ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                       : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//               {errors.doctorName && <p className="text-red-500 text-xs mt-1">{errors.doctorName}</p>}
//             </div>
//             <div className="md:col-span-2">
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Medical Notes / Allergies
//               </label>
//               <textarea
//                 name="medicalNotes"
//                 value={playerForm.medicalNotes}
//                 onChange={handlePlayerChange}
//                 rows="2"
//                 placeholder="Any allergies or medical notes..."
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   theme === 'dark' 
//                     ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                     : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//             </div>
//           </div>
//         </div>

//         {/* File Uploads */}
//         <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
//           <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//             <FaFileMedical className="text-[#e11d48]" /> File Uploads
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Passport Size Photo <span className="text-red-500">*</span>
//               </label>
//               <div className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg transition cursor-pointer ${
//                 errors.photo 
//                   ? 'border-red-500' 
//                   : theme === 'dark' 
//                     ? 'border-gray-600 bg-gray-900 hover:border-[#e11d48]' 
//                     : 'border-gray-300 bg-white hover:border-[#e11d48]'
//               }`}>
//                 <label className="flex flex-col items-center justify-center w-full cursor-pointer">
//                   <FaImage className={`text-3xl mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
//                   <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                     {playerForm.photo ? playerForm.photo.name : 'Click to upload photo'}
//                   </span>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => handleFileChange(e, 'photo')}
//                     className="hidden"
//                   />
//                 </label>
//               </div>
//               {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Medical Fitness Certificate <span className="text-red-500">*</span>
//               </label>
//               <div className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg transition cursor-pointer ${
//                 errors.medicalCertificate 
//                   ? 'border-red-500' 
//                   : theme === 'dark' 
//                     ? 'border-gray-600 bg-gray-900 hover:border-[#e11d48]' 
//                     : 'border-gray-300 bg-white hover:border-[#e11d48]'
//               }`}>
//                 <label className="flex flex-col items-center justify-center w-full cursor-pointer">
//                   <FaFilePdf className={`text-3xl mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
//                   <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                     {playerForm.medicalCertificate ? playerForm.medicalCertificate.name : 'Click to upload certificate'}
//                   </span>
//                   <input
//                     type="file"
//                     accept=".pdf,.jpg,.jpeg,.png"
//                     onChange={(e) => handleFileChange(e, 'medicalCertificate')}
//                     className="hidden"
//                   />
//                 </label>
//               </div>
//               {errors.medicalCertificate && <p className="text-red-500 text-xs mt-1">{errors.medicalCertificate}</p>}
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-wrap gap-4 pt-4">
//           <button 
//             type="submit" 
//             disabled={loading}
//             className={`px-6 py-3 bg-[#e11d48] text-white rounded-lg font-display font-bold hover:scale-105 transition-transform flex items-center gap-2 ${
//               loading ? 'opacity-50 cursor-not-allowed' : ''
//             }`}
//           >
//             <FaSave /> {loading ? 'Registering...' : 'Register Player'}
//           </button>
//           <button 
//             type="button" 
//             onClick={resetPlayerForm} 
//             className={`px-6 py-3 rounded-lg font-display font-bold hover:scale-105 transition-transform flex items-center gap-2 ${
//               theme === 'dark' 
//                 ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
//                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//             }`}
//           >
//             <FaUndo /> Reset
//           </button>
//         </div>
//       </form>
//     </motion.div>
//   )

//   const renderTournamentForm = () => (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       transition={{ duration: 0.3 }}
//       className="space-y-6"
//     >
//       <form onSubmit={handleTournamentSubmit} className="space-y-6">
//         <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
//           <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//             <FaTrophy className="text-[#e11d48]" /> Tournament Details
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Tournament Title <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="title"
//                 value={tournamentForm.title}
//                 onChange={handleTournamentChange}
//                 placeholder="Golden Gloves Championship 2024"
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   theme === 'dark' 
//                     ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                     : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Allowed Weight Classes
//               </label>
//               <input
//                 type="text"
//                 name="weightClasses"
//                 value={tournamentForm.weightClasses}
//                 onChange={handleTournamentChange}
//                 placeholder="Heavyweight, Middleweight, Welterweight"
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   theme === 'dark' 
//                     ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                     : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Start Date <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 name="startDate"
//                 value={tournamentForm.startDate}
//                 onChange={handleTournamentChange}
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   theme === 'dark' 
//                     ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                     : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 End Date <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 name="endDate"
//                 value={tournamentForm.endDate}
//                 onChange={handleTournamentChange}
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   theme === 'dark' 
//                     ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                     : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Venue / Location <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="venue"
//                 value={tournamentForm.venue}
//                 onChange={handleTournamentChange}
//                 placeholder="Madison Square Garden, NYC"
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   theme === 'dark' 
//                     ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                     : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Registration Deadline
//               </label>
//               <input
//                 type="date"
//                 name="registrationDeadline"
//                 value={tournamentForm.registrationDeadline}
//                 onChange={handleTournamentChange}
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   theme === 'dark' 
//                     ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                     : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Maximum Players
//               </label>
//               <input
//                 type="number"
//                 name="maxPlayers"
//                 value={tournamentForm.maxPlayers}
//                 onChange={handleTournamentChange}
//                 placeholder="32"
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   theme === 'dark' 
//                     ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                     : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//             </div>
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Status <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="status"
//                 value={tournamentForm.status}
//                 onChange={handleTournamentChange}
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   theme === 'dark' 
//                     ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                     : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               >
//                 <option value="draft">Draft</option>
//                 <option value="upcoming">Upcoming</option>
//                 <option value="ongoing">Ongoing</option>
//                 <option value="completed">Completed</option>
//               </select>
//             </div>
//             <div className="md:col-span-2">
//               <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//                 Rules & Medical Requirements
//               </label>
//               <textarea
//                 name="rulesNotes"
//                 value={tournamentForm.rulesNotes}
//                 onChange={handleTournamentChange}
//                 rows="3"
//                 placeholder="List all rules, medical requirements, and important notes..."
//                 className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
//                   theme === 'dark' 
//                     ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
//                     : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
//                 }`}
//               />
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-wrap gap-4 pt-4">
//           <button 
//             type="submit" 
//             disabled={loading}
//             className={`px-6 py-3 bg-[#e11d48] text-white rounded-lg font-display font-bold hover:scale-105 transition-transform flex items-center gap-2 ${
//               loading ? 'opacity-50 cursor-not-allowed' : ''
//             }`}
//           >
//             <FaPlus /> {loading ? 'Creating...' : 'Create Tournament'}
//           </button>
//           <button 
//             type="reset" 
//             onClick={() => setTournamentForm({ 
//               title: '', weightClasses: '', startDate: '', endDate: '', 
//               venue: '', registrationDeadline: '', maxPlayers: '', 
//               status: 'upcoming', rulesNotes: '' 
//             })} 
//             className={`px-6 py-3 rounded-lg font-display font-bold hover:scale-105 transition-transform flex items-center gap-2 ${
//               theme === 'dark' 
//                 ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
//                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//             }`}
//           >
//             <FaUndo /> Reset
//           </button>
//         </div>
//       </form>
//     </motion.div>
//   )

//   // ====================== MAIN RENDER ======================
//   return (
//     <div className={`min-h-screen py-8 px-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <h1 className={`font-display text-3xl font-bold flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//             <FaUser className="text-[#e11d48]" /> Admin Dashboard
//           </h1>
//           <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
//             Manage users, applications, registrations, and tournaments
//           </p>
//         </div>

//         {/* Stats Cards */}
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

//         {/* Tabs */}
//         <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
//           {['applications', 'users', 'player-registration', 'tournament-management'].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 sm:px-6 py-2 rounded-t-lg font-display font-semibold transition-all whitespace-nowrap ${
//                 activeTab === tab
//                   ? 'bg-[#e11d48] text-white shadow-lg'
//                   : theme === 'dark'
//                   ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               {tab === 'applications' && <FaUserClock className="inline mr-2" />}
//               {tab === 'users' && <FaUsers className="inline mr-2" />}
//               {tab === 'player-registration' && <FaUser className="inline mr-2" />}
//               {tab === 'tournament-management' && <FaTrophy className="inline mr-2" />}
//               {tab === 'applications' && 'Applications'}
//               {tab === 'users' && 'Users'}
//               {tab === 'player-registration' && 'Player Registration'}
//               {tab === 'tournament-management' && 'Tournament Management'}
//             </button>
//           ))}
//         </div>

//         {/* Tab Content */}
//         <div className={`rounded-xl shadow-xl p-4 sm:p-6 border ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
//           <AnimatePresence mode="wait">
//             {activeTab === 'applications' && (
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -20 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <h2 className={`font-display text-xl sm:text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   Pending Applications
//                 </h2>
//                 <div className="overflow-x-auto">
//                   <table className="w-full min-w-[500px]">
//                     <thead>
//                       <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
//                         <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Name</th>
//                         <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Email</th>
//                         <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Role</th>
//                         <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {applications.map((app) => (
//                         <tr key={app.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
//                           <td className={`py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{app.full_name}</td>
//                           <td className={`py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{app.email}</td>
//                           <td className={`py-3 px-3 sm:px-4 capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{app.role}</td>
//                           <td className="py-3 px-3 sm:px-4">
//                             <div className="flex gap-2">
//                               <button onClick={() => handleApplication(app.id, 'approved')} className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"><FaCheckCircle /></button>
//                               <button onClick={() => handleApplication(app.id, 'rejected')} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"><FaTimesCircle /></button>
//                               <button className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors"><FaEye /></button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   {applications.length === 0 && (
//                     <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No pending applications</p>
//                   )}
//                 </div>
//               </motion.div>
//             )}

//             {activeTab === 'users' && (
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -20 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <h2 className={`font-display text-xl sm:text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   All Users
//                 </h2>
//                 <div className="overflow-x-auto">
//                   <table className="w-full min-w-[500px]">
//                     <thead>
//                       <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
//                         <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Name</th>
//                         <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Email</th>
//                         <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Role</th>
//                         <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {users.map((user) => (
//                         <tr key={user.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
//                           <td className={`py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{user.full_name}</td>
//                           <td className={`py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{user.email}</td>
//                           <td className={`py-3 px-3 sm:px-4 capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{user.role}</td>
//                           <td className="py-3 px-3 sm:px-4">
//                             <span className={`px-2 py-1 rounded-full text-xs ${
//                               user.status === 'approved' ? 'bg-green-500/20 text-green-500' :
//                               user.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
//                               'bg-red-500/20 text-red-500'
//                             }`}>{user.status}</span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </motion.div>
//             )}

//             {activeTab === 'player-registration' && renderPlayerForm()}
//             {activeTab === 'tournament-management' && renderTournamentForm()}
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default AdminDashboard


// export default AdminDashboard
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import { 
  FaUsers, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaEye, 
  FaUserCheck, FaUserClock, FaUser, FaIdCard, FaVenusMars, 
  FaPhone, FaWeight, FaRulerVertical, FaUserGraduate, FaHospital, 
  FaFileMedical, FaImage, FaFilePdf, FaTrophy, FaBoxes, 
  FaMapMarkerAlt, FaSave, FaUndo, FaPlus, FaUserFriends,
  FaEdit, FaTrash, FaSearch, FaFilter, FaDownload, FaPrint
} from 'react-icons/fa'
import { GiProgression } from 'react-icons/gi'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { addNotification, theme } = useStore()
  
  // ====================== STATE ======================
  const [applications, setApplications] = useState([])
  const [users, setUsers] = useState([])
  const [players, setPlayers] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [activeTab, setActiveTab] = useState('applications')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [editingTournament, setEditingTournament] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTournamentModal, setShowTournamentModal] = useState(false)

  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApplications: 0,
    approvedUsers: 0,
    rejectedUsers: 0,
    totalPlayers: 0,
    activePlayers: 0,
    totalTournaments: 0
  })

  // ====================== PLAYER FORM STATE ======================
  const [playerForm, setPlayerForm] = useState({
    fullName: '',
    cnic: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    emergencyContact: '',
    weight: '',
    height: '',
    stance: '',
    experienceLevel: '',
    clubName: '',
    clearanceStatus: '',
    checkupDate: '',
    fitForCombat: false,
    doctorName: '',
    medicalNotes: '',
    photo: null,
    medicalCertificate: null,
  })

  // ====================== TOURNAMENT FORM STATE ======================
  const [tournamentForm, setTournamentForm] = useState({
    title: '',
    weightClasses: '',
    startDate: '',
    endDate: '',
    venue: '',
    registrationDeadline: '',
    maxPlayers: '',
    status: 'upcoming',
    rulesNotes: '',
  })

  // ====================== VALIDATION ERRORS ======================
  const [errors, setErrors] = useState({})

  // ====================== FETCH DATA ======================
  useEffect(() => {
    fetchApplications()
    fetchUsers()
    fetchPlayers()
    fetchTournaments()
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
      setStats(prev => ({
        ...prev,
        totalUsers: data.length,
        pendingApplications: data.filter(u => u.status === 'pending').length,
        approvedUsers: data.filter(u => u.status === 'approved').length,
        rejectedUsers: data.filter(u => u.status === 'rejected').length
      }))
    }
  }

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      setPlayers(data)
      setStats(prev => ({
        ...prev,
        totalPlayers: data.length,
        activePlayers: data.filter(p => p.status === 'active').length
      }))
    }
  }

  const fetchTournaments = async () => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      setTournaments(data)
      setStats(prev => ({
        ...prev,
        totalTournaments: data.length
      }))
    }
  }

  // ====================== APPLICATION HANDLER ======================
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

  // ====================== PLAYER CRUD OPERATIONS ======================
  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return
    
    setLoading(true)
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId)
    
    if (!error) {
      toast.success('Player deleted successfully')
      fetchPlayers()
    } else {
      toast.error('Error deleting player')
    }
    setLoading(false)
  }

  const handleEditPlayer = (player) => {
    setEditingPlayer(player)
    setPlayerForm({
      fullName: player.full_name || '',
      cnic: player.cnic || '',
      dateOfBirth: player.date_of_birth || '',
      gender: player.gender || '',
      contactNumber: player.contact_number || '',
      emergencyContact: player.emergency_contact || '',
      weight: player.weight || '',
      height: player.height || '',
      stance: player.stance || '',
      experienceLevel: player.experience_level || '',
      clubName: player.club_name || '',
      clearanceStatus: player.clearance_status || '',
      checkupDate: player.checkup_date || '',
      fitForCombat: player.fit_for_combat || false,
      doctorName: player.doctor_name || '',
      medicalNotes: player.medical_notes || '',
      photo: null,
      medicalCertificate: null,
    })
    setShowEditModal(true)
  }

  const handleUpdatePlayer = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updateData = {
        full_name: playerForm.fullName,
        cnic: playerForm.cnic,
        date_of_birth: playerForm.dateOfBirth,
        gender: playerForm.gender,
        contact_number: playerForm.contactNumber,
        emergency_contact: playerForm.emergencyContact,
        weight: parseFloat(playerForm.weight),
        height: parseFloat(playerForm.height),
        stance: playerForm.stance,
        experience_level: playerForm.experienceLevel,
        club_name: playerForm.clubName,
        clearance_status: playerForm.clearanceStatus,
        checkup_date: playerForm.checkupDate,
        fit_for_combat: playerForm.fitForCombat,
        doctor_name: playerForm.doctorName,
        medical_notes: playerForm.medicalNotes,
        updated_at: new Date()
      }

      const { error } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', editingPlayer.id)

      if (error) throw error

      toast.success('Player updated successfully!')
      setShowEditModal(false)
      setEditingPlayer(null)
      fetchPlayers()
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error.message || 'Error updating player')
    }
    setLoading(false)
  }

  // ====================== TOURNAMENT CRUD OPERATIONS ======================
  const handleDeleteTournament = async (tournamentId) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return
    
    setLoading(true)
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentId)
    
    if (!error) {
      toast.success('Tournament deleted successfully')
      fetchTournaments()
    } else {
      toast.error('Error deleting tournament')
    }
    setLoading(false)
  }

  const handleEditTournament = (tournament) => {
    setEditingTournament(tournament)
    setTournamentForm({
      title: tournament.title || '',
      weightClasses: tournament.weight_classes || '',
      startDate: tournament.start_date || '',
      endDate: tournament.end_date || '',
      venue: tournament.venue || '',
      registrationDeadline: tournament.registration_deadline || '',
      maxPlayers: tournament.max_players || '',
      status: tournament.status || 'upcoming',
      rulesNotes: tournament.rules_notes || '',
    })
    setShowTournamentModal(true)
  }

  const handleUpdateTournament = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updateData = {
        title: tournamentForm.title,
        weight_classes: tournamentForm.weightClasses,
        start_date: tournamentForm.startDate,
        end_date: tournamentForm.endDate,
        venue: tournamentForm.venue,
        registration_deadline: tournamentForm.registrationDeadline || null,
        max_players: tournamentForm.maxPlayers ? parseInt(tournamentForm.maxPlayers) : 32,
        status: tournamentForm.status,
        rules_notes: tournamentForm.rulesNotes,
        updated_at: new Date()
      }

      const { error } = await supabase
        .from('tournaments')
        .update(updateData)
        .eq('id', editingTournament.id)

      if (error) throw error

      toast.success('Tournament updated successfully!')
      setShowTournamentModal(false)
      setEditingTournament(null)
      fetchTournaments()
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error.message || 'Error updating tournament')
    }
    setLoading(false)
  }

  // ====================== PLAYER FORM HANDLERS ======================
  const handlePlayerChange = (e) => {
    const { name, value, type, checked } = e.target
    setPlayerForm({
      ...playerForm,
      [name]: type === 'checkbox' ? checked : value,
    })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      setPlayerForm({ ...playerForm, [fieldName]: file })
      if (errors[fieldName]) {
        setErrors({ ...errors, [fieldName]: '' })
      }
    }
  }

  const validatePlayerForm = () => {
    const newErrors = {}
    
    if (!playerForm.fullName?.trim()) newErrors.fullName = 'Full Name is required'
    if (!playerForm.cnic?.trim()) newErrors.cnic = 'CNIC / B-Form is required'
    if (!playerForm.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required'
    if (!playerForm.gender) newErrors.gender = 'Gender is required'
    if (!playerForm.contactNumber?.trim()) newErrors.contactNumber = 'Contact Number is required'
    if (!playerForm.emergencyContact?.trim()) newErrors.emergencyContact = 'Emergency Contact is required'
    if (!playerForm.weight) newErrors.weight = 'Weight is required'
    if (!playerForm.height) newErrors.height = 'Height is required'
    if (!playerForm.stance) newErrors.stance = 'Boxing Stance is required'
    if (!playerForm.experienceLevel) newErrors.experienceLevel = 'Experience Level is required'
    if (!playerForm.clubName?.trim()) newErrors.clubName = 'Club / Academy Name is required'
    
    if (!playerForm.clearanceStatus) {
      newErrors.clearanceStatus = 'Medical Clearance Status is required'
    } else if (playerForm.clearanceStatus === 'failed') {
      newErrors.clearanceStatus = '❌ Cannot register player with FAILED medical clearance'
    } else if (playerForm.clearanceStatus === 'pending') {
      newErrors.clearanceStatus = '⏳ Medical clearance must be PASSED to register'
    }
    
    if (!playerForm.checkupDate) newErrors.checkupDate = 'Checkup Date is required'
    if (!playerForm.doctorName?.trim()) newErrors.doctorName = 'Doctor Name is required'
    if (!playerForm.photo) newErrors.photo = 'Passport Size Photo is required'
    if (!playerForm.medicalCertificate) newErrors.medicalCertificate = 'Medical Fitness Certificate is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ====================== PLAYER SUBMIT ======================
  const handlePlayerSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    if (!validatePlayerForm()) {
      setLoading(false)
      toast.error('Please fix all validation errors')
      return
    }

    try {
      console.log('📝 Starting player registration...')

      const { count, error: countError } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('cnic', playerForm.cnic)

      if (countError) {
        console.error('Count error:', countError)
      }

      if (count && count > 0) {
        toast.error('Player with this CNIC already exists!')
        setLoading(false)
        return
      }

      // Upload Photo
      let photoUrl = null
      if (playerForm.photo) {
        try {
          const fileExt = playerForm.photo.name.split('.').pop()
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`
          const filePath = `players/${fileName}`

          const { error: uploadPhotoError } = await supabase.storage
            .from('player-photos')
            .upload(filePath, playerForm.photo, {
              cacheControl: '3600',
              upsert: false
            })

          if (!uploadPhotoError) {
            const { data: { publicUrl } } = supabase.storage
              .from('player-photos')
              .getPublicUrl(filePath)
            photoUrl = publicUrl
            console.log('✅ Photo uploaded successfully!')
          }
        } catch (error) {
          console.error('Photo upload error:', error)
        }
      }

      // Upload Medical Certificate
      let medicalUrl = null
      if (playerForm.medicalCertificate) {
        try {
          const fileExt = playerForm.medicalCertificate.name.split('.').pop()
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`
          const filePath = `medical/${fileName}`

          const { error: uploadCertError } = await supabase.storage
            .from('medical-certificates')
            .upload(filePath, playerForm.medicalCertificate, {
              cacheControl: '3600',
              upsert: false
            })

          if (!uploadCertError) {
            const { data: { publicUrl } } = supabase.storage
              .from('medical-certificates')
              .getPublicUrl(filePath)
            medicalUrl = publicUrl
            console.log('✅ Certificate uploaded successfully!')
          }
        } catch (error) {
          console.error('Certificate upload error:', error)
        }
      }

      // Create Auth User
      const tempEmail = `${playerForm.cnic}@punchtrack.com`
      const tempPassword = 'Temp@123456'

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            full_name: playerForm.fullName,
            role: 'player'
          }
        }
      })

      if (authError) {
        console.error('❌ Auth error:', authError)
        if (authError.message.includes('already registered')) {
          toast.error('User already exists with this CNIC')
        } else {
          toast.error('Auth error: ' + authError.message)
        }
        setLoading(false)
        return
      }

      if (!authData?.user) {
        console.error('❌ No user returned from auth')
        toast.error('Failed to create user account')
        setLoading(false)
        return
      }

      console.log('✅ Auth user created:', authData.user.id)

      // Insert Player Data
      const playerData = {
        user_id: authData.user.id,
        full_name: playerForm.fullName,
        cnic: playerForm.cnic,
        date_of_birth: playerForm.dateOfBirth,
        gender: playerForm.gender,
        contact_number: playerForm.contactNumber,
        emergency_contact: playerForm.emergencyContact,
        weight: parseFloat(playerForm.weight),
        height: parseFloat(playerForm.height),
        stance: playerForm.stance,
        experience_level: playerForm.experienceLevel,
        club_name: playerForm.clubName,
        clearance_status: playerForm.clearanceStatus,
        checkup_date: playerForm.checkupDate,
        fit_for_combat: playerForm.fitForCombat,
        doctor_name: playerForm.doctorName,
        medical_notes: playerForm.medicalNotes,
        photo_url: photoUrl,
        medical_certificate_url: medicalUrl,
        status: 'active'
      }

      const { data: insertedData, error: playerError } = await supabase
        .from('players')
        .insert([playerData])
        .select()

      if (playerError) {
        console.error('❌ Player insert error:', playerError)
        toast.error('Database error: ' + playerError.message)
        setLoading(false)
        return
      }

      console.log('✅ Player inserted successfully:', insertedData)

      await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', authData.user.id)

      toast.success('✅ Player registered successfully!')
      resetPlayerForm()
      fetchPlayers()
      fetchUsers()
      
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      toast.error(error.message || 'Error registering player')
    } finally {
      setLoading(false)
    }
  }

  const resetPlayerForm = () => {
    setPlayerForm({
      fullName: '', cnic: '', dateOfBirth: '', gender: '', contactNumber: '', emergencyContact: '',
      weight: '', height: '', stance: '', experienceLevel: '', clubName: '',
      clearanceStatus: '', checkupDate: '', fitForCombat: false, doctorName: '', medicalNotes: '',
      photo: null, medicalCertificate: null,
    })
    setErrors({})
  }

  // ====================== TOURNAMENT HANDLERS ======================
  const handleTournamentChange = (e) => {
    const { name, value } = e.target
    setTournamentForm({ ...tournamentForm, [name]: value })
  }

  const handleTournamentSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!tournamentForm.title?.trim()) {
      toast.error('Tournament Title is required')
      setLoading(false)
      return
    }
    if (!tournamentForm.startDate || !tournamentForm.endDate) {
      toast.error('Start and End Dates are required')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert([{
          title: tournamentForm.title,
          weight_classes: tournamentForm.weightClasses,
          start_date: tournamentForm.startDate,
          end_date: tournamentForm.endDate,
          venue: tournamentForm.venue,
          registration_deadline: tournamentForm.registrationDeadline || null,
          max_players: tournamentForm.maxPlayers ? parseInt(tournamentForm.maxPlayers) : 32,
          status: tournamentForm.status,
          rules_notes: tournamentForm.rulesNotes
        }])
        .select()

      if (error) {
        console.error('❌ Tournament insert error:', error)
        throw error
      }

      console.log('✅ Tournament created:', data)
      toast.success('✅ Tournament created successfully!')
      
      setTournamentForm({
        title: '', weightClasses: '', startDate: '', endDate: '', 
        venue: '', registrationDeadline: '', maxPlayers: '', 
        status: 'upcoming', rulesNotes: '',
      })
      
    } catch (error) {
      console.error('Tournament error:', error)
      toast.error(error.message || 'Error creating tournament')
    } finally {
      setLoading(false)
    }
  }

  // ====================== FILTER FUNCTIONS ======================
  const filteredPlayers = players.filter(player =>
    player.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.cnic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.club_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTournaments = tournaments.filter(tournament =>
    tournament.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tournament.venue?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ====================== STAT CARDS ======================
  const statCards = [
    { icon: FaUsers, label: 'Total Users', value: stats.totalUsers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: FaUserClock, label: 'Pending Apps', value: stats.pendingApplications, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { icon: FaUserFriends, label: 'Total Players', value: stats.totalPlayers, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { icon: FaTrophy, label: 'Tournaments', value: stats.totalTournaments, color: 'text-green-500', bg: 'bg-green-500/10' },
  ]

  // ====================== RENDER FUNCTIONS (Defined BEFORE return) ======================

  // 1. Render Players Data Table
  const renderPlayersData = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className={`font-display text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Registered Players
          <span className={`text-sm font-normal ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            ({filteredPlayers.length} players)
          </span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[200px]">
            <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition outline-none ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
              }`}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>#</th>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Name</th>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>CNIC</th>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Weight</th>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Stance</th>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Medical</th>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan="8" className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  No players registered yet
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player, index) => (
                <tr key={player.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
                  <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{index + 1}</td>
                  <td className={`py-3 px-3 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {player.full_name}
                  </td>
                  <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{player.cnic}</td>
                  <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{player.weight} kg</td>
                  <td className={`py-3 px-3 capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{player.stance}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      player.clearance_status === 'passed' ? 'bg-green-500/20 text-green-500' :
                      player.clearance_status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {player.clearance_status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      player.status === 'active' ? 'bg-green-500/20 text-green-500' :
                      player.status === 'inactive' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {player.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditPlayer(player)}
                        className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeletePlayer(player.id)}
                        className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                      <button 
                        className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                        title="View"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )

  // 2. Render Tournaments Data Table
  const renderTournamentsData = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className={`font-display text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Tournaments
          <span className={`text-sm font-normal ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            ({filteredTournaments.length} tournaments)
          </span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[200px]">
            <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition outline-none ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
              }`}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>#</th>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Title</th>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Venue</th>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Start Date</th>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>End Date</th>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Players</th>
              <th className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTournaments.length === 0 ? (
              <tr>
                <td colSpan="8" className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  No tournaments created yet
                </td>
              </tr>
            ) : (
              filteredTournaments.map((tournament, index) => (
                <tr key={tournament.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
                  <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{index + 1}</td>
                  <td className={`py-3 px-3 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {tournament.title}
                  </td>
                  <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{tournament.venue}</td>
                  <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {new Date(tournament.start_date).toLocaleDateString()}
                  </td>
                  <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {new Date(tournament.end_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tournament.status === 'upcoming' ? 'bg-blue-500/20 text-blue-500' :
                      tournament.status === 'ongoing' ? 'bg-green-500/20 text-green-500' :
                      tournament.status === 'completed' ? 'bg-purple-500/20 text-purple-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {tournament.status}
                    </span>
                  </td>
                  <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {tournament.max_players || 32}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditTournament(tournament)}
                        className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteTournament(tournament.id)}
                        className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                      <button 
                        className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                        title="View"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )

  // 3. Render Player Registration Form
  const renderPlayerForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-[#e11d48]/10 border border-[#e11d48]/20 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-bold text-[#e11d48]">Note:</span> All fields marked with <span className="text-red-500">*</span> are required. Medical clearance must be <span className="font-bold text-green-500">PASSED</span> to register.
        </p>
      </div>

      <form onSubmit={handlePlayerSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaUser className="text-[#e11d48]" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={playerForm.fullName}
                onChange={handlePlayerChange}
                placeholder="Enter full name"
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  errors.fullName 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                CNIC / B-Form <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cnic"
                value={playerForm.cnic}
                onChange={handlePlayerChange}
                placeholder="XXXXX-XXXXXXX-X"
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  errors.cnic 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
              {errors.cnic && <p className="text-red-500 text-xs mt-1">{errors.cnic}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={playerForm.dateOfBirth}
                onChange={handlePlayerChange}
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  errors.dateOfBirth 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                      : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={playerForm.gender}
                onChange={handlePlayerChange}
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  errors.gender 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                      : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={playerForm.contactNumber}
                onChange={handlePlayerChange}
                placeholder="03XX-XXXXXXX"
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  errors.contactNumber 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
              {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Emergency Contact <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="emergencyContact"
                value={playerForm.emergencyContact}
                onChange={handlePlayerChange}
                placeholder="03XX-XXXXXXX"
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  errors.emergencyContact 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
              {errors.emergencyContact && <p className="text-red-500 text-xs mt-1">{errors.emergencyContact}</p>}
            </div>
          </div>
        </div>

        {/* Boxing Specs - Continue with remaining form fields */}
        <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaBoxes className="text-[#e11d48]" /> Boxing Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="weight"
                value={playerForm.weight}
                onChange={handlePlayerChange}
                placeholder="75"
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  errors.weight 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
              {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Height (cm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="height"
                value={playerForm.height}
                onChange={handlePlayerChange}
                placeholder="180"
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  errors.height 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
              {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Boxing Stance <span className="text-red-500">*</span>
              </label>
              <select
                name="stance"
                value={playerForm.stance}
                onChange={handlePlayerChange}
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  errors.stance 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                      : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              >
                <option value="">Select Stance</option>
                <option value="orthodox">Orthodox</option>
                <option value="southpaw">Southpaw</option>
              </select>
              {errors.stance && <p className="text-red-500 text-xs mt-1">{errors.stance}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Experience Level <span className="text-red-500">*</span>
              </label>
              <select
                name="experienceLevel"
                value={playerForm.experienceLevel}
                onChange={handlePlayerChange}
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  errors.experienceLevel 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                      : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              >
                <option value="">Select Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="pro">Professional</option>
              </select>
              {errors.experienceLevel && <p className="text-red-500 text-xs mt-1">{errors.experienceLevel}</p>}
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Club / Academy Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="clubName"
                value={playerForm.clubName}
                onChange={handlePlayerChange}
                placeholder="Knockout Boxing Academy"
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  errors.clubName 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
              {errors.clubName && <p className="text-red-500 text-xs mt-1">{errors.clubName}</p>}
            </div>
          </div>
        </div>

        {/* Medical Clearance */}
        <div className={`rounded-xl p-6 border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-[#e11d48]/30' : 'bg-gray-50 border-[#e11d48]/20'}`}>
          <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaHospital className="text-[#e11d48]" /> Medical Clearance <span className="text-red-500">* (Mandatory)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Clearance Status <span className="text-red-500">*</span>
              </label>
              <select
                name="clearanceStatus"
                value={playerForm.clearanceStatus}
                onChange={handlePlayerChange}
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  errors.clearanceStatus 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                      : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              >
                <option value="">Select Status</option>
                <option value="passed">✅ Passed</option>
                <option value="pending">⏳ Pending</option>
                <option value="failed">❌ Failed</option>
              </select>
              {errors.clearanceStatus && <p className="text-red-500 text-xs mt-1">{errors.clearanceStatus}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Checkup Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="checkupDate"
                value={playerForm.checkupDate}
                onChange={handlePlayerChange}
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  errors.checkupDate 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                      : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
              {errors.checkupDate && <p className="text-red-500 text-xs mt-1">{errors.checkupDate}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Fit for Combat
              </label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="fitForCombat"
                    checked={playerForm.fitForCombat}
                    onChange={handlePlayerChange}
                    className="w-5 h-5 rounded border-gray-300 text-[#e11d48] focus:ring-[#e11d48]"
                  />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Yes, fit for combat</span>
                </label>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Doctor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="doctorName"
                value={playerForm.doctorName}
                onChange={handlePlayerChange}
                placeholder="Dr. John Smith"
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  errors.doctorName 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
              {errors.doctorName && <p className="text-red-500 text-xs mt-1">{errors.doctorName}</p>}
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Medical Notes / Allergies
              </label>
              <textarea
                name="medicalNotes"
                value={playerForm.medicalNotes}
                onChange={handlePlayerChange}
                rows="2"
                placeholder="Any allergies or medical notes..."
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
            </div>
          </div>
        </div>

        {/* File Uploads */}
        <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaFileMedical className="text-[#e11d48]" /> File Uploads
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Passport Size Photo <span className="text-red-500">*</span>
              </label>
              <div className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg transition cursor-pointer ${
                errors.photo 
                  ? 'border-red-500' 
                  : theme === 'dark' 
                    ? 'border-gray-600 bg-gray-900 hover:border-[#e11d48]' 
                    : 'border-gray-300 bg-white hover:border-[#e11d48]'
              }`}>
                <label className="flex flex-col items-center justify-center w-full cursor-pointer">
                  <FaImage className={`text-3xl mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {playerForm.photo ? playerForm.photo.name : 'Click to upload photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'photo')}
                    className="hidden"
                  />
                </label>
              </div>
              {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Medical Fitness Certificate <span className="text-red-500">*</span>
              </label>
              <div className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg transition cursor-pointer ${
                errors.medicalCertificate 
                  ? 'border-red-500' 
                  : theme === 'dark' 
                    ? 'border-gray-600 bg-gray-900 hover:border-[#e11d48]' 
                    : 'border-gray-300 bg-white hover:border-[#e11d48]'
              }`}>
                <label className="flex flex-col items-center justify-center w-full cursor-pointer">
                  <FaFilePdf className={`text-3xl mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {playerForm.medicalCertificate ? playerForm.medicalCertificate.name : 'Click to upload certificate'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'medicalCertificate')}
                    className="hidden"
                  />
                </label>
              </div>
              {errors.medicalCertificate && <p className="text-red-500 text-xs mt-1">{errors.medicalCertificate}</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className={`px-6 py-3 bg-[#e11d48] text-white rounded-lg font-display font-bold hover:scale-105 transition-transform flex items-center gap-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaSave /> {loading ? 'Registering...' : 'Register Player'}
          </button>
          <button 
            type="button" 
            onClick={resetPlayerForm} 
            className={`px-6 py-3 rounded-lg font-display font-bold hover:scale-105 transition-transform flex items-center gap-2 ${
              theme === 'dark' 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaUndo /> Reset
          </button>
        </div>
      </form>
    </motion.div>
  )

  // 4. Render Tournament Form
  const renderTournamentForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-[#e11d48]/10 border border-[#e11d48]/20 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-bold text-[#e11d48]">Note:</span> All fields marked with <span className="text-red-500">*</span> are required. Create a new tournament with complete details.
        </p>
      </div>

      <form onSubmit={handleTournamentSubmit} className="space-y-6">
        <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaTrophy className="text-[#e11d48]" /> Tournament Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Tournament Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={tournamentForm.title}
                onChange={handleTournamentChange}
                placeholder="Golden Gloves Championship 2024"
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Allowed Weight Classes
              </label>
              <input
                type="text"
                name="weightClasses"
                value={tournamentForm.weightClasses}
                onChange={handleTournamentChange}
                placeholder="Heavyweight, Middleweight, Welterweight"
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={tournamentForm.startDate}
                onChange={handleTournamentChange}
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                    : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={tournamentForm.endDate}
                onChange={handleTournamentChange}
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                    : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Venue / Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="venue"
                value={tournamentForm.venue}
                onChange={handleTournamentChange}
                placeholder="Madison Square Garden, NYC"
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Registration Deadline
              </label>
              <input
                type="date"
                name="registrationDeadline"
                value={tournamentForm.registrationDeadline}
                onChange={handleTournamentChange}
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                    : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Maximum Players
              </label>
              <input
                type="number"
                name="maxPlayers"
                value={tournamentForm.maxPlayers}
                onChange={handleTournamentChange}
                placeholder="32"
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={tournamentForm.status}
                onChange={handleTournamentChange}
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-900 text-white focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                    : 'border-gray-300 bg-white text-gray-900 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              >
                <option value="draft">Draft</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Rules & Medical Requirements
              </label>
              <textarea
                name="rulesNotes"
                value={tournamentForm.rulesNotes}
                onChange={handleTournamentChange}
                rows="3"
                placeholder="List all rules, medical requirements, and important notes..."
                className={`w-full px-4 py-2 rounded-lg border transition outline-none ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#e11d48] focus:ring-2 focus:ring-[#e11d48]/20'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className={`px-6 py-3 bg-[#e11d48] text-white rounded-lg font-display font-bold hover:scale-105 transition-transform flex items-center gap-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaPlus /> {loading ? 'Creating...' : 'Create Tournament'}
          </button>
          <button 
            type="reset" 
            onClick={() => setTournamentForm({ 
              title: '', weightClasses: '', startDate: '', endDate: '', 
              venue: '', registrationDeadline: '', maxPlayers: '', 
              status: 'upcoming', rulesNotes: '' 
            })} 
            className={`px-6 py-3 rounded-lg font-display font-bold hover:scale-105 transition-transform flex items-center gap-2 ${
              theme === 'dark' 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaUndo /> Reset
          </button>
        </div>
      </form>
    </motion.div>
  )

  // ====================== MAIN RENDER ======================
  return (
    <div className={`min-h-screen py-8 px-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`font-display text-3xl font-bold flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaUser className="text-[#e11d48]" /> Admin Dashboard
          </h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Complete management system for users, players, tournaments, and applications
          </p>
        </div>

        {/* Stats Cards */}
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
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
          {[
            { id: 'applications', label: 'Applications', icon: FaUserClock },
            { id: 'users', label: 'Users', icon: FaUsers },
            { id: 'players-data', label: 'Players Data', icon: FaUserFriends },
            { id: 'tournaments-data', label: 'Tournaments Data', icon: FaTrophy },
            { id: 'player-registration', label: 'Register Player', icon: FaUser },
            { id: 'tournament-management', label: 'Create Tournament', icon: FaPlus }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-5 py-2 rounded-t-lg font-display font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'bg-[#e11d48] text-white shadow-lg'
                  : theme === 'dark'
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <tab.icon className="inline mr-1 sm:mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={`rounded-xl shadow-xl p-4 sm:p-6 border ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <AnimatePresence mode="wait">
            {activeTab === 'applications' && (
              <motion.div
                key="applications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className={`font-display text-xl sm:text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Pending Applications
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
                        <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Name</th>
                        <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Email</th>
                        <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Role</th>
                        <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
                          <td className={`py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{app.full_name}</td>
                          <td className={`py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{app.email}</td>
                          <td className={`py-3 px-3 sm:px-4 capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{app.role}</td>
                          <td className="py-3 px-3 sm:px-4">
                            <div className="flex gap-2">
                              <button onClick={() => handleApplication(app.id, 'approved')} className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"><FaCheckCircle /></button>
                              <button onClick={() => handleApplication(app.id, 'rejected')} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"><FaTimesCircle /></button>
                              <button className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors"><FaEye /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {applications.length === 0 && (
                    <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No pending applications</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className={`font-display text-xl sm:text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  All Users
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
                        <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Name</th>
                        <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Email</th>
                        <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Role</th>
                        <th className={`text-left py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
                          <td className={`py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{user.full_name}</td>
                          <td className={`py-3 px-3 sm:px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{user.email}</td>
                          <td className={`py-3 px-3 sm:px-4 capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{user.role}</td>
                          <td className="py-3 px-3 sm:px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                              user.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-red-500/20 text-red-500'
                            }`}>{user.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'players-data' && renderPlayersData()}
            {activeTab === 'tournaments-data' && renderTournamentsData()}
            {activeTab === 'player-registration' && renderPlayerForm()}
            {activeTab === 'tournament-management' && renderTournamentForm()}
          </AnimatePresence>
        </div>
      </div>

      {/* ====== EDIT PLAYER MODAL ====== */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
              theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            <h2 className={`font-display text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Edit Player
            </h2>
            <form onSubmit={handleUpdatePlayer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                  <input
                    type="text"
                    value={playerForm.fullName}
                    onChange={(e) => setPlayerForm({ ...playerForm, fullName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>CNIC</label>
                  <input
                    type="text"
                    value={playerForm.cnic}
                    onChange={(e) => setPlayerForm({ ...playerForm, cnic: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Weight (kg)</label>
                  <input
                    type="number"
                    value={playerForm.weight}
                    onChange={(e) => setPlayerForm({ ...playerForm, weight: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Height (cm)</label>
                  <input
                    type="number"
                    value={playerForm.height}
                    onChange={(e) => setPlayerForm({ ...playerForm, height: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Stance</label>
                  <select
                    value={playerForm.stance}
                    onChange={(e) => setPlayerForm({ ...playerForm, stance: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  >
                    <option value="orthodox">Orthodox</option>
                    <option value="southpaw">Southpaw</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Experience Level</label>
                  <select
                    value={playerForm.experienceLevel}
                    onChange={(e) => setPlayerForm({ ...playerForm, experienceLevel: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="pro">Professional</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Clearance Status</label>
                  <select
                    value={playerForm.clearanceStatus}
                    onChange={(e) => setPlayerForm({ ...playerForm, clearanceStatus: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  >
                    <option value="passed">Passed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Club Name</label>
                  <input
                    type="text"
                    value={playerForm.clubName}
                    onChange={(e) => setPlayerForm({ ...playerForm, clubName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Medical Notes</label>
                  <textarea
                    value={playerForm.medicalNotes}
                    onChange={(e) => setPlayerForm({ ...playerForm, medicalNotes: e.target.value })}
                    rows="2"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className={`px-6 py-2 bg-[#e11d48] text-white rounded-lg font-display font-bold hover:scale-105 transition-transform ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                  {loading ? 'Updating...' : 'Update Player'}
                </button>
                <button type="button" onClick={() => { setShowEditModal(false); setEditingPlayer(null); }} className={`px-6 py-2 rounded-lg font-display font-bold ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ====== EDIT TOURNAMENT MODAL ====== */}
      {showTournamentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
              theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            <h2 className={`font-display text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Edit Tournament
            </h2>
            <form onSubmit={handleUpdateTournament} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Title</label>
                  <input
                    type="text"
                    value={tournamentForm.title}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, title: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Venue</label>
                  <input
                    type="text"
                    value={tournamentForm.venue}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, venue: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                  <select
                    value={tournamentForm.status}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, status: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  >
                    <option value="draft">Draft</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Start Date</label>
                  <input
                    type="date"
                    value={tournamentForm.startDate}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, startDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>End Date</label>
                  <input
                    type="date"
                    value={tournamentForm.endDate}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, endDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Max Players</label>
                  <input
                    type="number"
                    value={tournamentForm.maxPlayers}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, maxPlayers: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Rules & Notes</label>
                  <textarea
                    value={tournamentForm.rulesNotes}
                    onChange={(e) => setTournamentForm({ ...tournamentForm, rulesNotes: e.target.value })}
                    rows="3"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className={`px-6 py-2 bg-[#e11d48] text-white rounded-lg font-display font-bold hover:scale-105 transition-transform ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                  {loading ? 'Updating...' : 'Update Tournament'}
                </button>
                <button type="button" onClick={() => { setShowTournamentModal(false); setEditingTournament(null); }} className={`px-6 py-2 rounded-lg font-display font-bold ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard