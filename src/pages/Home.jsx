import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaTrophy, FaUsers, FaMedal, FaChartLine,
  FaPlay, FaHistory, FaCalendarAlt, FaLock,
  FaMapMarkerAlt, FaFistRaised, FaEnvelope, FaPhone,
  FaMapPin, FaFacebook, FaTwitter, FaInstagram, FaYoutube,
  FaChevronLeft, FaChevronRight, FaPaperPlane, FaClock
} from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import toast from 'react-hot-toast'
import logo from '/logo3.png'
import logo2 from '/logo2.png'

// ============ HERO SLIDER DATA ============
const HERO_SLIDES = [
  {
    title: 'Where Champions Are Made',
    subtitle: 'Track every punch, every round, every victory — all in one place.',
    cta: 'Get Started',
    ctaAction: 'signup',
    bg: 'from-[#e11d48]/30 via-transparent to-[#fbbf24]/20'
  },
  {
    title: 'Live Boxing Action',
    subtitle: 'Follow real-time matches, scores, and results from anywhere.',
    cta: 'Watch Live',
    ctaAction: 'live',
    bg: 'from-[#fbbf24]/20 via-transparent to-[#e11d48]/30'
  },
  {
    title: 'Your Boxing Journey',
    subtitle: 'Manage tournaments, track fighters, and build your legacy.',
    cta: 'Join PunchTrack',
    ctaAction: 'signup',
    bg: 'from-[#e11d48]/20 via-[#fbbf24]/10 to-[#e11d48]/30'
  }
]

// ============ FEEDBACK COMPONENT ============
const Feedback = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('feedback').insert([{
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      }])

      if (error) throw error

      toast.success('✅ Shukriya! Aapka feedback mil gaya.')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      console.error(err)
      toast.error('Feedback submit nahi ho saka: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
<section id="feedback" className="py-16  bg-purple-100 dark:bg-gray-900">
      <div className="container-responsive max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2 text-foreground">
            <span className="gradient-text">Feedback</span>{' '}
            <span className="text-gray-200">& Contact</span>
          </h2>

<p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
Your feedback matters to us. If you have any questions, suggestions, or concerns, please let us know. We're always looking for ways to improve your experience.          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Full Name <span className="text-red-600 dark:text-red-400">*</span>
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                required
                className="w-full px-4 py-2.5 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Email <span className="text-red-600 dark:text-red-400">*</span>
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
                className="w-full px-4 py-2.5 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Message / Feedback <span className="text-red-600 dark:text-red-400">*</span>
            </label>

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Message"
              required
              rows={5}
              className="w-full px-4 py-2.5 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-[#e11d48] text-white rounded-lg font-display font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaPaperPlane /> {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </motion.form>
      </div>
    </section>
  )
}

// ============ FOOTER COMPONENT ============
const Footer = () => {
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 dark:bg-black text-foreground border-t border-border">
      <div className="container-responsive py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo2} alt="PunchTrack" className="w-auto h-28 object-contain" />
              <h3 className="font-display text-xl font-bold text-gray-50">
                PunchTrack
              </h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              The ultimate boxing tournament management platform. Connecting fighters,
              officials, and fans worldwide.
            </p>

            <div className="flex gap-3 mt-4">
              {[
                { icon: FaFacebook, href: '#' },
                { icon: FaTwitter, href: '#' },
                { icon: FaInstagram, href: '#' },
                { icon: FaYoutube, href: '#' }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-[#e11d48] flex items-center justify-center transition-colors"
                  aria-label="social"
                >
                  <social.icon className="text-sm text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-gray-50 mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h4>

            <ul className="space-y-2 text-sm">
              {[
                { label: 'Home', path: '/' },
                { label: 'Tournaments', path: '/tournaments' },
                { label: 'About', path: '/about' },
                { label: 'Login', path: '/login' },
                { label: 'Sign Up', path: '/signup' }
              ].map((link, i) => (
                <li key={i}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-muted-foreground hover:text-[#e11d48] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-gray-50 mb-4 text-sm uppercase tracking-wider">
              Contact Us
            </h4>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <FaMapPin className="text-[#e11d48] mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  Boxing Club, Lyari, Karachi, Pakistan
                </span>
              </li>

              <li className="flex items-center gap-3">
                <FaPhone className="text-[#e11d48] shrink-0" />
                <a
                  href="tel:+922132744025"
                  className="text-muted-foreground hover:text-[#e11d48] transition-colors"
                >
                  021-112345678
                </a>
              </li>

              <li className="flex items-center gap-3">
                <FaEnvelope className="text-[#e11d48] shrink-0" />
                <a
                  href="mailto:sboxingassociation@gmail.com"
                  className="text-muted-foreground hover:text-[#e11d48] transition-colors break-all"
                >
                  boxingclub@gmail.com
                </a>
              </li>

            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div>
            <h4 className="font-display font-bold text-gray-50 mb-4 text-sm uppercase tracking-wider">
              Stay Connected
            </h4>

            <p className="text-sm text-muted-foreground mb-3">
              Stay connected for the latest matches, tournaments, and updates.
            </p>

            <button
              onClick={() => document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full px-4 py-2.5 bg-[#e11d48] hover:bg-[#c01739] text-white rounded-lg font-display font-bold text-sm transition-colors"
            >
              Send Feedback
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-300 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>© {year} PunchTrack. All rights reserved.</p>
          <p>Made with ❤️ for the boxing community</p>
        </div>
      </div>
    </footer>
  )
}

// ============ HOME COMPONENT ============
const Home = () => {
  const { user } = useStore()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('upcoming')
  const [liveMatches, setLiveMatches] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [historyMatches, setHistoryMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)

  const slideTimer = useRef(null)

  // Hero slider auto-rotate
  useEffect(() => {
    slideTimer.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)

    return () => clearInterval(slideTimer.current)
  }, [])

  const goToSlide = (idx) => {
    setSlideIndex(idx)

    if (slideTimer.current) {
      clearInterval(slideTimer.current)

      slideTimer.current = setInterval(() => {
        setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)
      }, 5000)
    }
  }

  const stats = [
    { icon: FaTrophy, value: '150+', label: 'Tournaments' },
    { icon: FaUsers, value: '2,500+', label: 'Athletes' },
    { icon: FaMedal, value: '500+', label: 'Champions' },
    { icon: FaChartLine, value: '1M+', label: 'Fans Engaged' }
  ]

  useEffect(() => {
    if (user) fetchTabData('upcoming')
  }, [user])

  const fetchTabData = async (tab) => {
    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)

    try {
      let query = supabase
        .from('matches')
        .select(`
          *,
          tournaments(title, venue),
          player1:players!matches_player1_id_fkey(full_name, club_name),
          player2:players!matches_player2_id_fkey(full_name, club_name)
        `)

      if (tab === 'live') {
        query = query.eq('status', 'live')
      } else if (tab === 'upcoming') {
        query = query
          .eq('status', 'scheduled')
          .order('match_date', { ascending: true })
      } else if (tab === 'history') {
        query = query
          .eq('status', 'completed')
          .order('match_date', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error

      if (tab === 'live') setLiveMatches(data || [])
      else if (tab === 'upcoming') setUpcomingMatches(data || [])
      else if (tab === 'history') setHistoryMatches(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)

    if (!user) {
      navigate('/login')
      return
    }

    fetchTabData(tab)
  }

  const getWinnerName = (m) => {
    if (!m.winner_id) return null
    if (m.winner_id === m.player1_id) return m.player1?.full_name
    if (m.winner_id === m.player2_id) return m.player2?.full_name
    return null
  }

  const handleHeroCta = (action) => {
    if (action === 'live') handleTabChange('live')
    else navigate(user ? '/dashboard' : '/signup')
  }

  const renderMatchCard = (m, showResult = false) => {
    const winnerName = showResult ? getWinnerName(m) : null

    return (
      <motion.div
        key={m.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 mb-3"
      >
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <FaTrophy className="text-[#e11d48]" />
            {m.tournaments?.title || 'Tournament'}
          </span>

          <span className="text-xs px-2 py-0.5 rounded-full bg-[#fbbf24]/20 text-amber-700 dark:text-[#fbbf24] font-bold">
            {m.weight_class ? `${m.weight_class} KG` : '—'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 text-center">
            <p className="font-display font-bold text-red-600 dark:text-red-400 truncate">
              {m.player1?.full_name || 'TBD'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {m.player1?.club_name || ''}
            </p>
          </div>

          <div className="px-2 text-center">
            <span className="font-display font-black text-[#e11d48]">VS</span>

            {m.status === 'live' && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">
                  LIVE
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 text-center">
            <p className="font-display font-bold text-blue-600 dark:text-blue-400 truncate">
              {m.player2?.full_name || 'TBD'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {m.player2?.club_name || ''}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border flex-wrap gap-1">
          <span className="flex items-center gap-1">
            <FaCalendarAlt />
            {m.match_date
              ? new Date(m.match_date).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'TBD'}
          </span>

          <span className="flex items-center gap-1">
            <FaMapMarkerAlt /> {m.venue || m.tournaments?.venue || '—'}
          </span>
        </div>

        {showResult && (
          <div className="mt-2 pt-2 border-t border-border text-center text-sm">
            {winnerName ? (
              <span className="text-green-700 dark:text-green-400 font-bold">
                🏆 Winner: {winnerName} ({m.score1} - {m.score2})
              </span>
            ) : (
              <span className="text-muted-foreground">Result pending</span>
            )}
          </div>
        )}
      </motion.div>
    )
  }

  const currentSlide = HERO_SLIDES[slideIndex]

  return (
    <div className="min-h-screen flex flex-col">

      {/* HERO SLIDER */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-0 bg-gradient-to-br ${currentSlide.bg}`}
          />
        </AnimatePresence>

        <div className="relative container-responsive text-center py-16 sm:py-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={slideIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
            >
              <img src={logo} alt="PunchTrack" className="w-auto sm:w-64 mx-auto mb-4" />

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black mb-4">
                <span className="gradient-text">PunchTrack</span>
              </h1>

              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-foreground">
                {currentSlide.title}
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-2xl mx-auto px-4">
                {currentSlide.subtitle}
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => navigate(user ? '/dashboard' : '/signup')}
                  className="px-6 py-2.5 bg-[#e11d48] text-white rounded-lg font-display font-bold hover:scale-105 transition-transform shadow-lg shadow-[#e11d48]/30"
                >
                  {user ? 'Go to Dashboard' : 'Get Started'}
                </button>

                <button
                  onClick={() => handleHeroCta(currentSlide.ctaAction)}
                  className="px-6 py-2.5 bg-[#e11d48] text-white rounded-lg font-display font-bold hover:scale-105 transition-transform shadow-lg shadow-[#e11d48]/30 flex items-center gap-2"
                >
                  <FaPlay className="text-white text-sm" /> {currentSlide.cta}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider arrows */}
          <button
            onClick={() => goToSlide((slideIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-[#e11d48] text-foreground flex items-center justify-center transition-colors"
            aria-label="Previous slide"
          >
            <FaChevronLeft />
          </button>

          <button
            onClick={() => goToSlide((slideIndex + 1) % HERO_SLIDES.length)}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-[#e11d48] text-foreground flex items-center justify-center transition-colors"
            aria-label="Next slide"
          >
            <FaChevronRight />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  i === slideIndex
                    ? 'bg-[#e11d48] w-8'
                    : 'bg-gray-500/60 dark:bg-white/40 w-2'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-10 bg-purple-100 dark:bg-gray-900">
        <div className="container-responsive">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-3">
                <stat.icon className="text-2xl sm:text-3xl text-[#e11d48] mx-auto mb-2" />

                <div className="text-xl sm:text-2xl font-display font-bold gradient-text">
                  {stat.value}
                </div>

                <div className="text-xs sm:text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-12">
        <div className="container-responsive max-w-3xl text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
            <span className="gradient-text">About PunchTrack</span>
          </h2>

          <p className="text-sm sm:text-base text-gray-700">
            PunchTrack is a modern boxing tournament management platform built to connect
            fighters, officials, and fans. Track live bouts, review completed match history,
            and follow upcoming fixtures — all in one place.
          </p>
        </div>
      </section>

      {/* MATCHES TABS */}
      <section className="py-8 flex-1">
        <div className="container-responsive max-w-3xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-6">
            <span className="gradient-text">Matches</span>
          </h2>

          <div className="flex justify-center gap-2 sm:gap-3 mb-6 flex-wrap">
            {[
              { id: 'live', label: 'Live Now', icon: FaPlay },
              { id: 'upcoming', label: 'Upcoming', icon: FaCalendarAlt },
              { id: 'history', label: 'History', icon: FaHistory }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl font-display font-bold flex items-center gap-2 transition-all text-sm ${
                  activeTab === tab.id
                    ? 'bg-[#e11d48] text-white shadow-lg scale-105'
                    : 'glass hover:bg-white/10 text-foreground'
                }`}
              >
                {!user && <FaLock className="text-[10px]" />}
                <tab.icon /> {tab.label}
              </button>
            ))}
          </div>

          {loading && (
            <p className="text-center text-muted-foreground py-6">Loading...</p>
          )}

          {!user ? (
            <div className="glass rounded-2xl p-8 sm:p-12 text-center">
              <FaLock className="text-5xl text-[#e11d48] mx-auto mb-4" />

              <h3 className="font-display text-xl sm:text-2xl font-bold mb-2 text-foreground">
                Login Required
              </h3>

              <p className="text-sm text-muted-foreground mb-6">
                Log in to view live matches, upcoming fixtures, and match history.
              </p>

              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2.5 bg-[#e11d48] text-white rounded-lg font-display font-bold"
                >
                  Login
                </button>

                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2.5 glass text-foreground rounded-lg font-display font-bold"
                >
                  Sign Up
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'live' && !loading && liveMatches.length === 0 && (
                <div className="glass rounded-xl p-8 text-center">
                  <FaFistRaised className="text-4xl text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No match history available.</p>
                </div>
              )}

              {activeTab === 'live' && liveMatches.map(m => renderMatchCard(m))}

              {activeTab === 'upcoming' && !loading && upcomingMatches.length === 0 && (
                <div className="glass rounded-xl p-8 text-center">
                  <FaCalendarAlt className="text-4xl text-muted-foreground mx-auto mb-3" />
                  <p className="text-gray-600">No upcoming matches available.</p>
                </div>
              )}

              {activeTab === 'upcoming' && upcomingMatches.map(m => renderMatchCard(m))}

              {activeTab === 'history' && !loading && historyMatches.length === 0 && (
                <div className="glass rounded-xl p-8 text-center">
                  <FaHistory className="text-4xl text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No match history available.</p>
                </div>
              )}

              {activeTab === 'history' && historyMatches.map(m => renderMatchCard(m, true))}
            </>
          )}
        </div>
      </section>

      {/* FEEDBACK */}
      <Feedback />

      {/* FOOTER */}
      <Footer />
    </div>
  )
}

export default Home
