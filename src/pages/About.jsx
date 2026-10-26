import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaShieldAlt, FaTrophy, FaUsers, FaAward, FaCalendarAlt,
  FaChartLine, FaStar, FaHeart, FaChevronLeft, FaChevronRight
} from 'react-icons/fa'
import logo from '/logo3.png'

// ============ ABOUT HERO SLIDES ============
const ABOUT_SLIDES = [
  {
    title: 'Our Story',
    subtitle: 'Founded in 2020, PunchTrack emerged from a simple yet powerful idea: to bring modern technology to boxing.',
    bg: 'from-[#e11d48]/30 via-transparent to-[#fbbf24]/20'
  },
  {
    title: 'Our Mission',
    subtitle: 'To empower the boxing community with technology that ensures fairness, transparency, and excellence.',
    bg: 'from-[#fbbf24]/20 via-transparent to-[#e11d48]/30'
  },
  {
    title: 'Our Vision',
    subtitle: 'A world where every boxing match is managed with precision, integrity, and cutting-edge innovation.',
    bg: 'from-[#e11d48]/20 via-[#fbbf24]/10 to-[#e11d48]/30'
  }
]

const About = () => {
  const [slideIndex, setSlideIndex] = useState(0)
  const slideTimer = useRef(null)

  // Auto-rotate slider
  useEffect(() => {
    slideTimer.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % ABOUT_SLIDES.length)
    }, 5000)
    return () => clearInterval(slideTimer.current)
  }, [])

  const goToSlide = (idx) => {
    setSlideIndex(idx)
    if (slideTimer.current) {
      clearInterval(slideTimer.current)
      slideTimer.current = setInterval(() => {
        setSlideIndex((prev) => (prev + 1) % ABOUT_SLIDES.length)
      }, 5000)
    }
  }

  const team = [
    { name: 'John Smith', role: 'CEO & Founder', bio: 'Former professional boxer with 15 years of experience', icon: FaStar },
    { name: 'Sarah Johnson', role: 'Head of Operations', bio: 'Sports management expert with 10+ years', icon: FaHeart },
    { name: 'Mike Tyson', role: 'Boxing Ambassador', bio: 'Legendary heavyweight champion', icon: FaTrophy },
  ]

  const values = [
    { icon: FaShieldAlt, title: 'Integrity', description: 'We ensure fair play and transparency in every match' },
    { icon: FaTrophy, title: 'Excellence', description: 'Striving for the highest standards in boxing management' },
    { icon: FaUsers, title: 'Community', description: 'Building a global community of boxing enthusiasts' },
    { icon: FaAward, title: 'Innovation', description: 'Using cutting-edge technology to advance the sport' }
  ]

  const milestones = [
    { year: '2020', title: 'Company Founded', description: 'PunchTrack was established with a vision to revolutionize boxing' },
    { year: '2021', title: 'First Tournament', description: 'Successfully hosted first virtual boxing tournament' },
    { year: '2022', title: 'Global Expansion', description: 'Expanded to 15 countries worldwide' },
    { year: '2023', title: '1M+ Users', description: 'Reached over 1 million boxing fans globally' },
  ]

  const statsData = [
    { value: '150+', label: 'Tournaments', icon: FaCalendarAlt },
    { value: '2,500+', label: 'Athletes', icon: FaUsers },
    { value: '500+', label: 'Champions', icon: FaTrophy },
    { value: '98%', label: 'Satisfaction', icon: FaChartLine }
  ]

  const currentSlide = ABOUT_SLIDES[slideIndex]

  return (
    <div className="min-h-screen">

      {/* ============ HERO SLIDER ============ */}
      <section className="relative overflow-hidden min-h-[60vh] flex items-center justify-center">
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
              <img src={logo} alt="PunchTrack Logo" className="w-24 sm:w-64 mx-auto mb-4" />
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                <span className="gradient-text">About PunchTrack</span>
              </h1>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-foreground">
                {currentSlide.title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto px-4">
                {currentSlide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Slider arrows */}
          <button
            onClick={() => goToSlide((slideIndex - 1 + ABOUT_SLIDES.length) % ABOUT_SLIDES.length)}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-[#e11d48] text-foreground flex items-center justify-center transition-colors"
            aria-label="Previous slide"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={() => goToSlide((slideIndex + 1) % ABOUT_SLIDES.length)}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-[#e11d48] text-foreground flex items-center justify-center transition-colors"
            aria-label="Next slide"
          >
            <FaChevronRight />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {ABOUT_SLIDES.map((_, i) => (
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

      {/* ============ STATS ============ */}
      <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container-responsive">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <stat.icon className="text-2xl sm:text-3xl md:text-4xl text-[#e11d48] mx-auto mb-2 sm:mb-3" />
                <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm md:text-base text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ OUR STORY ============ */}
      <section className="py-12 md:py-20">
        <div className="container-responsive">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="px-4 sm:px-0"
            >
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6">
                Our Story
              </h2>
              <div className="space-y-3 sm:space-y-4 text-muted-foreground text-sm sm:text-base">
                <p>
                  Founded in 2020, PunchTrack emerged from a simple yet powerful idea:
                  to bring modern technology to the world of boxing tournament management.
                </p>
                <p>
                  We saw an opportunity to streamline the entire process - from registration
                  to scoring, from scheduling to bracket management. Our platform combines
                  decades of boxing expertise with cutting-edge technology.
                </p>
                <p>
                  Today, PunchTrack is trusted by tournament organizers, judges, and boxers
                  worldwide, handling everything from local competitions to international championships.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-[#e11d48]/10 to-[#fbbf24]/10 rounded-2xl p-6 sm:p-8 mx-4 sm:mx-0"
            >
              <div className="flex items-center justify-center mb-6">
                <img src={logo} alt="PunchTrack Logo" className="w-28 h-20 sm:w-32 sm:h-24" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-center text-foreground mb-4">
                Our Mission
              </h3>
              <p className="text-muted-foreground text-center text-sm sm:text-base">
                To empower the boxing community with technology that ensures fairness,
                transparency, and excellence in every single match.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ MILESTONES ============ */}
      <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Our Journey
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto px-4">
              Key milestones in our journey to revolutionize boxing
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-[#e11d48] rounded-full flex items-center justify-center text-white font-display font-bold text-lg">
                  {milestone.year.slice(-2)}
                </div>
                <div className="mt-6">
                  <h3 className="font-display text-lg sm:text-xl font-bold gradient-text mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ VALUES ============ */}
      <section className="py-12 md:py-20">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto px-4">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-all"
              >
                <value.icon className="text-3xl sm:text-4xl text-[#e11d48] mx-auto mb-3 sm:mb-4" />
                <h3 className="font-display font-bold text-lg sm:text-xl gradient-text mb-2 sm:mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-12 md:py-20">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-[#e11d48]/10 to-[#fbbf24]/10 rounded-2xl p-6 sm:p-8 md:p-12 text-center mx-4 sm:mx-0"
          >
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join thousands of boxing professionals using PunchTrack to manage their tournaments and careers
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-6 sm:px-8 py-2 sm:py-3 bg-[#e11d48] text-white rounded-lg font-display font-bold hover:scale-105 transition-transform text-sm sm:text-base">
                Sign Up Now
              </button>
              <button className="px-6 sm:px-8 py-2 sm:py-3 bg-white dark:bg-gray-800 text-gray-100 rounded-lg font-display font-bold hover:scale-105 transition-transform shadow-md text-sm sm:text-base">
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default About