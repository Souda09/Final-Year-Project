import React from 'react'
import { motion } from 'framer-motion'
import { FaTrophy, FaUsers, FaChartLine, FaMedal, FaCalendarAlt, FaShieldAlt, FaAward } from 'react-icons/fa'
import { GiProgression } from 'react-icons/gi'
import LiveTicker from '../components/LiveTicker'
import MatchCard from '../components/MatchCard'
import logo from '/logo.png'

const Home = () => {
  const featuredMatches = [
    { fighter1: { name: "Mike Tyson" }, fighter2: { name: "Evander Holyfield" }, score1: 95, score2: 93, round: 12, winner: "Mike Tyson", status: "completed" },
    { fighter1: { name: "Canelo Alvarez" }, fighter2: { name: "GGG Golovkin" }, score1: 89, score2: 89, round: 8, status: "live" }
  ]

  const stats = [
    { icon: FaTrophy, value: "150+", label: "Tournaments" },
    { icon: FaUsers, value: "2,500+", label: "Athletes" },
    { icon: FaMedal, value: "500+", label: "Champions" },
    { icon: FaChartLine, value: "1M+", label: "Fans Engaged" }
  ]

  const features = [
    { icon: GiProgression, title: "Professional Scoring", description: "Advanced scoring system with real-time updates" },
    { icon: FaCalendarAlt, title: "Smart Scheduling", description: "Automated tournament brackets" },
    { icon: FaShieldAlt, title: "Fair Play", description: "Blockchain-verified results" },
    { icon: FaAward, title: "Career Tracking", description: "Comprehensive fighter statistics" }
  ]

  return (
    <div className="min-h-screen">
      <LiveTicker />
      
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e11d48]/20 via-transparent to-[#fbbf24]/20"></div>
        <div className="relative container-responsive text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <img src={logo} alt="PunchTrack Logo" className="w-45 h-35 mx-auto mb-6" />
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6">
              <span className="gradient-text">PunchTrack</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 md:mb-8 max-w-3xl mx-auto px-4">
              The Ultimate Boxing Tournament Management Platform — Where Champions Are Made
            </p>
            <div className="flex flex-wrap gap-4 justify-center px-4">
              <button className="px-6 md:px-8 py-2 md:py-3 bg-[#e11d48] text-white rounded-lg font-display font-bold hover:scale-105 transition-transform">Get Started</button>
              <button className="px-6 md:px-8 py-2 md:py-3 glass rounded-lg font-display font-bold hover:scale-105 transition-transform">Watch Live</button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container-responsive">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="text-center p-4">
                <stat.icon className="text-3xl md:text-4xl text-[#e11d48] mx-auto mb-3 md:mb-4" />
                <div className="text-2xl md:text-3xl font-display font-bold gradient-text mb-1 md:mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-responsive">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-8 md:mb-12">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Live <span className="gradient-text">Matches</span></h2>
            <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">Witness the action in real-time</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {featuredMatches.map((match, index) => (<MatchCard key={index} match={match} isWinner={match.winner} />))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container-responsive">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.05 }} className="glass rounded-xl p-6 text-center">
                <feature.icon className="text-4xl text-[#e11d48] mx-auto mb-4" />
                <h3 className="font-display font-bold text-lg md:text-xl mb-2 md:mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home