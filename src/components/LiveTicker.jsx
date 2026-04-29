import React from 'react'
import { motion } from 'framer-motion'
import { FaFire } from 'react-icons/fa'

const LiveTicker = () => {
  const liveMatches = [
    { id: 1, fighter1: "Mike Tyson", fighter2: "Evander Holyfield", score1: 87, score2: 89, round: 8 },
    { id: 2, fighter1: "Manny Pacquiao", fighter2: "Floyd Mayweather", score1: 92, score2: 91, round: 10 },
    { id: 3, fighter1: "Canelo Alvarez", fighter2: "GGG Golovkin", score1: 88, score2: 88, round: 7 },
  ]

  return (
    <div className="bg-primary/10 border-y border-primary/20 overflow-hidden">
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10"></div>
        
        <motion.div className="flex gap-8 py-3" animate={{ x: [0, -1000] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
          {[...liveMatches, ...liveMatches].map((match, idx) => (
            <div key={idx} className="flex items-center gap-4 whitespace-nowrap">
              <FaFire className="text-primary animate-pulse" />
              <span className="font-display font-bold">{match.fighter1}</span>
              <span className="text-primary font-bold">{match.score1}</span>
              <span className="text-muted-foreground">VS</span>
              <span className="text-accent font-bold">{match.score2}</span>
              <span className="font-display font-bold">{match.fighter2}</span>
              <span className="text-muted-foreground">| Round {match.round}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default LiveTicker