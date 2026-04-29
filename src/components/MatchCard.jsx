import React from 'react'
import { motion } from 'framer-motion'
import { FaStar, FaTrophy } from 'react-icons/fa'

const MatchCard = ({ match, isWinner = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`glass rounded-xl p-4 md:p-6 ${isWinner ? 'glow-gold' : ''}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-center w-full">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3">
            <span className="font-display text-xl md:text-2xl font-bold">{match.fighter1?.name?.[0] || 'A'}</span>
          </div>
          <h3 className="font-display font-bold text-base md:text-lg truncate max-w-[150px] mx-auto">{match.fighter1?.name || 'Fighter 1'}</h3>
          <p className="text-xl md:text-2xl font-display font-bold text-primary mt-2">{match.score1 || 0}</p>
        </div>

        <div className="text-center">
          <div className="relative">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-primary flex items-center justify-center">
              <span className="font-display font-bold text-primary text-sm md:text-base">VS</span>
            </motion.div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Round {match.round || 1}</p>
        </div>

        <div className="flex-1 text-center w-full">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3">
            <span className="font-display text-xl md:text-2xl font-bold">{match.fighter2?.name?.[0] || 'B'}</span>
          </div>
          <h3 className="font-display font-bold text-base md:text-lg truncate max-w-[150px] mx-auto">{match.fighter2?.name || 'Fighter 2'}</h3>
          <p className="text-xl md:text-2xl font-display font-bold text-accent mt-2">{match.score2 || 0}</p>
        </div>
      </div>

      {isWinner && (
        <div className="mt-4 pt-4 border-t border-border text-center">
          <div className="flex items-center justify-center gap-2 text-accent flex-wrap">
            <FaTrophy className="text-sm md:text-base" />
            <span className="font-display text-sm md:text-base">Winner: {match.winner}</span>
            <FaStar className="text-sm md:text-base" />
          </div>
        </div>
      )}

      {match.status === 'live' && (
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs text-primary font-bold">LIVE</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default MatchCard