
import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  FaUsers, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaEye,
  FaUserCheck, FaUserClock, FaUser, FaFileMedical, FaImage,
  FaFilePdf, FaTrophy, FaBoxes, FaSave, FaUndo, FaPlus,
  FaUserFriends, FaEdit, FaTrash, FaSearch, FaFistRaised,
  FaClock, FaMedal, FaPlay, FaPause, FaStop, FaHourglassHalf,
  FaFileDownload, FaHospital, FaCalendarCheck, FaTable, FaAward
} from 'react-icons/fa'
import { GiWhistle } from 'react-icons/gi'
import toast from 'react-hot-toast'

const HEC_LOGO_URL = '/hec-logo.png'
const BBSUL_LOGO_URL = '/bbsul-logo.png'
const ROUND_TIME = 180
const BREAK_TIME = 60
const MAX_ROUNDS = 3
const WEIGHT_CLASSES = ['48', '51', '54', '57', '60', '63.5', '67', '71', '75', '80', '86', '92', '+92']
const POINTS = { gold: 15, silver: 10, bronze: 5 }
const RESULT_METHODS = [
  { value: 'points', label: 'Points', short: 'Points' },
  { value: 'knockout', label: 'Knockout (KO)', short: 'KO' },
  { value: 'disqualification', label: 'Disqualify (DQ)', short: 'DQ' },
  { value: 'abandoned', label: 'Abandoned (ABD)', short: 'ABD' },
  { value: 'rsc', label: 'RSC (Ref Stop Contest)', short: 'RSC' },
  { value: 'rsc_injury', label: 'RSC Injury', short: 'RSC Injury' },
  { value: 'walkover', label: 'Walkover', short: 'Walkover' },
]

const loadImageAsBase64 = (url) => new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = () => {
    const c = document.createElement('canvas')
    c.width = img.width; c.height = img.height
    c.getContext('2d').drawImage(img, 0, 0)
    resolve(c.toDataURL('image/png'))
  }
  img.onerror = reject
  img.src = url
})

const AdminDashboard = () => {
  const { addNotification, theme } = useStore()

  // ============ STATE ============
  const [applications, setApplications] = useState([])
  const [users, setUsers] = useState([])
  const [players, setPlayers] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [matches, setMatches] = useState([])
  const [matchResults, setMatchResults] = useState([])
  const [officials, setOfficials] = useState([])
  const [dayOfficials, setDayOfficials] = useState([])
  const [boutOfficials, setBoutOfficials] = useState([])
  const [medals, setMedals] = useState([])
  const [activeTab, setActiveTab] = useState('applications')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [editingPlayer, setEditingPlayer] = useState(null)
  const [editingTournament, setEditingTournament] = useState(null)
  const [editingMatch, setEditingMatch] = useState(null)
  const [editingOfficial, setEditingOfficial] = useState(null)
  const [editingBoutOfficial, setEditingBoutOfficial] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [showUserEditModal, setShowUserEditModal] = useState(false)
  const [userEditForm, setUserEditForm] = useState({
    full_name: '', email: '', role: 'player', status: 'pending'
  })
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTournamentModal, setShowTournamentModal] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [showMatchDetailModal, setShowMatchDetailModal] = useState(false)
  const [showDocModal, setShowDocModal] = useState(false)
  const [showOfficialModal, setShowOfficialModal] = useState(false)
  const [showBoutOfficialModal, setShowBoutOfficialModal] = useState(false)
  const [showRJDocModal, setShowRJDocModal] = useState(false)

  const [docDate, setDocDate] = useState('')
  const [docGenerating, setDocGenerating] = useState(false)
  const [rjDocTournamentId, setRjDocTournamentId] = useState('')
  const [rjDocGenerating, setRjDocGenerating] = useState(false)

  const [selectedMatch, setSelectedMatch] = useState(null)
  const [selectedMatchDetail, setSelectedMatchDetail] = useState(null)

  const [dailyDate, setDailyDate] = useState('')
  const [dailyTournamentId, setDailyTournamentId] = useState('')
  const [selectedDayOfficialIds, setSelectedDayOfficialIds] = useState([])
  const [dailyOfficialsSaving, setDailyOfficialsSaving] = useState(false)

  // Point table
  const [pointTournamentId, setPointTournamentId] = useState('')
  const [pointSaving, setPointSaving] = useState(false)
  const [pointPdfGenerating, setPointPdfGenerating] = useState(false)

  // Timer
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerPaused, setTimerPaused] = useState(false)
  const [currentRound, setCurrentRound] = useState(1)
  const [roundTime, setRoundTime] = useState(ROUND_TIME)
  const [breakTime, setBreakTime] = useState(BREAK_TIME)
  const [isBreak, setIsBreak] = useState(false)
  const [liveScore1, setLiveScore1] = useState(0)
  const [liveScore2, setLiveScore2] = useState(0)

  // Judge scoring
  const [selectedJudgeIds, setSelectedJudgeIds] = useState(['', '', '', '', ''])
  const [roundScores, setRoundScores] = useState({
    1: [0,1,2,3,4].map(i => ({ judge_idx: i, red: 10, blue: 9 })),
    2: [0,1,2,3,4].map(i => ({ judge_idx: i, red: 10, blue: 9 })),
    3: [0,1,2,3,4].map(i => ({ judge_idx: i, red: 10, blue: 9 })),
  })
  const [savedRounds, setSavedRounds] = useState({ 1: false, 2: false, 3: false })
  const [scoresSaving, setScoresSaving] = useState(false)
  const [currentResult, setCurrentResult] = useState(null)

  const [knockoutCount, setKnockoutCount] = useState(0)
  const [isKnockout, setIsKnockout] = useState(false)
  const [walkoverCount, setWalkoverCount] = useState(0)
  const [isWalkover, setIsWalkover] = useState(false)

  const timerRef = useRef(null)
  const knockoutRef = useRef(null)
  const walkoverRef = useRef(null)
  const roundRef = useRef(1)
  const modeRef = useRef('idle')
  const targetTimeRef = useRef(0)

  const [stats, setStats] = useState({
    totalUsers: 0, pendingApplications: 0, approvedUsers: 0, rejectedUsers: 0,
    totalPlayers: 0, activePlayers: 0, totalTournaments: 0, totalMatches: 0,
    completedMatches: 0, upcomingMatches: 0, totalOfficials: 0
  })

  // Forms
  const [playerForm, setPlayerForm] = useState({
    fullName: '', cnic: '', dateOfBirth: '', gender: '', contactNumber: '', emergencyContact: '',
    weight: '', height: '', stance: '', experienceLevel: '', clubName: '',
    clearanceStatus: '', checkupDate: '', fitForCombat: false, doctorName: '',
    photo: null, medicalCertificate: null,
  })
  const [tournamentForm, setTournamentForm] = useState({
    title: '', ageCategory: '', weightClasses: '', startDate: '', endDate: '',
    venue: '', maxPlayers: '', status: 'upcoming',
  })
   const [matchForm, setMatchForm] = useState({
    tournamentId: '', player1Id: '', player2Id: '', round: 1,
    matchDate: '', venue: '', status: 'scheduled',
    matchType: 'regular', weightClass: '',
  })
  const [resultForm, setResultForm] = useState({
    matchId: '', winnerId: '', score1: 0, score2: 0, method: 'points', round: 1,
  })
  const [officialForm, setOfficialForm] = useState({
    full_name: '', role: 'referee', unit: '', post: '',
    contact_number: '', email: '', cnic: '', experience_years: 0, status: 'active',
  })
  const [boutOfficialForm, setBoutOfficialForm] = useState({
    match_id: '', referee_id: '',
    judge1_id: '', judge2_id: '', judge3_id: '', judge4_id: '', judge5_id: '',
    supervisor_id: '',
  })
  const [errors, setErrors] = useState({})
  const ageCategoryOptions = ['Boys 12', 'Junior 14-16', 'Youth 16-18', 'Senior 19-40']

  // ============ FETCH ============
  useEffect(() => {
    fetchApplications(); fetchUsers(); fetchPlayers(); fetchTournaments()
    fetchMatches(); fetchMatchResults(); fetchOfficials(); fetchDayOfficials()
    fetchBoutOfficials(); fetchMedals()
  }, [])

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (knockoutRef.current) clearInterval(knockoutRef.current)
    if (walkoverRef.current) clearInterval(walkoverRef.current)
  }, [])

  useEffect(() => {
    if (dailyDate && dailyTournamentId) {
      const existing = dayOfficials
        .filter(d => d.date === dailyDate && d.tournament_id === dailyTournamentId)
        .map(d => d.official_id)
      setSelectedDayOfficialIds(existing)
    } else setSelectedDayOfficialIds([])
  }, [dailyDate, dailyTournamentId, dayOfficials])

  const fetchApplications = async () => {
    try { const { data, error } = await supabase.from('profiles').select('*').eq('status', 'pending'); if (!error && data) setApplications(data) } catch (e) { console.error(e) }
  }
  const fetchUsers = async () => {
    try { const { data, error } = await supabase.from('profiles').select('*'); if (!error && data) { setUsers(data); setStats(p => ({ ...p, totalUsers: data.length, pendingApplications: data.filter(u => u.status === 'pending').length, approvedUsers: data.filter(u => u.status === 'approved').length, rejectedUsers: data.filter(u => u.status === 'rejected').length })) } } catch (e) { console.error(e) }
  }
  const fetchPlayers = async () => {
    try { const { data, error } = await supabase.from('players').select('*').order('created_at', { ascending: false }); if (!error && data) { setPlayers(data); setStats(p => ({ ...p, totalPlayers: data.length, activePlayers: data.filter(x => x.status === 'active').length })) } } catch (e) { console.error(e) }
  }
  const fetchTournaments = async () => {
    try { const { data, error } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false }); if (!error && data) { setTournaments(data); setStats(p => ({ ...p, totalTournaments: data.length })) } } catch (e) { console.error(e) }
  }
  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase.from('matches')
        .select('*, tournaments(title, age_category), player1:players!matches_player1_id_fkey(full_name, id, club_name, weight), player2:players!matches_player2_id_fkey(full_name, id, club_name, weight)')
        .order('match_date', { ascending: true })
      if (!error && data) { setMatches(data); setStats(p => ({ ...p, totalMatches: data.length, completedMatches: data.filter(m => m.status === 'completed').length })) }
    } catch (e) { console.error(e) }
  }
  const fetchMatchResults = async () => {
    try {
      const { data, error } = await supabase.from('match_results')
        .select(`*, match:matches(*, player1:players!matches_player1_id_fkey(full_name, id), player2:players!matches_player2_id_fkey(full_name, id), tournament:tournaments(title))`)
        .order('created_at', { ascending: false })
      if (error) throw error
      setMatchResults(data)
    } catch (e) { console.error(e) }
  }
  const fetchOfficials = async () => {
    try { const { data, error } = await supabase.from('officials').select('*').eq('status', 'active').order('created_at', { ascending: false }); if (!error && data) { setOfficials(data); setStats(p => ({ ...p, totalOfficials: data.length })) } } catch (e) { console.error(e) }
  }
  const fetchDayOfficials = async () => {
    try { const { data, error } = await supabase.from('day_officials').select('*'); if (!error && data) setDayOfficials(data) } catch (e) { console.error(e) }
  }
  const fetchMedals = async () => {
    try {
      const { data, error } = await supabase.from('tournament_medals').select(`*, player:players(full_name, club_name, weight)`).order('created_at', { ascending: false })
      if (!error && data) setMedals(data)
    } catch (e) { console.error(e) }
  }
  const fetchBoutOfficials = async () => {
    try {
      const { data, error } = await supabase.from('bout_officials').select(`
        *, match:matches(id, round, match_date, tournament_id,
          tournament:tournaments(title, age_category, venue),
          player1:players!matches_player1_id_fkey(full_name, club_name),
          player2:players!matches_player2_id_fkey(full_name, club_name)),
        referee:officials!bout_officials_referee_id_fkey(full_name, unit, post),
        j1:officials!bout_officials_judge1_id_fkey(full_name, unit),
        j2:officials!bout_officials_judge2_id_fkey(full_name, unit),
        j3:officials!bout_officials_judge3_id_fkey(full_name, unit),
        j4:officials!bout_officials_judge4_id_fkey(full_name, unit),
        j5:officials!bout_officials_judge5_id_fkey(full_name, unit),
        supervisor:officials!bout_officials_supervisor_id_fkey(full_name, unit)
      `)
      if (!error && data) setBoutOfficials(data)
    } catch (e) { console.error(e) }
  }

  // ============ TIMER ============
  const tick = () => {
    const remaining = Math.max(0, Math.ceil((targetTimeRef.current - Date.now()) / 1000))
    if (modeRef.current === 'round') {
      setRoundTime(remaining)
      if (remaining <= 0) {
        if (roundRef.current < MAX_ROUNDS) {
          modeRef.current = 'break'
          targetTimeRef.current = Date.now() + BREAK_TIME * 1000
          setIsBreak(true); setBreakTime(BREAK_TIME)
          toast.info(`Round ${roundRef.current} finished! Break time.`)
        } else {
          if (timerRef.current) clearInterval(timerRef.current)
          timerRef.current = null
          modeRef.current = 'idle'
          setTimerRunning(false); setRoundTime(0)
          toast.success('Match completed! All 3 rounds finished.')
        }
      }
    } else if (modeRef.current === 'break') {
      setBreakTime(remaining)
      if (remaining <= 0) {
        roundRef.current += 1
        setCurrentRound(roundRef.current)
        modeRef.current = 'round'
        targetTimeRef.current = Date.now() + ROUND_TIME * 1000
        setRoundTime(ROUND_TIME); setIsBreak(false)
        toast.info(`Round ${roundRef.current} starting!`)
      }
    }
  }

  const startTimer = () => {
    if (timerRef.current) return
    if (modeRef.current === 'idle' || modeRef.current === 'break') {
      modeRef.current = 'round'; roundRef.current = 1; setCurrentRound(1)
      targetTimeRef.current = Date.now() + ROUND_TIME * 1000
      setRoundTime(ROUND_TIME); setIsBreak(false)
    } else {
      targetTimeRef.current = Date.now() + roundTime * 1000
    }
    setTimerRunning(true); setTimerPaused(false)
    timerRef.current = setInterval(tick, 250)
  }
  const pauseTimer = () => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; setTimerRunning(false); setTimerPaused(true) }
  const resumeTimer = () => {
    if (!timerPaused) return
    if (modeRef.current === 'round') targetTimeRef.current = Date.now() + roundTime * 1000
    else if (modeRef.current === 'break') targetTimeRef.current = Date.now() + breakTime * 1000
    setTimerPaused(false); setTimerRunning(true)
    timerRef.current = setInterval(tick, 250)
  }
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    setTimerRunning(false); setTimerPaused(false)
    modeRef.current = 'idle'; roundRef.current = 1
    setRoundTime(ROUND_TIME); setCurrentRound(1)
    setIsBreak(false); setBreakTime(BREAK_TIME)
    setLiveScore1(0); setLiveScore2(0); setCurrentResult(null)
  }
  const startKnockoutCount = () => {
    setIsKnockout(true); setKnockoutCount(0)
    knockoutRef.current = setInterval(() => {
      setKnockoutCount(prev => { if (prev >= 10) { clearInterval(knockoutRef.current); knockoutRef.current = null; setIsKnockout(false); toast.error('KNOCKOUT!'); return 10 } return prev + 1 })
    }, 1000)
  }
  const stopKnockoutCount = () => { if (knockoutRef.current) { clearInterval(knockoutRef.current); knockoutRef.current = null } setIsKnockout(false) }
  const startWalkoverCount = () => {
    setIsWalkover(true); setWalkoverCount(0)
    walkoverRef.current = setInterval(() => {
      setWalkoverCount(prev => { if (prev >= 3) { clearInterval(walkoverRef.current); walkoverRef.current = null; setIsWalkover(false); toast.error('WALKOVER!'); return 3 } return prev + 1 })
    }, 1000)
  }
  const stopWalkoverCount = () => { if (walkoverRef.current) { clearInterval(walkoverRef.current); walkoverRef.current = null } setIsWalkover(false) }
  const addPoint = (player) => {
    if (!timerRunning && !timerPaused) { toast.error('Start timer first!'); return }
    if (player === 1) setLiveScore1(p => p + 1); else setLiveScore2(p => p + 1)
  }

  // ============ JUDGE SCORING HELPERS ============
  const updateJudgeSelection = (idx, judgeId) => {
    const updated = [...selectedJudgeIds]
    updated[idx] = judgeId
    setSelectedJudgeIds(updated)
  }
  const updateRoundScore = (round, judgeIdx, field, value) => {
    let v = parseInt(value) || 0
    if (v < 0) v = 0
    if (v > 10) v = 10
    setRoundScores(prev => {
      const updated = { ...prev }
      updated[round] = updated[round].map((s, i) => i === judgeIdx ? { ...s, [field]: v } : s)
      return updated
    })
  }
  const calcRoundTotal = (round) => {
    const scores = roundScores[round]
    return {
      redTotal: scores.reduce((sum, s) => sum + (s.red || 0), 0),
      blueTotal: scores.reduce((sum, s) => sum + (s.blue || 0), 0),
    }
  }
  const calcFinalTotal = () => {
    let red = 0, blue = 0
    for (let r = 1; r <= 3; r++) { const { redTotal, blueTotal } = calcRoundTotal(r); red += redTotal; blue += blueTotal }
    return { red, blue }
  }
  const calcAutoWinner = () => {
    const { red, blue } = calcFinalTotal()
    if (red > blue) return 'red'
    if (blue > red) return 'blue'
    return 'draw'
  }
  const saveRoundScores = async (round) => {
    if (!selectedMatchDetail) { toast.error('No match selected'); return }
    if (selectedJudgeIds.some(id => !id)) { toast.error('Please select all 5 judges first'); return }
    setScoresSaving(true)
    try {
      await supabase.from('match_judge_scores').delete().eq('match_id', selectedMatchDetail.id).eq('round', round)
      const rows = roundScores[round].map((s, i) => ({
        match_id: selectedMatchDetail.id, judge_id: selectedJudgeIds[i],
        round: round, red_score: s.red, blue_score: s.blue,
      }))
      const { error } = await supabase.from('match_judge_scores').insert(rows)
      if (error) throw error
      setSavedRounds(prev => ({ ...prev, [round]: true }))
      const { redTotal, blueTotal } = calcRoundTotal(round)
      toast.success(`✅ Round ${round} saved — RED ${redTotal}, BLUE ${blueTotal}`)
    } catch (e) { console.error(e); toast.error('Error: ' + e.message) } finally { setScoresSaving(false) }
  }
  const isRoundOpen = (round) => { if (round === 1) return true; return savedRounds[round - 1] }
  const pickResult = (corner, method) => { setCurrentResult({ corner, method }) }
  const confirmResult = async () => {
    if (!currentResult) { toast.error('Pick a result first'); return }
    const { red, blue } = calcFinalTotal()
    setResultForm({
      matchId: selectedMatchDetail.id,
      winnerId: currentResult.corner === 'red' ? selectedMatchDetail.player1_id : selectedMatchDetail.player2_id,
      score1: red, score2: blue,
      method: currentResult.method, round: roundRef.current,
    })
    setShowMatchDetailModal(false); setSelectedMatchDetail(null); setShowResultModal(true)
  }

  // ============ APPLICATION ============
  // ============ USER CRUD ============
  const handleEditUser = (u) => {
    setEditingUser(u)
    setUserEditForm({
      full_name: u.full_name || '',
      email: u.email || '',
      role: u.role || 'player',
      status: u.status || 'pending',
    })
    setShowUserEditModal(true)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const updateData = {
        full_name: userEditForm.full_name,
        role: userEditForm.role,
        status: userEditForm.status,
        updated_at: new Date()
      }
      const { error } = await supabase.from('profiles').update(updateData).eq('id', editingUser.id)
      if (error) throw error
      toast.success('✅ User updated!')
      setShowUserEditModal(false)
      setEditingUser(null)
      fetchUsers()
      fetchApplications()
    } catch (e) {
      toast.error('Error: ' + e.message)
    } finally { setLoading(false) }
  }

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Delete user "${userEmail}"? Yeh user permanently delete ho jayega.`)) return
    setLoading(true)
    try {
      // Step 1: Delete associated profile record
      const { error: profileErr } = await supabase.from('profiles').delete().eq('id', userId)
      if (profileErr) throw profileErr
      
      // Note: Auth user bhi delete karna ho to service role key chahiye
      // Currently sirf profile delete ho raha hai
      
      toast.success('✅ User profile deleted!')
      fetchUsers()
      fetchApplications()
    } catch (e) {
      toast.error('Error: ' + e.message)
    } finally { setLoading(false) }
  }

  const handleApplication = async (userId, status) => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', userId)
    if (!error) {
      toast.success(`Application ${status}`)
      fetchApplications(); fetchUsers()
      await supabase.from('notifications').insert([{ user_id: userId, message: `Your application has been ${status}`, type: status }])
      addNotification({ user_id: userId, message: `Your application has been ${status}`, type: status })
    } else toast.error('Error')
  }

  // ============ PLAYER CRUD ============
    const handleDeletePlayer = async (id) => {
    if (!window.confirm('Delete this player? Uske saare matches aur results bhi delete ho jayenge.')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('players').delete().eq('id', id)
      if (error) throw error
      
      toast.success('✅ Player  and its all data  are deleted')
      fetchPlayers()
      fetchMatches()
      fetchMatchResults()
      fetchMedals()
    } catch (e) {
      toast.error('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  // ============ TOURNAMENT CRUD ============
  const handleDeleteTournament = async (id) => {
    if (!window.confirm('Delete this tournament?')) return
    setLoading(true)
    const { error } = await supabase.from('tournaments').delete().eq('id', id)
    if (!error) { toast.success('Tournament deleted'); fetchTournaments() } else toast.error('Error')
    setLoading(false)
  }
  const handleEditTournament = (t) => {
    setEditingTournament(t)
    setTournamentForm({
      title: t.title || '', ageCategory: t.age_category || '', weightClasses: t.weight_classes || '',
      startDate: t.start_date || '', endDate: t.end_date || '', venue: t.venue || '',
      maxPlayers: t.max_players || '', status: t.status || 'upcoming',
    })
    setShowTournamentModal(true)
  }
  const handleUpdateTournament = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const updateData = {
        title: tournamentForm.title, age_category: tournamentForm.ageCategory,
        weight_classes: tournamentForm.weightClasses, start_date: tournamentForm.startDate,
        end_date: tournamentForm.endDate, venue: tournamentForm.venue,
        max_players: tournamentForm.maxPlayers ? parseInt(tournamentForm.maxPlayers) : 32,
        status: tournamentForm.status, updated_at: new Date()
      }
      const { error } = await supabase.from('tournaments').update(updateData).eq('id', editingTournament.id)
      if (error) throw error
      toast.success('Updated!'); setShowTournamentModal(false); setEditingTournament(null); fetchTournaments()
    } catch (e) { toast.error(e.message || 'Error') }
    setLoading(false)
  }

  // ============ MATCH CRUD ============
  const handleDeleteMatch = async (id) => {
    if (!window.confirm('Delete this match?')) return
    setLoading(true)
    const { error } = await supabase.from('matches').delete().eq('id', id)
    if (!error) { toast.success('Match deleted'); fetchMatches() } else toast.error('Error')
    setLoading(false)
  }
  const handleEditMatch = (m) => {
    setEditingMatch(m)
    setMatchForm({
      tournamentId: m.tournament_id || '', player1Id: m.player1_id || '', player2Id: m.player2_id || '',
      round: m.round || 1,
      matchDate: m.match_date ? new Date(m.match_date).toISOString().slice(0, 16) : '',
      venue: m.venue || '', status: m.status || 'scheduled',
    })
    setShowMatchModal(true)
  }
  const handleUpdateMatch = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const updateData = {
        tournament_id: matchForm.tournamentId, player1_id: matchForm.player1Id, player2_id: matchForm.player2Id,
        round: parseInt(matchForm.round), match_date: matchForm.matchDate, venue: matchForm.venue,
        status: matchForm.status, updated_at: new Date()
      }
      const { error } = await supabase.from('matches').update(updateData).eq('id', editingMatch.id)
      if (error) throw error
      toast.success('Updated!'); setShowMatchModal(false); setEditingMatch(null); fetchMatches()
    } catch (e) { toast.error(e.message || 'Error') }
    setLoading(false)
  }
  const handleMatchSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    if (!matchForm.tournamentId || !matchForm.player1Id || !matchForm.player2Id) { toast.error('Select tournament and both players'); setLoading(false); return }
    if (matchForm.player1Id === matchForm.player2Id) { toast.error('Player 1 and Player 2 cannot be the same'); setLoading(false); return }
    if (!matchForm.weightClass) { toast.error('Select weight class'); setLoading(false); return }
    try {
      const { error } = await supabase.from('matches').insert([{
        tournament_id: matchForm.tournamentId, 
        player1_id: matchForm.player1Id, 
        player2_id: matchForm.player2Id,
        round: parseInt(matchForm.round), 
        match_date: matchForm.matchDate, 
        venue: matchForm.venue,
        status: matchForm.status || 'scheduled',
        match_type: matchForm.matchType || 'regular',
        weight_class: matchForm.weightClass,
      }])
      if (error) throw error
      toast.success('✅ Match scheduled!')
      setMatchForm({ 
        tournamentId: '', player1Id: '', player2Id: '', round: 1, 
        matchDate: '', venue: '', status: 'scheduled',
        matchType: 'regular', weightClass: '',
      })
      fetchMatches()
    } catch (e) { toast.error(e.message || 'Error') } finally { setLoading(false) }
  }
    const handleResultSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const { data: existing } = await supabase.from('match_results').select('id').eq('match_id', resultForm.matchId).maybeSingle()
      if (existing) { toast.error('Result already exists!'); setLoading(false); return }
      
      // Get match details first
      const { data: matchData } = await supabase.from('matches')
        .select('*').eq('id', resultForm.matchId).single()

      const { error } = await supabase.from('match_results').insert([{
        match_id: resultForm.matchId, winner_id: resultForm.winnerId,
        score1: parseInt(resultForm.score1), score2: parseInt(resultForm.score2),
        method: resultForm.method, round: parseInt(resultForm.round),
      }])
      if (error) throw error
      
      await supabase.from('matches').update({ status: 'completed' }).eq('id', resultForm.matchId)

      // ============ AUTO MEDAL ASSIGNMENT ============
      if (matchData && matchData.match_type && matchData.weight_class) {
        const winnerId = resultForm.winnerId
        const loserId = winnerId === matchData.player1_id ? matchData.player2_id : matchData.player1_id
        
        // Get players info
        const { data: winnerPlayer } = await supabase.from('players').select('club_name').eq('id', winnerId).single()
        const { data: loserPlayer } = await supabase.from('players').select('club_name').eq('id', loserId).single()

        // FINAL MATCH → Gold + Silver
        if (matchData.match_type === 'final') {
          // Gold to winner
          await supabase.from('tournament_medals').delete()
            .eq('tournament_id', matchData.tournament_id)
            .eq('weight_class', matchData.weight_class)
            .eq('position', 1)
          await supabase.from('tournament_medals').insert([{
            medal_date: new Date().toISOString().split('T')[0],
            tournament_id: matchData.tournament_id,
            weight_class: matchData.weight_class,
            position: 1,
            player_id: winnerId,
            team_name: winnerPlayer?.club_name || 'Unknown',
          }])
          
          // Silver to loser
          await supabase.from('tournament_medals').delete()
            .eq('tournament_id', matchData.tournament_id)
            .eq('weight_class', matchData.weight_class)
            .eq('position', 2)
          await supabase.from('tournament_medals').insert([{
            medal_date: new Date().toISOString().split('T')[0],
            tournament_id: matchData.tournament_id,
            weight_class: matchData.weight_class,
            position: 2,
            player_id: loserId,
            team_name: loserPlayer?.club_name || 'Unknown',
          }])
          
          toast.success(`🏆 Auto-assigned: 🥇 Gold to ${winnerPlayer?.club_name}, 🥈 Silver to ${loserPlayer?.club_name}`)
        }
        
        // BRONZE MATCH → Bronze to winner
        if (matchData.match_type === 'bronze') {
          await supabase.from('tournament_medals').delete()
            .eq('tournament_id', matchData.tournament_id)
            .eq('weight_class', matchData.weight_class)
            .eq('position', 3)
          await supabase.from('tournament_medals').insert([{
            medal_date: new Date().toISOString().split('T')[0],
            tournament_id: matchData.tournament_id,
            weight_class: matchData.weight_class,
            position: 3,
            player_id: winnerId,
            team_name: winnerPlayer?.club_name || 'Unknown',
          }])
          
          toast.success(`🥉 Auto-assigned: Bronze to ${winnerPlayer?.club_name}`)
        }
        
        fetchMedals()
      }
      // ================================================

      toast.success('✅ Result added!')
      setResultForm({ matchId: '', winnerId: '', score1: 0, score2: 0, method: 'points', round: 1 })
      setShowResultModal(false); setSelectedMatch(null); fetchMatches(); fetchMatchResults()
      stopTimer()
    } catch (e) { toast.error(e.message || 'Error') } finally { setLoading(false) }
  }

  // ============ PLAYER FORM ============
  const handlePlayerChange = (e) => {
    const { name, value, type, checked } = e.target
    setPlayerForm({ ...playerForm, [name]: type === 'checkbox' ? checked : value })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }
  const handleFileChange = (e, field) => {
    const f = e.target.files[0]
    if (f) { setPlayerForm({ ...playerForm, [field]: f }); if (errors[field]) setErrors({ ...errors, [field]: '' }) }
  }
  const validatePlayerForm = () => {
    const e = {}
    if (!playerForm.fullName?.trim()) e.fullName = 'Required'
    if (!playerForm.cnic?.trim()) e.cnic = 'Required'
    if (!playerForm.dateOfBirth) e.dateOfBirth = 'Required'
    if (!playerForm.gender) e.gender = 'Required'
    if (!playerForm.contactNumber?.trim()) e.contactNumber = 'Required'
    if (!playerForm.emergencyContact?.trim()) e.emergencyContact = 'Required'
    if (!playerForm.weight) e.weight = 'Required'
    if (!playerForm.height) e.height = 'Required'
    if (!playerForm.stance) e.stance = 'Required'
    if (!playerForm.experienceLevel) e.experienceLevel = 'Required'
    if (!playerForm.clubName?.trim()) e.clubName = 'Required'
    if (!playerForm.clearanceStatus) e.clearanceStatus = 'Required'
    else if (playerForm.clearanceStatus === 'failed') e.clearanceStatus = '❌ FAILED'
    else if (playerForm.clearanceStatus === 'pending') e.clearanceStatus = '⏳ Must be PASSED'
    if (!playerForm.checkupDate) e.checkupDate = 'Required'
    if (!playerForm.doctorName?.trim()) e.doctorName = 'Required'
    if (!playerForm.photo) e.photo = 'Required'
    if (!playerForm.medicalCertificate) e.medicalCertificate = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const handlePlayerSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    if (!validatePlayerForm()) { setLoading(false); toast.error('Fix errors'); return }
    try {
      const { count } = await supabase.from('players').select('*', { count: 'exact', head: true }).eq('cnic', playerForm.cnic)
      if (count && count > 0) { toast.error('CNIC exists!'); setLoading(false); return }
      let photoUrl = null
      if (playerForm.photo) {
        const ext = playerForm.photo.name.split('.').pop()
        const fn = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${ext}`
        const { error: up } = await supabase.storage.from('player-photos').upload(`players/${fn}`, playerForm.photo, { cacheControl: '3600', upsert: false })
        if (!up) { const { data: { publicUrl } } = supabase.storage.from('player-photos').getPublicUrl(`players/${fn}`); photoUrl = publicUrl }
      }
      let medicalUrl = null
      if (playerForm.medicalCertificate) {
        const ext = playerForm.medicalCertificate.name.split('.').pop()
        const fn = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${ext}`
        const { error: up } = await supabase.storage.from('medical-certificates').upload(`medical/${fn}`, playerForm.medicalCertificate, { cacheControl: '3600', upsert: false })
        if (!up) { const { data: { publicUrl } } = supabase.storage.from('medical-certificates').getPublicUrl(`medical/${fn}`); medicalUrl = publicUrl }
      }
      const tempEmail = `${playerForm.cnic}@punchtrack.com`
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email: tempEmail, password: 'Temp@123456', options: { data: { full_name: playerForm.fullName, role: 'player' } } })
      if (authErr) { toast.error('Auth: ' + authErr.message); setLoading(false); return }
      if (!authData?.user) { toast.error('Failed'); setLoading(false); return }
      const pd = {
        user_id: authData.user.id, full_name: playerForm.fullName, cnic: playerForm.cnic,
        date_of_birth: playerForm.dateOfBirth, gender: playerForm.gender,
        contact_number: playerForm.contactNumber, emergency_contact: playerForm.emergencyContact,
        weight: parseFloat(playerForm.weight), height: parseFloat(playerForm.height),
        stance: playerForm.stance, experience_level: playerForm.experienceLevel,
        club_name: playerForm.clubName, clearance_status: playerForm.clearanceStatus,
        checkup_date: playerForm.checkupDate, fit_for_combat: playerForm.fitForCombat,
        doctor_name: playerForm.doctorName, photo_url: photoUrl, medical_certificate_url: medicalUrl, status: 'active'
      }
      const { error: perr } = await supabase.from('players').insert([pd])
      if (perr) { toast.error('DB: ' + perr.message); setLoading(false); return }
      await supabase.from('profiles').update({ status: 'approved' }).eq('id', authData.user.id)
      toast.success('✅ Player registered!')
      resetPlayerForm(); fetchPlayers(); fetchUsers()
    } catch (e) { toast.error(e.message || 'Error') } finally { setLoading(false) }
  }
  const resetPlayerForm = () => {
    setPlayerForm({
      fullName: '', cnic: '', dateOfBirth: '', gender: '', contactNumber: '', emergencyContact: '',
      weight: '', height: '', stance: '', experienceLevel: '', clubName: '',
      clearanceStatus: '', checkupDate: '', fitForCombat: false, doctorName: '', photo: null, medicalCertificate: null
    })
    setErrors({})
  }

  // ============ TOURNAMENT ============
  const handleTournamentChange = (e) => setTournamentForm({ ...tournamentForm, [e.target.name]: e.target.value })
  const handleTournamentSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    if (!tournamentForm.title?.trim()) { toast.error('Title required'); setLoading(false); return }
    if (!tournamentForm.ageCategory) { toast.error('Age Category required'); setLoading(false); return }
    if (!tournamentForm.startDate || !tournamentForm.endDate) { toast.error('Dates required'); setLoading(false); return }
    try {
      const { error } = await supabase.from('tournaments').insert([{
        title: tournamentForm.title, age_category: tournamentForm.ageCategory,
        weight_classes: tournamentForm.weightClasses, start_date: tournamentForm.startDate,
        end_date: tournamentForm.endDate, venue: tournamentForm.venue,
        max_players: tournamentForm.maxPlayers ? parseInt(tournamentForm.maxPlayers) : 32,
        status: tournamentForm.status
      }])
      if (error) throw error
      toast.success('✅ Tournament created!')
      setTournamentForm({ title: '', ageCategory: '', weightClasses: '', startDate: '', endDate: '', venue: '', maxPlayers: '', status: 'upcoming' })
      fetchTournaments()
    } catch (e) { toast.error(e.message || 'Error') } finally { setLoading(false) }
  }

  // ============ OFFICIALS ============
  const handleOfficialChange = (e) => setOfficialForm({ ...officialForm, [e.target.name]: e.target.value })
  const handleEditOfficial = (o) => {
    setEditingOfficial(o)
    setOfficialForm({
      full_name: o.full_name || '', role: o.role || 'referee', unit: o.unit || '', post: o.post || '',
      contact_number: o.contact_number || '', email: o.email || '', cnic: o.cnic || '',
      experience_years: o.experience_years || 0, status: o.status || 'active'
    })
    setShowOfficialModal(true)
  }
  const handleDeleteOfficial = async (id) => {
    if (!window.confirm('Delete this official?')) return
    setLoading(true)
    const { error } = await supabase.from('officials').delete().eq('id', id)
    if (!error) { toast.success('Deleted'); fetchOfficials(); fetchDayOfficials() } else toast.error('Error')
    setLoading(false)
  }
  const handleOfficialSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    if (!officialForm.full_name?.trim()) { toast.error('Name required'); setLoading(false); return }
    try {
      const payload = {
        full_name: officialForm.full_name, role: officialForm.role, unit: officialForm.unit, post: officialForm.post,
        contact_number: officialForm.contact_number, email: officialForm.email, cnic: officialForm.cnic,
        experience_years: parseInt(officialForm.experience_years) || 0, status: officialForm.status, updated_at: new Date()
      }
      let r
      if (editingOfficial) r = await supabase.from('officials').update(payload).eq('id', editingOfficial.id)
      else r = await supabase.from('officials').insert([payload])
      if (r.error) throw r.error
      toast.success(editingOfficial ? 'Updated!' : 'Added!')
      setShowOfficialModal(false); setEditingOfficial(null); resetOfficialForm(); fetchOfficials()
    } catch (e) { toast.error(e.message || 'Error') } finally { setLoading(false) }
  }
  const resetOfficialForm = () => setOfficialForm({ full_name: '', role: 'referee', unit: '', post: '', contact_number: '', email: '', cnic: '', experience_years: 0, status: 'active' })

  // ============ BOUT OFFICIALS ============
  const handleBoutOfficialChange = (e) => setBoutOfficialForm({ ...boutOfficialForm, [e.target.name]: e.target.value })
  const resetBoutOfficialForm = () => setBoutOfficialForm({ match_id: '', referee_id: '', judge1_id: '', judge2_id: '', judge3_id: '', judge4_id: '', judge5_id: '', supervisor_id: '' })
  const handleEditBoutOfficial = (b) => {
    setEditingBoutOfficial(b)
    setBoutOfficialForm({
      match_id: b.match_id || '', referee_id: b.referee_id || '',
      judge1_id: b.judge1_id || '', judge2_id: b.judge2_id || '', judge3_id: b.judge3_id || '',
      judge4_id: b.judge4_id || '', judge5_id: b.judge5_id || '', supervisor_id: b.supervisor_id || '',
    })
    setShowBoutOfficialModal(true)
  }
  const handleDeleteBoutOfficial = async (id) => {
    if (!window.confirm('Delete R&J assignment?')) return
    setLoading(true)
    const { error } = await supabase.from('bout_officials').delete().eq('id', id)
    if (!error) { toast.success('Deleted'); fetchBoutOfficials() } else toast.error('Error')
    setLoading(false)
  }
  const handleBoutOfficialSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    if (!boutOfficialForm.match_id) { toast.error('Select a Bout'); setLoading(false); return }
    if (!boutOfficialForm.referee_id) { toast.error('Referee is required'); setLoading(false); return }
    try {
      const payload = {
        match_id: boutOfficialForm.match_id,
        referee_id: boutOfficialForm.referee_id || null,
        judge1_id: boutOfficialForm.judge1_id || null, judge2_id: boutOfficialForm.judge2_id || null,
        judge3_id: boutOfficialForm.judge3_id || null, judge4_id: boutOfficialForm.judge4_id || null,
        judge5_id: boutOfficialForm.judge5_id || null, supervisor_id: boutOfficialForm.supervisor_id || null,
        updated_at: new Date(),
      }
      let r
      if (editingBoutOfficial) r = await supabase.from('bout_officials').update(payload).eq('id', editingBoutOfficial.id)
      else r = await supabase.from('bout_officials').insert([payload])
      if (r.error) throw r.error
      toast.success(editingBoutOfficial ? '✅ Updated!' : '✅ Assignment saved!')
      setShowBoutOfficialModal(false); setEditingBoutOfficial(null); resetBoutOfficialForm(); fetchBoutOfficials()
    } catch (e) { toast.error(e.message || 'Error') } finally { setLoading(false) }
  }

  // ============ DAY OFFICIALS ============
  const handleSaveDayOfficials = async () => {
    if (!dailyDate) { toast.error('Select a date'); return }
    if (!dailyTournamentId) { toast.error('Select a tournament'); return }
    if (selectedDayOfficialIds.length === 0) { toast.error('Select at least one official'); return }
    setDailyOfficialsSaving(true)
    try {
      await supabase.from('day_officials').delete().eq('date', dailyDate).eq('tournament_id', dailyTournamentId)
      const rows = selectedDayOfficialIds.map(officialId => {
        const off = officials.find(o => o.id === officialId)
        return { date: dailyDate, tournament_id: dailyTournamentId, official_id: officialId, role_for_day: off.role }
      })
      const { error } = await supabase.from('day_officials').insert(rows)
      if (error) throw error
      toast.success('✅ Day officials saved!')
      fetchDayOfficials()
    } catch (e) { toast.error(e.message || 'Error') } finally { setDailyOfficialsSaving(false) }
  }
  const toggleDayOfficial = (id) => {
    if (selectedDayOfficialIds.includes(id)) setSelectedDayOfficialIds(selectedDayOfficialIds.filter(x => x !== id))
    else setSelectedDayOfficialIds([...selectedDayOfficialIds, id])
  }

  // ============ POINT TABLE / MEDAL HANDLERS ============
  const saveMedal = async (tournamentId, weightClass, position, playerId) => {
    if (!tournamentId) { toast.error('Select tournament first'); return }
    setPointSaving(true)
    try {
      await supabase.from('tournament_medals').delete()
        .eq('tournament_id', tournamentId).eq('weight_class', weightClass).eq('position', position)
      if (playerId) {
        const player = players.find(p => p.id === playerId)
        const payload = {
          medal_date: new Date().toISOString().split('T')[0],
          tournament_id: tournamentId, weight_class: weightClass,
          position: position, player_id: playerId,
          team_name: player?.club_name || 'Unknown',
        }
        const { error } = await supabase.from('tournament_medals').insert([payload])
        if (error) throw error
        toast.success('✅ Medal saved!')
      } else { toast.success('Medal cleared') }
      fetchMedals()
    } catch (e) { toast.error(e.message || 'Error') } finally { setPointSaving(false) }
  }
  const getMedalPlayer = (tournamentId, weightClass, position) => {
    const m = medals.find(x => x.tournament_id === tournamentId && x.weight_class === weightClass && x.position === position)
    return m?.player_id || ''
  }
  const calcTeamStandings = (tournamentId) => {
    const tMedals = medals.filter(m => m.tournament_id === tournamentId)
    const teams = {}
    tMedals.forEach(m => {
      const team = m.team_name || 'Unknown'
      if (!teams[team]) teams[team] = { gold: 0, silver: 0, bronze: 0, weightMap: {} }
      if (m.position === 1) teams[team].gold++
      else if (m.position === 2) teams[team].silver++
      else if (m.position === 3) teams[team].bronze++
      teams[team].weightMap[m.weight_class] = m.position
    })
    const arr = Object.entries(teams).map(([team, data]) => ({
      team, ...data,
      total: data.gold + data.silver + data.bronze,
      points: data.gold * POINTS.gold + data.silver * POINTS.silver + data.bronze * POINTS.bronze,
    }))
    arr.sort((a, b) => b.points - a.points || b.gold - a.gold || b.silver - a.silver)
    arr.forEach((t, i) => { t.position = i + 1 })
    return arr
  }
  const ordinal = (n) => {
    if (n % 100 >= 11 && n % 100 <= 13) return n + 'TH'
    switch (n % 10) {
      case 1: return n + 'ST'
      case 2: return n + 'ND'
      case 3: return n + 'RD'
      default: return n + 'TH'
    }
  }
  const getPlayersForWeight = (tournamentId, weightClass) => {
    if (!tournamentId) return []
    const matchPlayerIds = new Set()
    matches.forEach(m => {
      if (m.tournament_id === tournamentId) {
        if (m.player1_id) matchPlayerIds.add(m.player1_id)
        if (m.player2_id) matchPlayerIds.add(m.player2_id)
      }
    })
    return players.filter(p => matchPlayerIds.has(p.id))
  }

  // ============ POINT TABLE PDF (WITH BOTH LOGOS) ============
  const generatePointTablePDF = async () => {
    if (!pointTournamentId) { toast.error('Select a tournament first'); return }
    const tournament = tournaments.find(t => t.id === pointTournamentId)
    if (!tournament) { toast.error('Tournament not found'); return }

    const standings = calcTeamStandings(pointTournamentId)
    if (standings.length === 0) { toast.error('No medals entered yet'); return }

    setPointPdfGenerating(true)
    try {
      let bbsulLogoBase64 = null
      let hecLogoBase64 = null
      try { bbsulLogoBase64 = await loadImageAsBase64(BBSUL_LOGO_URL) } catch (e) { console.warn('BBSUL logo missing', e) }
      try { hecLogoBase64 = await loadImageAsBase64(HEC_LOGO_URL) } catch (e) { console.warn('HEC logo missing', e) }

      const doc = new jsPDF('landscape', 'mm', 'a4')
      const pageW = doc.internal.pageSize.getWidth()
      const pageH = doc.internal.pageSize.getHeight()

      // Logos
      if (bbsulLogoBase64) { try { doc.addImage(bbsulLogoBase64, 'PNG', 15, 8, 28, 28) } catch (e) { console.warn(e) } }
      if (hecLogoBase64) { try { doc.addImage(hecLogoBase64, 'PNG', pageW - 43, 8, 28, 28) } catch (e) { console.warn(e) } }

      // Header
      doc.setFontSize(15); doc.setFont('helvetica', 'bold')
      doc.text('ALL PAKISTAN INTERVARSITY BOXING CHAMPIONSHIP 2023-2024', pageW / 2, 18, { align: 'center' })
      doc.setFontSize(11); doc.setFont('helvetica', 'normal')
      doc.text('Organized by: BBSUL with the collaboration with HEC', pageW / 2, 25, { align: 'center' })
      doc.setFontSize(13); doc.setFont('helvetica', 'bold')
      doc.text('POINT TABLE', pageW / 2, 35, { align: 'center' })
      doc.setFontSize(9); doc.setFont('helvetica', 'italic')
      doc.text(`${tournament.title} ${tournament.age_category ? '(' + tournament.age_category + ')' : ''}`, pageW / 2, 42, { align: 'center' })

      // Table
      const headers = ['S.No', 'Team', ...WEIGHT_CLASSES, 'GOLD', 'SILVER', 'BRONZE', 'OTHER', 'TOTAL', 'POINTS', 'POSITION']
      const body = standings.map((team, idx) => {
        const row = [String(idx + 1), team.team]
        WEIGHT_CLASSES.forEach(wc => { const pos = team.weightMap[wc]; row.push(pos ? String(pos) : '-') })
        row.push(String(team.gold), String(team.silver), String(team.bronze), '00')
        row.push(String(team.total).padStart(2, '0'))
        row.push(String(team.points))
        row.push(ordinal(team.position))
        return row
      })

      autoTable(doc, {
        startY: 47, head: [headers], body: body, theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.2, lineColor: [0, 0, 0], lineWidth: 0.15, textColor: [0, 0, 0], halign: 'center', valign: 'middle' },
        headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7, halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.2 },
        bodyStyles: { halign: 'center' },
        columnStyles: {
          0: { cellWidth: 9 }, 1: { cellWidth: 22, halign: 'left', fontStyle: 'bold' },
          20: { cellWidth: 10, fontStyle: 'bold', textColor: [200, 20, 20] },
          21: { cellWidth: 13, fontStyle: 'bold' },
        },
        didParseCell: (d) => {
          if (d.section === 'body' && d.column.index >= 2 && d.column.index < 2 + WEIGHT_CLASSES.length) {
            if (d.cell.raw === '1') { d.cell.styles.textColor = [200, 150, 0]; d.cell.styles.fontStyle = 'bold' }
            else if (d.cell.raw === '2') { d.cell.styles.textColor = [150, 150, 150]; d.cell.styles.fontStyle = 'bold' }
            else if (d.cell.raw === '3') { d.cell.styles.textColor = [180, 100, 30]; d.cell.styles.fontStyle = 'bold' }
          }
          if (d.section === 'body' && d.column.index === 2 + WEIGHT_CLASSES.length) { d.cell.styles.textColor = [200, 150, 0]; d.cell.styles.fontStyle = 'bold' }
          if (d.section === 'body' && d.column.index === 2 + WEIGHT_CLASSES.length + 1) { d.cell.styles.textColor = [150, 150, 150]; d.cell.styles.fontStyle = 'bold' }
          if (d.section === 'body' && d.column.index === 2 + WEIGHT_CLASSES.length + 2) { d.cell.styles.textColor = [180, 100, 30]; d.cell.styles.fontStyle = 'bold' }
        },
      })

      // Footer
      doc.setFontSize(10); doc.setFont('helvetica', 'bold')
      doc.text('Organized', 15, pageH - 35)
      doc.setLineWidth(0.3)
      doc.line(35, pageH - 34, 85, pageH - 34)
      doc.text('Sec:', 95, pageH - 35)
      doc.line(108, pageH - 34, 160, pageH - 34)
      doc.setLineWidth(0.8); doc.setDrawColor(150, 0, 0)
      doc.line(15, pageH - 18, pageW - 15, pageH - 18)
      doc.setFontSize(9); doc.setFont('helvetica', 'bold')
      doc.text('Benazir Bhutto Shaheed University, Faqeer Muhammad Durra Khan Road Near KashtiChowk, Lyari, Karachi', pageW / 2, pageH - 12, { align: 'center' })
      doc.text('Contact # 021-32744025', pageW / 2, pageH - 7, { align: 'center' })

      const fileName = `PointTable-${tournament.title.replace(/\s+/g, '-')}-${Date.now()}.pdf`
      doc.save(fileName)
      toast.success(`✅ PDF: ${fileName}`)
    } catch (e) { console.error('Point Table PDF error:', e); toast.error('Error: ' + e.message) } finally { setPointPdfGenerating(false) }
  }

  // ============ MATCH HANDLERS ============
  const handleMatchChange = (e) => setMatchForm({ ...matchForm, [e.target.name]: e.target.value })
  const handleResultChange = (e) => setResultForm({ ...resultForm, [e.target.name]: e.target.value })

  const openResultModal = (match) => {
    setSelectedMatch(match)
    setResultForm({
      matchId: match.id, winnerId: '', score1: liveScore1 || 0, score2: liveScore2 || 0,
      method: 'points', round: roundRef.current || 1,
    })
    setShowResultModal(true)
  }
   const openMatchDetailModal = (match) => {
    setSelectedMatchDetail(match)
    setLiveScore1(0); setLiveScore2(0)
    setCurrentRound(1); roundRef.current = 1
    setRoundTime(ROUND_TIME); setBreakTime(BREAK_TIME); setIsBreak(false)
    setTimerRunning(false); setTimerPaused(false)
    modeRef.current = 'idle'
    setCurrentResult(null)
    setSelectedJudgeIds(['', '', '', '', ''])
    setRoundScores({
      1: [0,1,2,3,4].map(i => ({ judge_idx: i, red: 10, blue: 9 })),
      2: [0,1,2,3,4].map(i => ({ judge_idx: i, red: 10, blue: 9 })),
      3: [0,1,2,3,4].map(i => ({ judge_idx: i, red: 10, blue: 9 })),
    })
    setSavedRounds({ 1: false, 2: false, 3: false })
    setShowMatchDetailModal(true)
  }

  // ============ PDF: DAILY ============
  const generateDayDocument = async () => {
    if (!docDate) { toast.error('Select a date'); return }
    setDocGenerating(true)
    try {
      const { data: dayMatches, error: mErr } = await supabase.from('matches')
        .select(`*, tournaments(id, title, venue, age_category), player1:players!matches_player1_id_fkey(full_name, club_name, weight, id), player2:players!matches_player2_id_fkey(full_name, club_name, weight, id)`)
        .gte('match_date', `${docDate}T00:00:00`).lte('match_date', `${docDate}T23:59:59`).order('match_date', { ascending: true })
      if (mErr) throw mErr
      if (!dayMatches || dayMatches.length === 0) { toast.error(`No matches for ${docDate}`); setDocGenerating(false); return }
      const mIds = dayMatches.map(m => m.id)
      const { data: resData } = await supabase.from('match_results').select('*').in('match_id', mIds)
      const resMap = {}; if (resData) resData.forEach(r => { resMap[r.match_id] = r })
      const { data: dayOffData } = await supabase.from('day_officials')
        .select(`*, official:officials(full_name, role, unit, post, contact_number)`).eq('date', docDate)
      let hecLogoBase64 = null
      try { hecLogoBase64 = await loadImageAsBase64(HEC_LOGO_URL) } catch (e) { console.warn('Logo missing', e) }
      const doc = new jsPDF('landscape', 'mm', 'a4')
      const fmtDate = new Date(docDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
      const dayName = new Date(docDate).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
      const byTournament = {}; const tOrder = []
      dayMatches.forEach(m => { const tid = m.tournament_id; if (!byTournament[tid]) { byTournament[tid] = []; tOrder.push(tid) }; byTournament[tid].push(m) })
      if (hecLogoBase64) doc.addImage(hecLogoBase64, 'PNG', 128, 5, 40, 40)
      doc.setFontSize(14); doc.setFont('helvetica', 'bold')
      doc.text('ALL KARACHI BOXING TOURNAMENT', 148, 52, { align: 'center' })
      doc.setFontSize(11); doc.text(`${dayName} ${fmtDate}`, 148, 59, { align: 'center' })
      const tableData = []; let boutNum = 1
      tOrder.forEach(tid => {
        const ms = byTournament[tid]
        const t = ms[0]?.tournaments
        const tName = t?.title || 'Tournament'; const aCat = t?.age_category || ''
        tableData.push([{ content: `${tName.toUpperCase()} ${aCat ? '— ' + aCat.toUpperCase() : ''}`, colSpan: 8, styles: { halign: 'center', fontStyle: 'bold', fillColor: [255, 240, 240], textColor: [220, 20, 20], fontSize: 11 } }])
        ms.forEach(m => {
          const phase = m.round ? `Round ${m.round}` : 'Bout'
          const wc = m.player1?.weight && m.player2?.weight ? `${m.player1.weight} KG` : '-'
          const r = resMap[m.id]; let dec = ''
          if (r) { const wn = r.winner_id === m.player1?.id ? m.player1?.full_name : r.winner_id === m.player2?.id ? m.player2?.full_name : ''; dec = wn ? `Won: ${wn}` : '' }
          tableData.push([String(boutNum), `Bout ${boutNum}`, phase, wc, 'RED', m.player1?.full_name || 'TBD', m.player1?.club_name || '-', dec])
          tableData.push(['', '', '', '', 'BLUE', m.player2?.full_name || 'TBD', m.player2?.club_name || '-', ''])
          boutNum++
        })
      })
      autoTable(doc, {
        startY: 64, head: [['Order No', 'Bout', 'Phase', 'Weight', 'Corner', 'Name', 'Unit', 'Decision']], body: tableData, theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0], valign: 'middle' },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.3 },
        bodyStyles: { halign: 'center' },
        columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 20 }, 2: { cellWidth: 25 }, 3: { cellWidth: 25 }, 4: { cellWidth: 20, fontStyle: 'bold' }, 5: { cellWidth: 55, halign: 'left' }, 6: { cellWidth: 30 }, 7: { cellWidth: 45 } },
        didParseCell: (d) => { if (d.section === 'body' && d.column.index === 4) { if (d.cell.raw === 'RED') { d.cell.styles.textColor = [220, 20, 20]; d.cell.styles.fontStyle = 'bold' } else if (d.cell.raw === 'BLUE') { d.cell.styles.textColor = [20, 60, 220]; d.cell.styles.fontStyle = 'bold' } } },
      })
      const p1H = doc.internal.pageSize.getHeight()
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.text('Hasan Asif Azad', 20, p1H - 40)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text('General Secretary', 20, p1H - 35); doc.text('Sindh Boxing Association', 20, p1H - 30)
      doc.setLineWidth(0.5); doc.line(15, p1H - 22, 282, p1H - 22)
      doc.setFontSize(8); doc.text('Azad Baloch Boxing Club office, Faqeer Muhammad Durra Khan Road, Adjacent with Gabol Park, Lyari, Karachi', 148, p1H - 15, { align: 'center' }); doc.text('sboxingassociation@gmail.com', 148, p1H - 10, { align: 'center' })
      doc.addPage('a4', 'landscape')
      if (hecLogoBase64) doc.addImage(hecLogoBase64, 'PNG', 128, 5, 40, 40)
      doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.text('OFFICIALS DETAILS', 148, 52, { align: 'center' })
      doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.text(`${dayName} ${fmtDate}`, 148, 59, { align: 'center' })
      const offData = []
      tOrder.forEach(tid => {
        const t = byTournament[tid][0]?.tournaments
        const tName = t?.title || 'Tournament'; const aCat = t?.age_category || ''
        const tOff = (dayOffData || []).filter(d => d.tournament_id === tid)
        offData.push([{ content: `${tName.toUpperCase()} ${aCat ? '— ' + aCat.toUpperCase() : ''}`, colSpan: 5, styles: { halign: 'center', fontStyle: 'bold', fillColor: [255, 240, 240], textColor: [220, 20, 20], fontSize: 11 } }])
        if (tOff.length === 0) { offData.push([{ content: 'No officials assigned', colSpan: 5, styles: { halign: 'center', fontStyle: 'italic', textColor: [150, 150, 150] } }]); return }
        const refs = tOff.filter(d => d.role_for_day === 'referee'); const judges = tOff.filter(d => d.role_for_day === 'judge'); const juries = tOff.filter(d => d.role_for_day === 'jury')
        if (refs.length > 0) { offData.push([{ content: 'REFEREES', colSpan: 5, styles: { halign: 'left', fontStyle: 'bold', fillColor: [245, 230, 230], textColor: [200, 20, 20] } }]); refs.forEach((d, i) => offData.push([String(i + 1), d.official?.full_name || '-', d.official?.unit || '-', d.official?.post || 'Referee', d.official?.contact_number || '-'])) }
        if (judges.length > 0) { offData.push([{ content: 'JUDGES', colSpan: 5, styles: { halign: 'left', fontStyle: 'bold', fillColor: [230, 240, 255], textColor: [20, 60, 200] } }]); judges.forEach((d, i) => offData.push([String(i + 1), d.official?.full_name || '-', d.official?.unit || '-', d.official?.post || 'Judge', d.official?.contact_number || '-'])) }
        if (juries.length > 0) { offData.push([{ content: 'JURY MEMBERS', colSpan: 5, styles: { halign: 'left', fontStyle: 'bold', fillColor: [230, 250, 235], textColor: [20, 120, 60] } }]); juries.forEach((d, i) => offData.push([String(i + 1), d.official?.full_name || '-', d.official?.unit || '-', d.official?.post || 'Jury Member', d.official?.contact_number || '-'])) }
      })
      if (offData.length === 0) offData.push([{ content: 'No officials assigned', colSpan: 5, styles: { halign: 'center', fontStyle: 'italic' } }])
      autoTable(doc, {
        startY: 64, head: [['#', 'Name', 'Unit', 'Post', 'Contact Number']], body: offData, theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.3 },
        columnStyles: { 0: { cellWidth: 15, halign: 'center' }, 1: { cellWidth: 70, halign: 'left' }, 2: { cellWidth: 50, halign: 'center' }, 3: { cellWidth: 60, halign: 'center' }, 4: { cellWidth: 45, halign: 'center' } },
      })
      const p2H = doc.internal.pageSize.getHeight()
      doc.setLineWidth(0.5); doc.line(15, p2H - 22, 282, p2H - 22)
      doc.setFontSize(8); doc.text('Azad Baloch Boxing Club office, Faqeer Muhammad Durra Khan Road, Adjacent with Gabol Park, Lyari, Karachi', 148, p2H - 15, { align: 'center' }); doc.text('sboxingassociation@gmail.com', 148, p2H - 10, { align: 'center' })
      const fileName = `KBBC-Draw-${docDate}.pdf`
      doc.save(fileName); toast.success(`✅ PDF: ${fileName}`)
      setShowDocModal(false); setDocDate('')
    } catch (e) { console.error('PDF error:', e); toast.error('Error: ' + e.message) } finally { setDocGenerating(false) }
  }

  // ============ PDF: R&J ============
  const generateRJDocument = async () => {
    if (!rjDocTournamentId) { toast.error('Select a tournament'); return }
    setRjDocGenerating(true)
    try {
      const { data: assignments, error } = await supabase.from('bout_officials').select(`
        *, match:matches(id, round, match_date, tournament_id,
          tournament:tournaments(title, age_category, venue),
          player1:players!matches_player1_id_fkey(full_name),
          player2:players!matches_player2_id_fkey(full_name)),
        referee:officials!bout_officials_referee_id_fkey(full_name, unit, post),
        j1:officials!bout_officials_judge1_id_fkey(full_name, unit),
        j2:officials!bout_officials_judge2_id_fkey(full_name, unit),
        j3:officials!bout_officials_judge3_id_fkey(full_name, unit),
        j4:officials!bout_officials_judge4_id_fkey(full_name, unit),
        j5:officials!bout_officials_judge5_id_fkey(full_name, unit),
        supervisor:officials!bout_officials_supervisor_id_fkey(full_name, unit)
      `)
      if (error) throw error
      const filtered = (assignments || []).filter(a => a.match?.tournament_id === rjDocTournamentId)
      if (filtered.length === 0) { toast.error('No R&J assignments for this tournament'); setRjDocGenerating(false); return }
      const tournament = filtered[0]?.match?.tournament
      const doc = new jsPDF('portrait', 'mm', 'a4')
      let hecLogoBase64 = null
      try { hecLogoBase64 = await loadImageAsBase64(HEC_LOGO_URL) } catch (e) { console.warn('Logo missing', e) }
      filtered.forEach((a, idx) => {
        if (idx > 0) doc.addPage('a4', 'portrait')
        if (hecLogoBase64) doc.addImage(hecLogoBase64, 'PNG', 85, 8, 40, 40)
        doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.text('HIGHER EDUCATION COMMISSION', 105, 55, { align: 'center' })
        doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.text('Affiliated with Pakistan Boxing Federation', 105, 61, { align: 'center' })
        doc.setLineWidth(0.5); doc.line(15, 65, 195, 65)
        doc.setFontSize(11); doc.setFont('helvetica', 'bold')
        const tTitle = tournament?.title || 'Boxing Championship'
        doc.text(tTitle.toUpperCase(), 105, 73, { align: 'center', maxWidth: 180 })
        if (tournament?.age_category) { doc.setFontSize(10); doc.text(`(${tournament.age_category})`, 105, 79, { align: 'center' }) }
        doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('REFEREE / JUDGE ASSIGNMENTS', 105, 88, { align: 'center' })
        const matchDate = a.match?.match_date ? new Date(a.match.match_date).toLocaleDateString('en-GB') : '____'
        doc.setFontSize(11); doc.setFont('helvetica', 'normal')
        doc.text(`BOUT NO:`, 25, 98); doc.setFont('helvetica', 'bold'); doc.text(`${idx + 1}`, 55, 98)
        doc.setFont('helvetica', 'normal'); doc.text(`DATE:`, 120, 98); doc.setFont('helvetica', 'bold'); doc.text(matchDate, 140, 98)
        doc.setFontSize(9); doc.setFont('helvetica', 'italic')
        doc.text(`Red: ${a.match?.player1?.full_name || 'TBD'}   |   Blue: ${a.match?.player2?.full_name || 'TBD'}`, 105, 105, { align: 'center' })
        const rows = [
          ['1', a.referee?.full_name || '_____________', 'REFEREE', ''],
          ['2', a.j1?.full_name || '_____________', 'J-1', ''],
          ['3', a.j2?.full_name || '_____________', 'J-2', ''],
          ['4', a.j3?.full_name || '_____________', 'J-3', ''],
          ['5', a.j4?.full_name || '_____________', 'J-4', ''],
          ['6', a.j5?.full_name || '_____________', 'J-5', ''],
        ]
        autoTable(doc, {
          startY: 112, head: [['S.#', 'NAME', 'REFEREE / JUDGE', 'SIGN. OF SUPERVISOR']], body: rows, theme: 'grid',
          styles: { fontSize: 11, cellPadding: 4, lineColor: [0, 0, 0], lineWidth: 0.3, textColor: [0, 0, 0], valign: 'middle', minCellHeight: 12 },
          headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.4 },
          columnStyles: { 0: { cellWidth: 15, halign: 'center' }, 1: { cellWidth: 70, halign: 'left', fontStyle: 'bold' }, 2: { cellWidth: 45, halign: 'center', fontStyle: 'bold' }, 3: { cellWidth: 55, halign: 'center' } },
          didParseCell: (d) => { if (d.section === 'body' && d.column.index === 2) { d.cell.styles.textColor = d.cell.raw === 'REFEREE' ? [200, 20, 20] : [20, 60, 200] } },
        })
        const bottomY = doc.internal.pageSize.getHeight() - 40
        doc.setFontSize(10); doc.setFont('helvetica', 'normal')
        doc.text('SUPERVISOR:', 20, bottomY); doc.setLineWidth(0.3); doc.line(50, bottomY + 1, 110, bottomY + 1)
        doc.text('DATE:', 130, bottomY); doc.line(145, bottomY + 1, 190, bottomY + 1)
        doc.setFontSize(8)
        doc.text('Azad Baloch Boxing Club office, Faqeer Muhammad Durra Khan Road, Adjacent with Gabol Park, Lyari, Karachi', 105, doc.internal.pageSize.getHeight() - 15, { align: 'center', maxWidth: 190 })
        doc.text('sboxingassociation@gmail.com', 105, doc.internal.pageSize.getHeight() - 10, { align: 'center' })
      })
      const fileName = `R&J-Assignments-${tournament?.title?.replace(/\s+/g, '-') || 'Tournament'}-${Date.now()}.pdf`
      doc.save(fileName); toast.success(`✅ PDF: ${fileName}`)
      setShowRJDocModal(false); setRjDocTournamentId('')
    } catch (e) { console.error('R&J PDF error:', e); toast.error('Error: ' + e.message) } finally { setRjDocGenerating(false) }
  }

  // ============ FILTERS ============
  const filteredPlayers = players.filter(p => p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.cnic?.toLowerCase().includes(searchTerm.toLowerCase()) || p.club_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredTournaments = tournaments.filter(t => t.title?.toLowerCase().includes(searchTerm.toLowerCase()) || t.venue?.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredMatches = matches.filter(m => m.tournaments?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || m.player1?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.player2?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredOfficials = officials.filter(o => o.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || o.unit?.toLowerCase().includes(searchTerm.toLowerCase()))

  const statCards = [
    { icon: FaUsers, label: 'Users', value: stats.totalUsers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: FaUserClock, label: 'Pending', value: stats.pendingApplications, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { icon: FaUserFriends, label: 'Players', value: stats.totalPlayers, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { icon: FaTrophy, label: 'Tournaments', value: stats.totalTournaments, color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: FaFistRaised, label: 'Matches', value: stats.totalMatches, color: 'text-red-500', bg: 'bg-red-500/10' },
    { icon: FaCheckCircle, label: 'Completed', value: stats.completedMatches, color: 'text-green-500', bg: 'bg-green-500/10' },
  ]

  // ============ RENDER MATCH DETAIL MODAL ============
  const renderMatchDetailModal = () => {
    if (!showMatchDetailModal || !selectedMatchDetail) return null
    const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
    const resultLabel = currentResult ? RESULT_METHODS.find(m => m.value === currentResult.method)?.label : null
    const { red: finalRed, blue: finalBlue } = calcFinalTotal()
    const autoWinner = calcAutoWinner()
    const judgeOptions = officials.filter(o => o.role === 'judge')

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className={`rounded-xl p-6 max-w-5xl w-full max-h-[95vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>

          <div className="mb-5 flex flex-col md:flex-row items-stretch justify-center gap-2 md:gap-4">
            <div className="flex-1 flex items-center justify-center gap-3 px-4 py-3 bg-red-600 rounded-lg shadow-lg">
              <span className="text-white font-bold text-xs md:text-sm bg-red-900/50 px-2 py-1 rounded">🔴 RED CORNER</span>
              <span className="text-white font-display text-base md:text-xl font-black truncate">{selectedMatchDetail.player1?.full_name}</span>
            </div>
            <span className="text-[#e11d48] font-display text-3xl font-black self-center px-2">VS</span>
            <div className="flex-1 flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 rounded-lg shadow-lg">
              <span className="text-white font-bold text-xs md:text-sm bg-blue-900/50 px-2 py-1 rounded">🔵 BLUE CORNER</span>
              <span className="text-white font-display text-base md:text-xl font-black truncate">{selectedMatchDetail.player2?.full_name}</span>
            </div>
          </div>

          {/* JUDGES */}
          <div className={`mb-4 p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-300'}`}>
            <h3 className={`font-display font-bold mb-3 text-purple-600 text-lg`}>⚖️ MATCH JUDGES (Fixed for whole match)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map(idx => (
                <div key={idx}>
                  <label className={`block text-xs font-bold mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Judge J-{idx + 1}</label>
                  <select value={selectedJudgeIds[idx]} onChange={(e) => updateJudgeSelection(idx, e.target.value)}
                    className={`w-full px-2 py-1.5 rounded-lg border text-sm ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}>
                    <option value="">-- Select --</option>
                    {judgeOptions.map(o => (<option key={o.id} value={o.id}>{o.full_name}</option>))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* TIMER INFO */}
          <div className={`mb-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-sm text-gray-500">Round</p><p className={`font-display text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentRound}/{MAX_ROUNDS}</p></div>
              <div><p className="text-sm text-gray-500">{isBreak ? 'Break Time' : 'Round Time'}</p><p className={`font-display text-3xl font-bold ${isBreak ? 'text-yellow-500' : 'text-green-500'}`}>{isBreak ? fmt(breakTime) : fmt(roundTime)}</p></div>
              <div><p className="text-sm text-gray-500">Status</p><p className={`font-display text-lg font-bold ${isBreak ? 'text-yellow-500' : timerRunning ? 'text-green-500' : timerPaused ? 'text-orange-500' : 'text-gray-500'}`}>{isBreak ? '⏸ Break' : timerRunning ? '🟢 Live' : timerPaused ? '⏸ Paused' : '⚪ Not Started'}</p></div>
            </div>
          </div>

          {/* TIMER CONTROLS */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <button onClick={startTimer} disabled={timerRunning} className={`px-4 py-2 rounded-lg font-bold text-white ${timerRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}><FaPlay className="inline mr-1" /> Start</button>
            <button onClick={pauseTimer} disabled={!timerRunning} className={`px-4 py-2 rounded-lg font-bold text-white ${!timerRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'}`}><FaPause className="inline mr-1" /> Pause</button>
            <button onClick={resumeTimer} disabled={!timerPaused} className={`px-4 py-2 rounded-lg font-bold text-white ${!timerPaused ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}><FaPlay className="inline mr-1" /> Resume</button>
            <button onClick={stopTimer} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"><FaStop className="inline mr-1" /> Stop</button>
          </div>

          {/* ROUND SCORING */}
          {[1, 2, 3].map(round => {
            const isOpen = isRoundOpen(round)
            const { redTotal, blueTotal } = calcRoundTotal(round)
            const roundWinner = redTotal > blueTotal ? 'RED' : blueTotal > redTotal ? 'BLUE' : 'DRAW'
            return (
              <div key={round} className={`mb-4 p-4 rounded-lg border-2 ${isOpen
                ? theme === 'dark' ? 'bg-[#e11d48]/10 border-[#e11d48]' : 'bg-[#e11d48]/5 border-[#e11d48]'
                : theme === 'dark' ? 'bg-gray-800/40 border-gray-700 opacity-60' : 'bg-gray-100 border-gray-300 opacity-60'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className={`font-display font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    📋 ROUND {round} SCORING {!isOpen && <span className="text-xs">(Locked)</span>}
                  </h3>
                  {savedRounds[round] && <span className="text-green-500 font-bold text-sm">✅ Saved</span>}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[400px]">
                    <thead>
                      <tr className={theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}>
                        <th className={`text-left py-2 px-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Judge</th>
                        <th className="text-center py-2 px-2 text-sm text-red-500">RED</th>
                        <th className="text-center py-2 px-2 text-sm text-blue-500">BLUE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roundScores[round].map((s, idx) => (
                        <tr key={idx} className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
                          <td className={`py-2 px-2 text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>J-{idx + 1}: {judgeOptions.find(j => j.id === selectedJudgeIds[idx])?.full_name || '—'}</td>
                          <td className="py-2 px-2 text-center">
                            <input type="number" min="0" max="10" value={s.red} onChange={(e) => updateRoundScore(round, idx, 'red', e.target.value)} disabled={!isOpen}
                              className={`w-16 px-2 py-1 text-center rounded-lg border font-bold text-red-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-white'} ${!isOpen ? 'cursor-not-allowed opacity-50' : ''}`} />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input type="number" min="0" max="10" value={s.blue} onChange={(e) => updateRoundScore(round, idx, 'blue', e.target.value)} disabled={!isOpen}
                              className={`w-16 px-2 py-1 text-center rounded-lg border font-bold text-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-white'} ${!isOpen ? 'cursor-not-allowed opacity-50' : ''}`} />
                          </td>
                        </tr>
                      ))}
                      <tr className="font-black text-lg">
                        <td className={`py-2 px-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>TOTAL</td>
                        <td className="py-2 px-2 text-center text-red-500">{redTotal}</td>
                        <td className="py-2 px-2 text-center text-blue-500">{blueTotal}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 items-center">
                  <button onClick={() => saveRoundScores(round)} disabled={!isOpen || scoresSaving}
                    className={`px-4 py-2 rounded-lg font-bold text-white ${(!isOpen || scoresSaving) ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#e11d48] hover:bg-[#c01739]'}`}>
                    <FaSave className="inline mr-1" /> {scoresSaving ? 'Saving...' : (savedRounds[round] ? 'Update Round ' + round : 'Save Round ' + round)}
                  </button>
                  <span className={`font-bold text-sm ${roundWinner === 'RED' ? 'text-red-500' : roundWinner === 'BLUE' ? 'text-blue-500' : 'text-gray-500'}`}>
                    {roundWinner === 'DRAW' ? '⚖️ Draw' : `🏆 ${roundWinner} wins Round ${round}`}
                  </span>
                </div>
              </div>
            )
          })}

          {/* FINAL TOTAL */}
          <div className={`mb-4 p-5 rounded-lg border-4 ${theme === 'dark' ? 'bg-gradient-to-r from-red-900/30 to-blue-900/30 border-[#e11d48]' : 'bg-gradient-to-r from-red-50 to-blue-50 border-[#e11d48]'}`}>
            <h3 className={`font-display text-2xl font-black text-center mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>🏆 FINAL SCORE (After 3 Rounds)</h3>
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <p className="text-sm font-bold text-red-500 mb-1">🔴 RED</p>
                <p className="font-display text-4xl font-black text-red-500">{finalRed}</p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{selectedMatchDetail.player1?.full_name}</p>
              </div>
              <div className="text-center"><p className="font-display text-3xl font-black text-[#e11d48]">{autoWinner === 'draw' ? 'DRAW' : autoWinner === 'red' ? 'RED WINS' : 'BLUE WINS'}</p></div>
              <div className="text-center">
                <p className="text-sm font-bold text-blue-500 mb-1">🔵 BLUE</p>
                <p className="font-display text-4xl font-black text-blue-500">{finalBlue}</p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{selectedMatchDetail.player2?.full_name}</p>
              </div>
            </div>
          </div>

          {/* RESULT BUTTONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300'}`}>
              <h3 className="font-display font-bold mb-3 text-red-600 text-lg">🔴 RED CORNER WINS BY:</h3>
              <div className="grid grid-cols-3 gap-2">
                {RESULT_METHODS.map(m => (
                  <button key={m.value} onClick={() => pickResult('red', m.value)}
                    className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${currentResult?.corner === 'red' && currentResult?.method === m.value ? 'bg-red-700 text-white ring-4 ring-red-400 scale-105' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                    {m.short}
                  </button>
                ))}
              </div>
            </div>
            <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-300'}`}>
              <h3 className="font-display font-bold mb-3 text-blue-600 text-lg">🔵 BLUE CORNER WINS BY:</h3>
              <div className="grid grid-cols-3 gap-2">
                {RESULT_METHODS.map(m => (
                  <button key={m.value} onClick={() => pickResult('blue', m.value)}
                    className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${currentResult?.corner === 'blue' && currentResult?.method === m.value ? 'bg-blue-700 text-white ring-4 ring-blue-400 scale-105' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    {m.short}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {currentResult && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-5 rounded-lg border-4 text-center ${currentResult.corner === 'red' ? 'bg-red-600 border-red-800 text-white' : 'bg-blue-600 border-blue-800 text-white'}`}>
              <p className="font-display text-2xl md:text-3xl font-black tracking-wider">🏆 {currentResult.corner === 'red' ? 'RED' : 'BLUE'} CORNER WINS BY {resultLabel?.toUpperCase()}!</p>
              <p className="text-sm mt-2 opacity-90">Winner: {currentResult.corner === 'red' ? selectedMatchDetail.player1?.full_name : selectedMatchDetail.player2?.full_name}</p>
            </motion.div>
          )}

          {/* KO / Walkover */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'}`}>
              <h3 className="font-display font-bold mb-3 text-orange-600">🥊 Knockout Count (1-10)</h3>
              <div className="flex items-center gap-4 flex-wrap">
                <div className={`text-5xl font-black min-w-[80px] text-center ${isKnockout ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>{knockoutCount}</div>
                <button onClick={startKnockoutCount} disabled={isKnockout} className={`px-4 py-2 rounded-lg font-bold ${isKnockout ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'}`}>Start</button>
                <button onClick={stopKnockoutCount} disabled={!isKnockout} className={`px-4 py-2 rounded-lg font-bold ${!isKnockout ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}>Stop</button>
              </div>
            </div>
            <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
              <h3 className="font-display font-bold mb-3 text-yellow-600">🚶 Walkover Count (1-3)</h3>
              <div className="flex items-center gap-4 flex-wrap">
                <div className={`text-5xl font-black min-w-[80px] text-center ${isWalkover ? 'text-orange-500 animate-pulse' : 'text-gray-500'}`}>{walkoverCount}</div>
                <button onClick={startWalkoverCount} disabled={isWalkover} className={`px-4 py-2 rounded-lg font-bold ${isWalkover ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>Start</button>
                <button onClick={stopWalkoverCount} disabled={!isWalkover} className={`px-4 py-2 rounded-lg font-bold ${!isWalkover ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}>Stop</button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap justify-center pt-4 border-t border-gray-700">
            <button onClick={() => { setShowMatchDetailModal(false); setSelectedMatchDetail(null); stopTimer() }}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-display font-bold">Close</button>
            <button onClick={confirmResult} disabled={!currentResult}
              className={`px-8 py-3 rounded-lg font-display font-bold text-white ${currentResult ? 'bg-green-600 hover:bg-green-700 scale-105 animate-pulse' : 'bg-gray-500 cursor-not-allowed'}`}>
              ✅ Confirm & Save Result
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ============ RENDER DAILY OFFICIALS ============
  const renderDailyOfficials = () => {
    const grouped = { referee: officials.filter(o => o.role === 'referee'), judge: officials.filter(o => o.role === 'judge'), jury: officials.filter(o => o.role === 'jury') }
    const existingAssignments = dayOfficials.filter(d => d.date === dailyDate)
    const tournamentsWithOfficials = [...new Set(existingAssignments.map(d => d.tournament_id))]
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
        
        <div className={`rounded-xl p-6 border mb-6 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><FaCalendarAlt className="text-[#e11d48]" /> Select Date & Tournament</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Match Date <span className="text-red-500">*</span></label>
              <input type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Tournament <span className="text-red-500">*</span></label>
              <select value={dailyTournamentId} onChange={(e) => setDailyTournamentId(e.target.value)} className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`}>
                <option value="">Select Tournament</option>
                {tournaments.map(t => (<option key={t.id} value={t.id}>{t.title} {t.age_category ? `(${t.age_category})` : ''}</option>))}
              </select>
            </div>
          </div>
        </div>
        {dailyDate && dailyTournamentId && (
          <>
            {['referee', 'judge', 'jury'].map(rg => {
              const list = grouped[rg]
              const label = rg === 'referee' ? 'Referees' : rg === 'judge' ? 'Judges' : 'Jury Members'
              const roleColor = rg === 'referee' ? 'text-red-500' : rg === 'judge' ? 'text-blue-500' : 'text-green-500'
              const bgColor = rg === 'referee' ? 'bg-red-500/10' : rg === 'judge' ? 'bg-blue-500/10' : 'bg-green-500/10'
              const borderColor = rg === 'referee' ? 'border-red-500/30' : rg === 'judge' ? 'border-blue-500/30' : 'border-green-500/30'
              return (
                <div key={rg} className={`rounded-xl p-4 border mb-4 ${bgColor} ${borderColor}`}>
                  <h4 className={`font-display font-bold mb-3 ${roleColor}`}>{label} ({list.length})</h4>
                  {list.length === 0 ? (<p className={`text-sm italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No {label.toLowerCase()} added yet.</p>) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {list.map(o => {
                        const checked = selectedDayOfficialIds.includes(o.id)
                        return (
                          <label key={o.id} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${checked ? theme === 'dark' ? 'bg-[#e11d48]/20 border border-[#e11d48]' : 'bg-[#e11d48]/10 border border-[#e11d48]' : theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 border border-transparent' : 'bg-white hover:bg-gray-50 border border-transparent'}`}>
                            <input type="checkbox" checked={checked} onChange={() => toggleDayOfficial(o.id)} className="mt-1 w-4 h-4 accent-[#e11d48]" />
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{o.full_name}</p>
                              <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{o.unit || 'N/A'} {o.post ? '• ' + o.post : ''}</p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            <div className="flex flex-wrap gap-3 pt-4">
              <button onClick={handleSaveDayOfficials} disabled={dailyOfficialsSaving}
                className={`px-6 py-3 bg-[#e11d48] text-white rounded-lg font-display font-bold flex items-center gap-2 ${dailyOfficialsSaving ? 'opacity-50' : ''}`}>
                <FaSave /> {dailyOfficialsSaving ? 'Saving...' : `Save (${selectedDayOfficialIds.length} selected)`}
              </button>
              <button onClick={() => { setDailyDate(''); setDailyTournamentId(''); setSelectedDayOfficialIds([]) }}
                className={`px-6 py-3 rounded-lg font-display font-bold flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                <FaUndo /> Clear
              </button>
            </div>
          </>
        )}
        {dailyDate && tournamentsWithOfficials.length > 0 && (
          <div className={`mt-8 rounded-xl p-4 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`font-display font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>📋 Existing Assignments on {new Date(dailyDate).toLocaleDateString('en-GB')}</h4>
            {tournamentsWithOfficials.map(tid => {
              const t = tournaments.find(x => x.id === tid)
              const tOff = existingAssignments.filter(d => d.tournament_id === tid)
              return (
                <div key={tid} className="mb-3 last:mb-0">
                  <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t?.title || 'Unknown'} ({tOff.length} officials)</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {tOff.map(d => {
                      const off = officials.find(o => o.id === d.official_id)
                      const icon = d.role_for_day === 'referee' ? '⚖️' : d.role_for_day === 'judge' ? '📋' : '👥'
                      return (<span key={d.id} className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>{icon} {off?.full_name || 'N/A'}</span>)
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>
    )
  }

  // ============ RENDER R&J ASSIGNMENTS ============
  const renderRJAssignments = () => {
    const gn = (off) => off?.full_name || '—'
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <h2 className={`font-display text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>R&J Assignments ({boutOfficials.length})</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setEditingBoutOfficial(null); resetBoutOfficialForm(); setShowBoutOfficialModal(true) }}
              className="px-4 py-2 bg-[#e11d48] text-white rounded-lg font-display font-bold flex items-center gap-2"><FaPlus /> Assign Bout</button>
            <button onClick={() => setShowRJDocModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#e11d48] to-[#fbbf24] text-white rounded-lg font-display font-semibold flex items-center gap-2"><FaFilePdf /> Generate R&J PDF</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
                {['Bout', 'Date', 'Tournament', 'Fighters', 'Referee', 'J-1', 'J-2', 'J-3', 'J-4', 'J-5', 'Supervisor', 'Actions'].map((h, i) => (
                  <th key={i} className={`text-left py-3 px-2 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {boutOfficials.map((b, i) => (
                <tr key={b.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
                  <td className={`py-3 px-2 font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>#{i + 1}</td>
                  <td className={`py-3 px-2 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{b.match?.match_date ? new Date(b.match.match_date).toLocaleDateString('en-GB') : '—'}</td>
                  <td className={`py-3 px-2 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{b.match?.tournament?.title || '—'}</td>
                  <td className="py-3 px-2 text-xs">
                    <div className="text-red-500">🔴 {b.match?.player1?.full_name || '—'}</div>
                    <div className="text-blue-500">🔵 {b.match?.player2?.full_name || '—'}</div>
                  </td>
                  <td className="py-3 px-2 text-xs font-semibold text-red-500">{gn(b.referee)}</td>
                  <td className="py-3 px-2 text-xs text-blue-500">{gn(b.j1)}</td>
                  <td className="py-3 px-2 text-xs text-blue-500">{gn(b.j2)}</td>
                  <td className="py-3 px-2 text-xs text-blue-500">{gn(b.j3)}</td>
                  <td className="py-3 px-2 text-xs text-blue-500">{gn(b.j4)}</td>
                  <td className="py-3 px-2 text-xs text-blue-500">{gn(b.j5)}</td>
                  <td className={`py-3 px-2 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{gn(b.supervisor)}</td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1">
                      <button onClick={() => handleEditBoutOfficial(b)} className="p-2 bg-blue-500/20 text-blue-500 rounded-lg"><FaEdit /></button>
                      <button onClick={() => handleDeleteBoutOfficial(b.id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {boutOfficials.length === 0 && (<tr><td colSpan="12" className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No R&J assignments yet.</td></tr>)}
            </tbody>
          </table>
        </div>
      </motion.div>
    )
  }

  // ============ RENDER POINT TABLE ============
   const renderPointTable = () => {
    const standings = pointTournamentId ? calcTeamStandings(pointTournamentId) : []
    const tMedals = pointTournamentId ? medals.filter(m => m.tournament_id === pointTournamentId) : []

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
        

        <div className={`rounded-xl p-6 border mb-6 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Select Tournament <span className="text-red-500">*</span></label>
              <select value={pointTournamentId} onChange={(e) => setPointTournamentId(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`}>
                <option value="">-- Select Tournament --</option>
                {tournaments.map(t => (<option key={t.id} value={t.id}>{t.title} {t.age_category ? `(${t.age_category})` : ''}</option>))}
              </select>
            </div>
            <div>
              <button onClick={generatePointTablePDF} disabled={pointPdfGenerating || !pointTournamentId}
                className={`w-full px-6 py-2 bg-gradient-to-r from-[#e11d48] to-[#fbbf24] text-white rounded-lg font-display font-bold flex items-center justify-center gap-2 ${(pointPdfGenerating || !pointTournamentId) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {pointPdfGenerating ? (<><FaHourglassHalf className="animate-spin" /> Generating...</>) : (<><FaFilePdf /> Generate Point Table PDF</>)}
              </button>
            </div>
          </div>
        </div>

        {pointTournamentId && (
          <>
            {/* Weight-wise Medalists */}
            <div className={`rounded-xl p-4 border mb-6 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`font-display text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🥊 Weight-wise Medalists ({tMedals.length} medals assigned)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className={theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}>
                      {['Weight', '🥇 Gold (15 pts)', '🥈 Silver (10 pts)', '🥉 Bronze (5 pts)'].map((h, i) => (
                        <th key={i} className={`text-left py-2 px-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {WEIGHT_CLASSES.map(wc => {
                      const gold = tMedals.find(m => m.weight_class === wc && m.position === 1)
                      const silver = tMedals.find(m => m.weight_class === wc && m.position === 2)
                      const bronze = tMedals.find(m => m.weight_class === wc && m.position === 3)
                      if (!gold && !silver && !bronze) return null
                      return (
                        <tr key={wc} className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
                          <td className={`py-2 px-3 font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{wc} KG</td>
                          <td className="py-2 px-3">
                            {gold ? <span className="text-yellow-600 font-semibold">🥇 {gold.player?.full_name} ({gold.team_name})</span> : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="py-2 px-3">
                            {silver ? <span className="text-gray-500 font-semibold">🥈 {silver.player?.full_name} ({silver.team_name})</span> : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="py-2 px-3">
                            {bronze ? <span className="text-orange-700 font-semibold">🥉 {bronze.player?.full_name} ({bronze.team_name})</span> : <span className="text-gray-400">—</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Team Standings */}
            <div className={`mt-6 rounded-xl p-4 border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-[#e11d48]' : 'bg-gray-50 border-[#e11d48]'}`}>
              <h3 className={`font-display text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🏆 Live Point Table — {standings.length} Teams
              </h3>
              {standings.length === 0 ? (
                <p className={`text-center py-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Koi medal assign nahi hua. Result add karein (Final match ka) to auto medals aayenge.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className={theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}>
                        {['Pos', 'Team', '🥇 Gold', '🥈 Silver', '🥉 Bronze', 'Total', 'Points'].map((h, i) => (
                          <th key={i} className={`text-left py-2 px-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((t) => (
                        <tr key={t.team} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-black ${t.position === 1 ? 'bg-yellow-500 text-black' : t.position === 2 ? 'bg-gray-400 text-black' : t.position === 3 ? 'bg-orange-600 text-white' : 'bg-gray-600 text-white'}`}>{ordinal(t.position)}</span>
                          </td>
                          <td className={`py-3 px-3 font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t.team}</td>
                          <td className="py-3 px-3 font-bold text-yellow-600">{t.gold}</td>
                          <td className="py-3 px-3 font-bold text-gray-500">{t.silver}</td>
                          <td className="py-3 px-3 font-bold text-orange-700">{t.bronze}</td>
                          <td className={`py-3 px-3 font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t.total}</td>
                          <td className="py-3 px-3 font-black text-[#e11d48] text-lg">{t.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {!pointTournamentId && (
          <div className={`rounded-xl p-12 text-center border-2 border-dashed ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
            <FaMedal className="text-6xl mx-auto mb-4 text-[#e11d48] opacity-40" />
            
          </div>
        )}
      </motion.div>
    )
  }

  // ============ RENDER MATCH FORM ============
    const renderMatchForm = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      
      <form onSubmit={handleMatchSubmit} className="space-y-6">
        <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><FaFistRaised className="text-[#e11d48]" /> Match Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Tournament <span className="text-red-500">*</span></label>
              <select name="tournamentId" value={matchForm.tournamentId} onChange={handleMatchChange}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} required>
                <option value="">Select Tournament</option>
                {tournaments.map(t => (<option key={t.id} value={t.id}>{t.title} {t.age_category ? `(${t.age_category})` : ''}</option>))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Round <span className="text-red-500">*</span></label>
              <input type="number" name="round" value={matchForm.round} onChange={handleMatchChange} min="1" max="12"
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} required />
            </div>

            {/* ⚖️ WEIGHT CLASS — NEW */}
            <div className={`p-3 rounded-lg border-2 ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-300'}`}>
              <label className="block text-sm font-bold mb-2 text-yellow-600">⚖️ Weight Class <span className="text-red-500">*</span></label>
              <select name="weightClass" value={matchForm.weightClass} onChange={handleMatchChange}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} required>
                <option value="">-- Select Weight Class --</option>
                {WEIGHT_CLASSES.map(wc => (<option key={wc} value={wc}>{wc} KG</option>))}
              </select>
            </div>

            {/* 🎯 MATCH TYPE — NEW */}
            <div className={`p-3 rounded-lg border-2 ${theme === 'dark' ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-300'}`}>
              <label className="block text-sm font-bold mb-2 text-purple-600">🎯 Match Type (Auto-Medal) <span className="text-red-500">*</span></label>
              <select name="matchType" value={matchForm.matchType} onChange={handleMatchChange}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} required>
                <option value="regular">Regular Match (No Medal)</option>
                <option value="quarterfinal">Quarterfinal (No Medal)</option>
                <option value="semifinal">Semifinal (No Medal)</option>
                <option value="bronze">🥉 Bronze Match (Winner gets Bronze)</option>
                <option value="final">🏆 FINAL (Auto Gold + Silver)</option>
              </select>
  
            </div>

            <div className={`p-3 rounded-lg border-2 ${theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300'}`}>
              <label className="block text-sm font-bold mb-2 text-red-600">🔴 PLAYER 1 — RED CORNER <span className="text-red-500">*</span></label>
              <select name="player1Id" value={matchForm.player1Id} onChange={handleMatchChange}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} required>
                <option value="">-- Select RED Corner Player --</option>
                {players.filter(p => p.id !== matchForm.player2Id).map(p => (<option key={p.id} value={p.id}>{p.full_name} ({p.weight}kg) — {p.club_name || 'No Club'}</option>))}
              </select>
            </div>
            <div className={`p-3 rounded-lg border-2 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-300'}`}>
              <label className="block text-sm font-bold mb-2 text-blue-600">🔵 PLAYER 2 — BLUE CORNER <span className="text-red-500">*</span></label>
              <select name="player2Id" value={matchForm.player2Id} onChange={handleMatchChange}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} required>
                <option value="">-- Select BLUE Corner Player --</option>
                {players.filter(p => p.id !== matchForm.player1Id).map(p => (<option key={p.id} value={p.id}>{p.full_name} ({p.weight}kg) — {p.club_name || 'No Club'}</option>))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Match Date & Time <span className="text-red-500">*</span></label>
              <input type="datetime-local" name="matchDate" value={matchForm.matchDate} onChange={handleMatchChange}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} required />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Venue</label>
              <input type="text" name="venue" value={matchForm.venue} onChange={handleMatchChange} placeholder="Venue"
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
              <select name="status" value={matchForm.status} onChange={handleMatchChange}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`}>
                <option value="scheduled">Scheduled</option><option value="live">Live</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 pt-4">
          <button type="submit" disabled={loading} className={`px-6 py-3 bg-[#e11d48] text-white rounded-lg font-display font-bold flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}><FaPlus /> {loading ? 'Scheduling...' : 'Schedule Match'}</button>
          <button type="reset" onClick={() => setMatchForm({ tournamentId: '', player1Id: '', player2Id: '', round: 1, matchDate: '', venue: '', status: 'scheduled', matchType: 'regular', weightClass: '' })}
            className={`px-6 py-3 rounded-lg font-display font-bold flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}><FaUndo /> Reset</button>
        </div>
      </form>
    </motion.div>
  )

  // ============ RENDER PLAYERS DATA ============
  const renderPlayersData = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <h2 className={`font-display text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Players ({filteredPlayers.length})</h2>
        <div className="relative flex-1 sm:min-w-[250px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
              {['#', 'Name', 'CNIC', 'Weight', 'Stance', 'Medical', 'Status', 'Actions'].map((h, i) => (
                <th key={i} className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((p, i) => (
              <tr key={p.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
                <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{i + 1}</td>
                <td className={`py-3 px-3 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{p.full_name}</td>
                <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{p.cnic}</td>
                <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{p.weight} kg</td>
                <td className={`py-3 px-3 capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{p.stance}</td>
                <td className="py-3 px-3"><span className={`px-2 py-1 rounded-full text-xs ${p.clearance_status === 'passed' ? 'bg-green-500/20 text-green-500' : p.clearance_status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>{p.clearance_status}</span></td>
                <td className="py-3 px-3"><span className={`px-2 py-1 rounded-full text-xs ${p.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{p.status}</span></td>
                <td className="py-3 px-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEditPlayer(p)} className="p-2 bg-blue-500/20 text-blue-500 rounded-lg"><FaEdit /></button>
                    <button onClick={() => handleDeletePlayer(p.id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPlayers.length === 0 && (<tr><td colSpan="8" className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No players</td></tr>)}
          </tbody>
        </table>
      </div>
    </motion.div>
  )

  // ============ RENDER TOURNAMENTS DATA ============
  const renderTournamentsData = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <h2 className={`font-display text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Tournaments ({filteredTournaments.length})</h2>
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1 sm:min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
          </div>
          <button onClick={() => setShowDocModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#e11d48] to-[#fbbf24] text-white rounded-lg font-display font-semibold flex items-center gap-2">
            <FaFilePdf /> Generate Document
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
              {['#', 'Title', 'Age', 'Venue', 'Start', 'End', 'Status', 'Actions'].map((h, i) => (
                <th key={i} className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTournaments.map((t, i) => (
              <tr key={t.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
                <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{i + 1}</td>
                <td className={`py-3 px-3 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t.title}</td>
                <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}><span className="px-2 py-1 bg-[#fbbf24]/20 text-[#fbbf24] rounded-full text-xs font-semibold">{t.age_category || 'N/A'}</span></td>
                <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t.venue}</td>
                <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{new Date(t.start_date).toLocaleDateString()}</td>
                <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{new Date(t.end_date).toLocaleDateString()}</td>
                <td className="py-3 px-3"><span className={`px-2 py-1 rounded-full text-xs ${t.status === 'upcoming' ? 'bg-blue-500/20 text-blue-500' : t.status === 'ongoing' ? 'bg-green-500/20 text-green-500' : t.status === 'completed' ? 'bg-purple-500/20 text-purple-500' : 'bg-gray-500/20 text-gray-500'}`}>{t.status}</span></td>
                <td className="py-3 px-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEditTournament(t)} className="p-2 bg-blue-500/20 text-blue-500 rounded-lg"><FaEdit /></button>
                    <button onClick={() => handleDeleteTournament(t.id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTournaments.length === 0 && (<tr><td colSpan="8" className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No tournaments</td></tr>)}
          </tbody>
        </table>
      </div>
    </motion.div>
  )

  // ============ RENDER MATCHES DATA ============
  const renderMatchesData = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <h2 className={`font-display text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Matches ({filteredMatches.length})</h2>
        <div className="relative flex-1 sm:min-w-[250px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead>
            <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
{['Order No', 'Tournament', 'Weight', 'Type', '🔴 RED', 'VS', '🔵 BLUE', 'R', 'Date', 'Status', 'Actions'].map((h, i) => (
                <th key={i} className={`${h === 'VS' ? 'text-center' : 'text-left'} py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredMatches.map((m, i) => (
              <tr key={m.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
                <td className={`py-3 px-3 font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{i + 1}</td>
                                <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{m.tournaments?.title || 'N/A'}</td>
                <td className={`py-3 px-3 font-bold ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>{m.weight_class || '—'} KG</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    m.match_type === 'final' ? 'bg-yellow-500 text-black' :
                    m.match_type === 'bronze' ? 'bg-orange-500 text-white' :
                    m.match_type === 'semifinal' ? 'bg-purple-500 text-white' :
                    m.match_type === 'quarterfinal' ? 'bg-blue-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {m.match_type === 'final' ? '🏆 FINAL' :
                     m.match_type === 'bronze' ? '🥉 BRONZE' :
                     m.match_type === 'semifinal' ? 'SF' :
                     m.match_type === 'quarterfinal' ? 'QF' : 'REG'}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-bold w-fit">🔴 RED</span>
                    <span className="font-medium text-red-500">{m.player1?.full_name || 'N/A'}</span>
                    <span className="text-xs text-gray-500">{m.player1?.club_name || ''}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#e11d48]">VS</td>
                <td className="py-3 px-3">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold w-fit">🔵 BLUE</span>
                    <span className="font-medium text-blue-500">{m.player2?.full_name || 'N/A'}</span>
                    <span className="text-xs text-gray-500">{m.player2?.club_name || ''}</span>
                  </div>
                </td>
                <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>R{m.round}</td>
                <td className={`py-3 px-3 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{m.match_date ? new Date(m.match_date).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
                <td className="py-3 px-3"><span className={`px-2 py-1 rounded-full text-xs ${m.status === 'scheduled' ? 'bg-blue-500/20 text-blue-500' : m.status === 'live' ? 'bg-red-500/20 text-red-500 animate-pulse' : m.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>{m.status}</span></td>
                <td className="py-3 px-3">
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => openMatchDetailModal(m)} className="p-2 bg-blue-500/20 text-blue-500 rounded-lg" title="Live"><FaClock /></button>
                    <button onClick={() => openResultModal(m)} disabled={m.status === 'completed'}
                      className={`p-2 rounded-lg ${m.status === 'completed' ? 'bg-gray-500/20 text-gray-500' : 'bg-green-500/20 text-green-500'}`}><FaMedal /></button>
                    <button onClick={() => handleEditMatch(m)} className="p-2 bg-blue-500/20 text-blue-500 rounded-lg"><FaEdit /></button>
                    <button onClick={() => handleDeleteMatch(m.id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredMatches.length === 0 && (<tr><td colSpan="11" className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No matches</td></tr>)}
          </tbody>
        </table>
      </div>
    </motion.div>
  )

  // ============ RENDER RESULTS DATA ============
  const renderResultsData = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h2 className={`font-display text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Results ({matchResults.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
              {['#', 'Match', 'Winner', 'Score', 'Method', 'Round', 'Date'].map((h, i) => (
                <th key={i} className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matchResults.map((r, i) => {
              const md = r.match || {}
              let wn = 'N/A'; let winCorner = ''
              if (r.winner_id) {
                const w = players.find(p => p.id === r.winner_id)
                wn = w?.full_name || 'N/A'
                winCorner = r.winner_id === md.player1?.id ? 'RED' : 'BLUE'
              }
              const methodLabel = RESULT_METHODS.find(m => m.value === r.method)?.label || r.method
              return (
                <tr key={r.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
                  <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{i + 1}</td>
                  <td className={`py-3 px-3 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <span className="text-red-500">🔴 {md.player1?.full_name || 'N/A'}</span> <span className="text-[#e11d48] font-bold mx-1">VS</span> <span className="text-blue-500">🔵 {md.player2?.full_name || 'N/A'}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-green-500">
                    {winCorner && <span className={`inline-block mr-1 px-1.5 py-0.5 rounded text-[9px] ${winCorner === 'RED' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>{winCorner}</span>}
                    {wn}
                  </td>
                  <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{r.score1} - {r.score2}</td>
                  <td className={`py-3 px-3 font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{methodLabel}</td>
                  <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>R{r.round || 1}</td>
                  <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'}</td>
                </tr>
              )
            })}
            {matchResults.length === 0 && (<tr><td colSpan="7" className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No results</td></tr>)}
          </tbody>
        </table>
      </div>
    </motion.div>
  )

  // ============ RENDER OFFICIALS DATA ============
  const renderOfficialsData = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <h2 className={`font-display text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Officials Master ({officials.length})</h2>
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1 sm:min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
          </div>
          <button onClick={() => { setEditingOfficial(null); resetOfficialForm(); setShowOfficialModal(true) }}
            className="px-4 py-2 bg-[#e11d48] text-white rounded-lg font-display font-semibold flex items-center gap-2"><FaPlus /> Add Official</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {['all', 'referee', 'judge', 'jury'].map(f => (
          <span key={f} className={`px-3 py-1 rounded-full text-xs ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}: {f === 'all' ? officials.length : officials.filter(o => o.role === f).length}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
              {['#', 'Name', 'Role', 'Unit', 'Post', 'Contact', 'Status', 'Actions'].map((h, i) => (
                <th key={i} className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOfficials.map((o, i) => (
              <tr key={o.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
                <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{i + 1}</td>
                <td className={`py-3 px-3 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{o.full_name}</td>
                <td className="py-3 px-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${o.role === 'referee' ? 'bg-red-500/20 text-red-500' : o.role === 'judge' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'}`}>{o.role}</span></td>
                <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{o.unit || '-'}</td>
                <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{o.post || '-'}</td>
                <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{o.contact_number || '-'}</td>
                <td className="py-3 px-3"><span className={`px-2 py-1 rounded-full text-xs ${o.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>{o.status}</span></td>
                <td className="py-3 px-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEditOfficial(o)} className="p-2 bg-blue-500/20 text-blue-500 rounded-lg"><FaEdit /></button>
                    <button onClick={() => handleDeleteOfficial(o.id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredOfficials.length === 0 && (<tr><td colSpan="8" className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No officials</td></tr>)}
          </tbody>
        </table>
      </div>
    </motion.div>
  )

  // ============ RENDER PLAYER FORM ============
  const renderPlayerForm = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <form onSubmit={handlePlayerSubmit} className="space-y-6">
        <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><FaUser className="text-[#e11d48]" /> Personal Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[['fullName', 'Full Name', 'Enter full name'], ['cnic', 'CNIC / B-Form', 'XXXXX-XXXXXXX-X']].map(([n, l, p]) => (
              <div key={n}>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{l} <span className="text-red-500">*</span></label>
                <input type="text" name={n} value={playerForm[n]} onChange={handlePlayerChange} placeholder={p}
                  className={`w-full px-4 py-2 rounded-lg border ${errors[n] ? 'border-red-500' : theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
                {errors[n] && <p className="text-red-500 text-xs mt-1">{errors[n]}</p>}
              </div>
            ))}
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Date of Birth <span className="text-red-500">*</span></label>
              <input type="date" name="dateOfBirth" value={playerForm.dateOfBirth} onChange={handlePlayerChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.dateOfBirth ? 'border-red-500' : theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Gender <span className="text-red-500">*</span></label>
              <select name="gender" value={playerForm.gender} onChange={handlePlayerChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.gender ? 'border-red-500' : theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`}>
                <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Contact <span className="text-red-500">*</span></label>
              <input type="tel" name="contactNumber" value={playerForm.contactNumber} onChange={handlePlayerChange} placeholder="03XX-XXXXXXX"
                className={`w-full px-4 py-2 rounded-lg border ${errors.contactNumber ? 'border-red-500' : theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
              {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Emergency <span className="text-red-500">*</span></label>
              <input type="tel" name="emergencyContact" value={playerForm.emergencyContact} onChange={handlePlayerChange} placeholder="03XX-XXXXXXX"
                className={`w-full px-4 py-2 rounded-lg border ${errors.emergencyContact ? 'border-red-500' : theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
              {errors.emergencyContact && <p className="text-red-500 text-xs mt-1">{errors.emergencyContact}</p>}
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><FaBoxes className="text-[#e11d48]" /> Boxing Specs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[['weight', 'Weight (kg)', '75'], ['height', 'Height (cm)', '180']].map(([n, l, p]) => (
              <div key={n}>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{l} <span className="text-red-500">*</span></label>
                <input type="number" name={n} value={playerForm[n]} onChange={handlePlayerChange} placeholder={p}
                  className={`w-full px-4 py-2 rounded-lg border ${errors[n] ? 'border-red-500' : theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
                {errors[n] && <p className="text-red-500 text-xs mt-1">{errors[n]}</p>}
              </div>
            ))}
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Stance <span className="text-red-500">*</span></label>
              <select name="stance" value={playerForm.stance} onChange={handlePlayerChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.stance ? 'border-red-500' : theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`}>
                <option value="">Select</option><option value="orthodox">Orthodox</option><option value="southpaw">Southpaw</option>
              </select>
              {errors.stance && <p className="text-red-500 text-xs mt-1">{errors.stance}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Experience <span className="text-red-500">*</span></label>
              <select name="experienceLevel" value={playerForm.experienceLevel} onChange={handlePlayerChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.experienceLevel ? 'border-red-500' : theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`}>
                <option value="">Select</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="pro">Professional</option>
              </select>
              {errors.experienceLevel && <p className="text-red-500 text-xs mt-1">{errors.experienceLevel}</p>}
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Club <span className="text-red-500">*</span></label>
              <input type="text" name="clubName" value={playerForm.clubName} onChange={handlePlayerChange} placeholder="Knockout Boxing Academy"
                className={`w-full px-4 py-2 rounded-lg border ${errors.clubName ? 'border-red-500' : theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
              {errors.clubName && <p className="text-red-500 text-xs mt-1">{errors.clubName}</p>}
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-[#e11d48]/30' : 'bg-gray-50 border-[#e11d48]/20'}`}>
          <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><FaHospital className="text-[#e11d48]" /> Medical Clearance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status <span className="text-red-500">*</span></label>
              <select name="clearanceStatus" value={playerForm.clearanceStatus} onChange={handlePlayerChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.clearanceStatus ? 'border-red-500' : theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`}>
                <option value="">Select</option><option value="passed">✅ Passed</option><option value="pending">⏳ Pending</option><option value="failed">❌ Failed</option>
              </select>
              {errors.clearanceStatus && <p className="text-red-500 text-xs mt-1">{errors.clearanceStatus}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Checkup Date <span className="text-red-500">*</span></label>
              <input type="date" name="checkupDate" value={playerForm.checkupDate} onChange={handlePlayerChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.checkupDate ? 'border-red-500' : theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
              {errors.checkupDate && <p className="text-red-500 text-xs mt-1">{errors.checkupDate}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Fit for Combat</label>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" name="fitForCombat" checked={playerForm.fitForCombat} onChange={handlePlayerChange} className="w-5 h-5 accent-[#e11d48]" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Yes</span>
              </label>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Doctor Name <span className="text-red-500">*</span></label>
              <input type="text" name="doctorName" value={playerForm.doctorName} onChange={handlePlayerChange} placeholder="Dr. John Smith"
                className={`w-full px-4 py-2 rounded-lg border ${errors.doctorName ? 'border-red-500' : theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
              {errors.doctorName && <p className="text-red-500 text-xs mt-1">{errors.doctorName}</p>}
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><FaFileMedical className="text-[#e11d48]" /> Files</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Photo <span className="text-red-500">*</span></label>
              <label className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer ${errors.photo ? 'border-red-500' : theme === 'dark' ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-white'}`}>
                <div className="flex flex-col items-center">
                  <FaImage className={`text-3xl mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{playerForm.photo ? playerForm.photo.name : 'Click to upload'}</span>
                </div>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} className="hidden" />
              </label>
              {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Certificate <span className="text-red-500">*</span></label>
              <label className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer ${errors.medicalCertificate ? 'border-red-500' : theme === 'dark' ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-white'}`}>
                <div className="flex flex-col items-center">
                  <FaFilePdf className={`text-3xl mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{playerForm.medicalCertificate ? playerForm.medicalCertificate.name : 'Click to upload'}</span>
                </div>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'medicalCertificate')} className="hidden" />
              </label>
              {errors.medicalCertificate && <p className="text-red-500 text-xs mt-1">{errors.medicalCertificate}</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <button type="submit" disabled={loading} className={`px-6 py-3 bg-[#e11d48] text-white rounded-lg font-display font-bold flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}><FaSave /> {loading ? 'Registering...' : 'Register Player'}</button>
          <button type="button" onClick={resetPlayerForm}
            className={`px-6 py-3 rounded-lg font-display font-bold flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}><FaUndo /> Reset</button>
        </div>
      </form>
    </motion.div>
  )

  // ============ RENDER TOURNAMENT FORM ============
  const renderTournamentForm = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <form onSubmit={handleTournamentSubmit} className="space-y-6">
        <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><FaTrophy className="text-[#e11d48]" /> Tournament Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={tournamentForm.title} onChange={handleTournamentChange} placeholder="Golden Gloves 2024"
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} required />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Age Category <span className="text-red-500">*</span></label>
              <select name="ageCategory" value={tournamentForm.ageCategory} onChange={handleTournamentChange}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} required>
                <option value="">Select</option>
                {ageCategoryOptions.map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Weight Classes</label>
              <input type="text" name="weightClasses" value={tournamentForm.weightClasses} onChange={handleTournamentChange} placeholder="Heavy, Middle"
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Venue <span className="text-red-500">*</span></label>
              <input type="text" name="venue" value={tournamentForm.venue} onChange={handleTournamentChange}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} required />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Start Date <span className="text-red-500">*</span></label>
              <input type="date" name="startDate" value={tournamentForm.startDate} onChange={handleTournamentChange}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} required />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>End Date <span className="text-red-500">*</span></label>
              <input type="date" name="endDate" value={tournamentForm.endDate} onChange={handleTournamentChange}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} required />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Max Players</label>
              <input type="number" name="maxPlayers" value={tournamentForm.maxPlayers} onChange={handleTournamentChange} placeholder="32"
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
              <select name="status" value={tournamentForm.status} onChange={handleTournamentChange}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white'}`}>
                <option value="draft">Draft</option><option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 pt-4">
          <button type="submit" disabled={loading} className={`px-6 py-3 bg-[#e11d48] text-white rounded-lg font-display font-bold flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}><FaPlus /> {loading ? 'Creating...' : 'Create Tournament'}</button>
          <button type="reset" onClick={() => setTournamentForm({ title: '', ageCategory: '', weightClasses: '', startDate: '', endDate: '', venue: '', maxPlayers: '', status: 'upcoming' })}
            className={`px-6 py-3 rounded-lg font-display font-bold flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}><FaUndo /> Reset</button>
        </div>
      </form>
    </motion.div>
  )

  // ============ MAIN RENDER ============
  return (
    <div className={`min-h-screen py-8 px-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`font-display text-3xl font-bold flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaUser className="text-[#e11d48]" /> Admin Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`${stat.bg} rounded-xl p-4 backdrop-blur-sm ${theme === 'dark' ? 'border border-gray-800' : 'border border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`text-2xl ${stat.color}`} />
                <span className={`text-xl font-display font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stat.value}</span>
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
          {[
            { id: 'applications', label: 'Applications', icon: FaUserClock },
            { id: 'users', label: 'Users', icon: FaUsers },
            { id: 'players-data', label: 'Players', icon: FaUserFriends },
            { id: 'tournaments-data', label: 'Tournaments', icon: FaTrophy },
            { id: 'matches-data', label: 'Matches', icon: FaFistRaised },
            { id: 'results-data', label: 'Results', icon: FaMedal },
            { id: 'officials-data', label: 'Officials List', icon: FaUserCheck },
            { id: 'daily-officials', label: 'Daily Officials', icon: FaCalendarCheck },
            { id: 'rj-assignments', label: 'R&J Assignments', icon: GiWhistle },
            { id: 'point-table', label: 'Point Table', icon: FaTable },
            { id: 'player-registration', label: 'Register Player', icon: FaUser },
            { id: 'tournament-management', label: 'Create Tournament', icon: FaPlus },
            { id: 'match-scheduling', label: 'Schedule Match', icon: FaCalendarAlt }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-t-lg font-display font-semibold transition-all whitespace-nowrap text-xs sm:text-sm ${activeTab === tab.id ? 'bg-[#e11d48] text-white shadow-lg' : theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              <tab.icon className="inline mr-1" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className={`rounded-xl shadow-xl p-4 sm:p-6 border ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <AnimatePresence mode="wait">
            {activeTab === 'applications' && (
              <motion.div key="applications" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h2 className={`font-display text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Pending Applications</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead><tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
                      {['Name', 'Email', 'Role', 'Actions'].map((h, i) => (<th key={i} className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{h}</th>))}
                    </tr></thead>
                    <tbody>
                      {applications.map(a => (
                        <tr key={a.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
                          <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{a.full_name}</td>
                          <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{a.email}</td>
                          <td className={`py-3 px-3 capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{a.role}</td>
                          <td className="py-3 px-3">
                            <div className="flex gap-2">
                              <button onClick={() => handleApplication(a.id, 'approved')} className="p-2 bg-green-500/20 text-green-500 rounded-lg"><FaCheckCircle /></button>
                              <button onClick={() => handleApplication(a.id, 'rejected')} className="p-2 bg-red-500/20 text-red-500 rounded-lg"><FaTimesCircle /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {applications.length === 0 && (<p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No pending applications</p>)}
                </div>
              </motion.div>
            )}
                        {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h2 className={`font-display text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>All Users ({users.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className={theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-200'}>
                        {['#', 'Name', 'Email', 'Role', 'Status', 'Actions'].map((h, i) => (
                          <th key={i} className={`text-left py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.id} className={theme === 'dark' ? 'border-b border-gray-800 hover:bg-gray-800/50' : 'border-b border-gray-200 hover:bg-gray-50'}>
                          <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{i + 1}</td>
                          <td className={`py-3 px-3 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{u.full_name || '—'}</td>
                          <td className={`py-3 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{u.email}</td>
                          <td className={`py-3 px-3 capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{u.role}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              u.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                              u.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-red-500/20 text-red-500'
                            }`}>{u.status}</span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditUser(u)}
                                className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors"
                                title="Edit User"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                                title="Delete User"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No users found</p>
                  )}
                </div>
              </motion.div>
            )} 

            {activeTab === 'players-data' && renderPlayersData()}
            {activeTab === 'tournaments-data' && renderTournamentsData()}
            {activeTab === 'matches-data' && renderMatchesData()}
            {activeTab === 'results-data' && renderResultsData()}
            {activeTab === 'officials-data' && renderOfficialsData()}
            {activeTab === 'daily-officials' && renderDailyOfficials()}
            {activeTab === 'rj-assignments' && renderRJAssignments()}
            {activeTab === 'point-table' && renderPointTable()}
            {activeTab === 'player-registration' && renderPlayerForm()}
            {activeTab === 'tournament-management' && renderTournamentForm()}
            {activeTab === 'match-scheduling' && renderMatchForm()}
          </AnimatePresence>
        </div>
      </div>

      {/* DOC MODAL */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-6 max-w-md w-full ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`font-display text-2xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><FaFilePdf className="text-[#e11d48]" /> Generate PDF</h2>
              <button onClick={() => { setShowDocModal(false); setDocDate('') }} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">✕</button>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Match Date <span className="text-red-500">*</span></label>
              <input type="date" value={docDate} onChange={(e) => setDocDate(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border text-lg ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} />
            </div>
            <div className="flex gap-3 pt-6">
              <button onClick={generateDayDocument} disabled={docGenerating || !docDate}
                className={`flex-1 px-6 py-3 bg-gradient-to-r from-[#e11d48] to-[#fbbf24] text-white rounded-lg font-display font-bold flex items-center justify-center gap-2 ${(docGenerating || !docDate) ? 'opacity-50' : ''}`}>
                {docGenerating ? (<><FaHourglassHalf className="animate-spin" /> Generating...</>) : (<><FaFileDownload /> Generate</>)}
              </button>
              <button onClick={() => { setShowDocModal(false); setDocDate('') }}
                className={`px-6 py-3 rounded-lg font-display font-bold ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>Cancel</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* R&J DOC MODAL */}
      {showRJDocModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-6 max-w-md w-full ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`font-display text-2xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><FaFilePdf className="text-[#e11d48]" /> R&J PDF</h2>
              <button onClick={() => { setShowRJDocModal(false); setRjDocTournamentId('') }} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">✕</button>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Tournament <span className="text-red-500">*</span></label>
              <select value={rjDocTournamentId} onChange={(e) => setRjDocTournamentId(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}>
                <option value="">-- Select Tournament --</option>
                {tournaments.map(t => (<option key={t.id} value={t.id}>{t.title} {t.age_category ? `(${t.age_category})` : ''}</option>))}
              </select>
            </div>
            <div className="flex gap-3 pt-6">
              <button onClick={generateRJDocument} disabled={rjDocGenerating || !rjDocTournamentId}
                className={`flex-1 px-6 py-3 bg-gradient-to-r from-[#e11d48] to-[#fbbf24] text-white rounded-lg font-display font-bold flex items-center justify-center gap-2 ${(rjDocGenerating || !rjDocTournamentId) ? 'opacity-50' : ''}`}>
                {rjDocGenerating ? (<><FaHourglassHalf className="animate-spin" /> Generating...</>) : (<><FaFileDownload /> Generate PDF</>)}
              </button>
              <button onClick={() => { setShowRJDocModal(false); setRjDocTournamentId('') }}
                className={`px-6 py-3 rounded-lg font-display font-bold ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>Cancel</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MATCH DETAIL MODAL */}
      {renderMatchDetailModal()}

      {/* BOUT OFFICIALS MODAL */}
      {showBoutOfficialModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`font-display text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{editingBoutOfficial ? 'Edit R&J Assignment' : 'Assign Referee & Judges'}</h2>
              <button onClick={() => { setShowBoutOfficialModal(false); setEditingBoutOfficial(null); resetBoutOfficialForm() }}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">✕</button>
            </div>
            <form onSubmit={handleBoutOfficialSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Select Bout (Match) <span className="text-red-500">*</span></label>
                <select name="match_id" value={boutOfficialForm.match_id} onChange={handleBoutOfficialChange}
                  className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required>
                  <option value="">-- Select Match --</option>
                  {matches.map(m => (<option key={m.id} value={m.id}>{m.tournaments?.title} | R{m.round} | 🔴 {m.player1?.full_name} vs 🔵 {m.player2?.full_name} | {m.match_date ? new Date(m.match_date).toLocaleDateString('en-GB') : 'No Date'}</option>))}
                </select>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                <label className="block text-sm font-bold text-red-600 mb-2">⚖️ REFEREE (Required)</label>
                <select name="referee_id" value={boutOfficialForm.referee_id} onChange={handleBoutOfficialChange}
                  className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required>
                  <option value="">-- Select Referee --</option>
                  {officials.filter(o => o.role === 'referee').map(o => (<option key={o.id} value={o.id}>{o.full_name} {o.unit ? `(${o.unit})` : ''}</option>))}
                </select>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                <label className="block text-sm font-bold text-blue-600 mb-3">📋 JUDGES (J-1 to J-5)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n}>
                      <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>J-{n}</label>
                      <select name={`judge${n}_id`} value={boutOfficialForm[`judge${n}_id`]} onChange={handleBoutOfficialChange}
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}>
                        <option value="">-- Select Judge --</option>
                        {officials.filter(o => o.role === 'judge').map(o => (<option key={o.id} value={o.id}>{o.full_name} {o.unit ? `(${o.unit})` : ''}</option>))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Supervisor (Optional)</label>
                <select name="supervisor_id" value={boutOfficialForm.supervisor_id} onChange={handleBoutOfficialChange}
                  className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}>
                  <option value="">-- Select Supervisor --</option>
                  {officials.map(o => (<option key={o.id} value={o.id}>{o.full_name} {o.unit ? `(${o.unit})` : ''} - {o.role}</option>))}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className={`px-6 py-2 bg-[#e11d48] text-white rounded-lg font-display font-bold ${loading ? 'opacity-50' : ''}`}>
                  {loading ? 'Saving...' : (editingBoutOfficial ? 'Update Assignment' : 'Save Assignment')}
                </button>
                <button type="button" onClick={() => { setShowBoutOfficialModal(false); setEditingBoutOfficial(null); resetBoutOfficialForm() }}
                  className={`px-6 py-2 rounded-lg font-display font-bold ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* EDIT PLAYER MODAL */}

      {/* EDIT USER MODAL */}
      {showUserEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-6 max-w-lg w-full ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`font-display text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit User</h2>
              <button
                onClick={() => { setShowUserEditModal(false); setEditingUser(null) }}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                <input
                  type="text"
                  value={userEditForm.full_name}
                  onChange={(e) => setUserEditForm({ ...userEditForm, full_name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email (read-only)</label>
                <input
                  type="email"
                  value={userEditForm.email}
                  disabled
                  className={`w-full px-4 py-2 rounded-lg border opacity-60 cursor-not-allowed ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
                <select
                  value={userEditForm.role}
                  onChange={(e) => setUserEditForm({ ...userEditForm, role: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}
                >
                  <option value="player">Player / Boxer</option>
                  <option value="judge">Judge</option>
                  <option value="referee">Referee</option>
                  <option value="jury">Jury Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                <select
                  value={userEditForm.status}
                  onChange={(e) => setUserEditForm({ ...userEditForm, status: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 bg-[#e11d48] text-white rounded-lg font-display font-bold hover:scale-105 transition-transform ${loading ? 'opacity-50' : ''}`}
                >
                  {loading ? 'Updating...' : 'Update User'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowUserEditModal(false); setEditingUser(null) }}
                  className={`px-6 py-2 rounded-lg font-display font-bold ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h2 className={`font-display text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Player</h2>
            <form onSubmit={handleUpdatePlayer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[['fullName', 'Full Name', 'text'], ['cnic', 'CNIC', 'text'], ['weight', 'Weight', 'number'], ['height', 'Height', 'number']].map(([k, l, t]) => (
                  <div key={k}>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{l}</label>
                    <input type={t} value={playerForm[k]} onChange={(e) => setPlayerForm({ ...playerForm, [k]: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required />
                  </div>
                ))}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Stance</label>
                  <select value={playerForm.stance} onChange={(e) => setPlayerForm({ ...playerForm, stance: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}>
                    <option value="orthodox">Orthodox</option><option value="southpaw">Southpaw</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Experience</label>
                  <select value={playerForm.experienceLevel} onChange={(e) => setPlayerForm({ ...playerForm, experienceLevel: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}>
                    <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="pro">Professional</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Clearance</label>
                  <select value={playerForm.clearanceStatus} onChange={(e) => setPlayerForm({ ...playerForm, clearanceStatus: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}>
                    <option value="passed">Passed</option><option value="pending">Pending</option><option value="failed">Failed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Club</label>
                  <input type="text" value={playerForm.clubName} onChange={(e) => setPlayerForm({ ...playerForm, clubName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className={`px-6 py-2 bg-[#e11d48] text-white rounded-lg font-display font-bold ${loading ? 'opacity-50' : ''}`}>{loading ? 'Updating...' : 'Update Player'}</button>
                <button type="button" onClick={() => { setShowEditModal(false); setEditingPlayer(null) }}
                  className={`px-6 py-2 rounded-lg font-display font-bold ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* EDIT TOURNAMENT MODAL */}
      {showTournamentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h2 className={`font-display text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Tournament</h2>
            <form onSubmit={handleUpdateTournament} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Title</label>
                  <input type="text" value={tournamentForm.title} onChange={(e) => setTournamentForm({ ...tournamentForm, title: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Age Category</label>
                  <select value={tournamentForm.ageCategory} onChange={(e) => setTournamentForm({ ...tournamentForm, ageCategory: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}>
                    <option value="">Select</option>
                    {ageCategoryOptions.map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Venue</label>
                  <input type="text" value={tournamentForm.venue} onChange={(e) => setTournamentForm({ ...tournamentForm, venue: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Start Date</label>
                  <input type="date" value={tournamentForm.startDate} onChange={(e) => setTournamentForm({ ...tournamentForm, startDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>End Date</label>
                  <input type="date" value={tournamentForm.endDate} onChange={(e) => setTournamentForm({ ...tournamentForm, endDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Max Players</label>
                  <input type="number" value={tournamentForm.maxPlayers} onChange={(e) => setTournamentForm({ ...tournamentForm, maxPlayers: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                  <select value={tournamentForm.status} onChange={(e) => setTournamentForm({ ...tournamentForm, status: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}>
                    <option value="draft">Draft</option><option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className={`px-6 py-2 bg-[#e11d48] text-white rounded-lg font-display font-bold ${loading ? 'opacity-50' : ''}`}>{loading ? 'Updating...' : 'Update'}</button>
                <button type="button" onClick={() => { setShowTournamentModal(false); setEditingTournament(null) }}
                  className={`px-6 py-2 rounded-lg font-display font-bold ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* EDIT MATCH MODAL */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h2 className={`font-display text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Match</h2>
            <form onSubmit={handleUpdateMatch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Tournament</label>
                  <select value={matchForm.tournamentId} onChange={(e) => setMatchForm({ ...matchForm, tournamentId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required>
                    <option value="">Select</option>
                    {tournaments.map(t => (<option key={t.id} value={t.id}>{t.title}</option>))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Round</label>
                  <input type="number" value={matchForm.round} onChange={(e) => setMatchForm({ ...matchForm, round: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required />
                </div>
                <div className={`p-3 rounded-lg border-2 ${theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300'}`}>
                  <label className="block text-sm font-bold mb-2 text-red-600">🔴 PLAYER 1 (RED CORNER)</label>
                  <select value={matchForm.player1Id} onChange={(e) => setMatchForm({ ...matchForm, player1Id: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required>
                    <option value="">-- Select RED Corner Player --</option>
                    {players.map(p => (<option key={p.id} value={p.id}>{p.full_name} ({p.weight}kg)</option>))}
                  </select>
                </div>
                <div className={`p-3 rounded-lg border-2 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-300'}`}>
                  <label className="block text-sm font-bold mb-2 text-blue-600">🔵 PLAYER 2 (BLUE CORNER)</label>
                  <select value={matchForm.player2Id} onChange={(e) => setMatchForm({ ...matchForm, player2Id: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required>
                    <option value="">-- Select BLUE Corner Player --</option>
                    {players.map(p => (<option key={p.id} value={p.id}>{p.full_name} ({p.weight}kg)</option>))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Match Date</label>
                  <input type="datetime-local" value={matchForm.matchDate} onChange={(e) => setMatchForm({ ...matchForm, matchDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Venue</label>
                  <input type="text" value={matchForm.venue} onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                  <select value={matchForm.status} onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}>
                    <option value="scheduled">Scheduled</option><option value="live">Live</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className={`px-6 py-2 bg-[#e11d48] text-white rounded-lg font-display font-bold ${loading ? 'opacity-50' : ''}`}>{loading ? 'Updating...' : 'Update Match'}</button>
                <button type="button" onClick={() => { setShowMatchModal(false); setEditingMatch(null) }}
                  className={`px-6 py-2 rounded-lg font-display font-bold ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ADD RESULT MODAL */}
      {showResultModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h2 className={`font-display text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add Result</h2>
            <div className="mb-4 grid grid-cols-3 gap-2 items-center">
              <div className="p-3 rounded-lg bg-red-600 text-center">
                <p className="text-xs font-bold text-white">🔴 RED</p>
                <p className="text-white font-bold text-sm truncate">{selectedMatch.player1?.full_name}</p>
              </div>
              <div className="text-center text-[#e11d48] font-display font-black text-xl">VS</div>
              <div className="p-3 rounded-lg bg-blue-600 text-center">
                <p className="text-xs font-bold text-white">🔵 BLUE</p>
                <p className="text-white font-bold text-sm truncate">{selectedMatch.player2?.full_name}</p>
              </div>
            </div>
            <form onSubmit={handleResultSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Winner <span className="text-red-500">*</span></label>
                  <select name="winnerId" value={resultForm.winnerId} onChange={handleResultChange}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required>
                    <option value="">-- Select Winner --</option>
                    <option value={selectedMatch.player1_id}>🔴 RED CORNER — {selectedMatch.player1?.full_name}</option>
                    <option value={selectedMatch.player2_id}>🔵 BLUE CORNER — {selectedMatch.player2?.full_name}</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Method</label>
                  <select name="method" value={resultForm.method} onChange={handleResultChange}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}>
                    {RESULT_METHODS.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Score 1 (RED) <span className="text-red-500">*</span></label>
                  <input type="number" name="score1" value={resultForm.score1} onChange={handleResultChange}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required min="0" />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Score 2 (BLUE) <span className="text-red-500">*</span></label>
                  <input type="number" name="score2" value={resultForm.score2} onChange={handleResultChange}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required min="0" />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Round</label>
                  <input type="number" name="round" value={resultForm.round} onChange={handleResultChange}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} min="1" max="12" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className={`px-6 py-2 bg-[#e11d48] text-white rounded-lg font-display font-bold ${loading ? 'opacity-50' : ''}`}>{loading ? 'Saving...' : 'Save Result'}</button>
                <button type="button" onClick={() => { setShowResultModal(false); setSelectedMatch(null) }}
                  className={`px-6 py-2 rounded-lg font-display font-bold ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* OFFICIALS MODAL */}
      {showOfficialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`font-display text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{editingOfficial ? 'Edit Official' : 'Add Official'}</h2>
              <button onClick={() => { setShowOfficialModal(false); setEditingOfficial(null); resetOfficialForm() }}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">✕</button>
            </div>
            <form onSubmit={handleOfficialSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Full Name <span className="text-red-500">*</span></label>
                  <input type="text" name="full_name" value={officialForm.full_name} onChange={handleOfficialChange}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Role <span className="text-red-500">*</span></label>
                  <select name="role" value={officialForm.role} onChange={handleOfficialChange}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} required>
                    <option value="referee">Referee</option><option value="judge">Judge</option><option value="jury">Jury Member</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Unit</label>
                  <input type="text" name="unit" value={officialForm.unit} onChange={handleOfficialChange} placeholder="SBA, KBBC, T.S.A"
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Post</label>
                  <input type="text" name="post" value={officialForm.post} onChange={handleOfficialChange} placeholder="Chief Referee"
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Contact</label>
                  <input type="tel" name="contact_number" value={officialForm.contact_number} onChange={handleOfficialChange} placeholder="03XX-XXXXXXX"
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                  <input type="email" name="email" value={officialForm.email} onChange={handleOfficialChange}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>CNIC</label>
                  <input type="text" name="cnic" value={officialForm.cnic} onChange={handleOfficialChange}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Experience (Years)</label>
                  <input type="number" name="experience_years" value={officialForm.experience_years} onChange={handleOfficialChange} min="0"
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                  <select name="status" value={officialForm.status} onChange={handleOfficialChange}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}>
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className={`px-6 py-2 bg-[#e11d48] text-white rounded-lg font-display font-bold ${loading ? 'opacity-50' : ''}`}>
                  {loading ? 'Saving...' : (editingOfficial ? 'Update' : 'Add Official')}
                </button>
                <button type="button" onClick={() => { setShowOfficialModal(false); setEditingOfficial(null); resetOfficialForm() }}
                  className={`px-6 py-2 rounded-lg font-display font-bold ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard