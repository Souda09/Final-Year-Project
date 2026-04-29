import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa'

const Tournaments = () => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const tournaments = [
    { id: 1, name: 'World Boxing Championship', date: '2024-12-15', location: 'Las Vegas, USA', weight_category: 'Heavyweight', prize: '$1,000,000' },
    { id: 2, name: 'Golden Gloves Tournament', date: '2024-11-20', location: 'New York, USA', weight_category: 'Middleweight', prize: '$500,000' },
    { id: 3, name: 'Asia Pacific Boxing Cup', date: '2024-10-10', location: 'Tokyo, Japan', weight_category: 'Welterweight', prize: '$300,000' },
  ]

  return (
    <div className="min-h-screen py-20">
      <div className="container-responsive">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl font-bold gradient-text mb-2">Tournaments</h1>
          <p className="text-muted-foreground">Discover and participate in boxing tournaments worldwide</p>
        </motion.div>

        <div className="mb-8">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search tournaments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg border border-border focus:border-primary focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament, index) => (
            <motion.div key={tournament.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.02 }} className="glass rounded-xl overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"><FaCalendarAlt className="text-6xl text-primary/50" /></div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold mb-2">{tournament.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><FaCalendarAlt /><span>{new Date(tournament.date).toLocaleDateString()}</span></div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><FaMapMarkerAlt /><span>{tournament.location}</span></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">{tournament.weight_category}</span>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:scale-105 transition-transform">View Details</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Tournaments