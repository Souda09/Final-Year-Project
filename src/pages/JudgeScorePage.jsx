// import React, { useEffect, useState } from 'react'
// import { useParams } from 'react-router-dom'
// import { motion } from 'framer-motion'
// import { supabase } from '../lib/supabase'
// import useStore from '../store/useStore'
// import { FaSave, FaCheckCircle, FaHourglassHalf, FaFistRaised } from 'react-icons/fa'
// import toast from 'react-hot-toast'

// const ROUNDS = [1, 2, 3]

// const JudgeScorePage = () => {
//   const { token } = useParams()
//   const { theme } = useStore()
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [linkData, setLinkData] = useState(null)
//   const [matchData, setMatchData] = useState(null)
//   const [judgeData, setJudgeData] = useState(null)
//   const [existingScores, setExistingScores] = useState({})
//   const [scores, setScores] = useState({
//     1: { red: 10, blue: 9 },
//     2: { red: 10, blue: 9 },
//     3: { red: 10, blue: 9 },
//   })
//   const [savedRounds, setSavedRounds] = useState({ 1: false, 2: false, 3: false })
//   const [saving, setSaving] = useState(false)

//   useEffect(() => {
//     loadLink()
//   }, [token])

//   const loadLink = async () => {
//     try {
//       // 1. Find link by token
//       const { data: link, error: lErr } = await supabase
//         .from('judge_links')
//         .select('*')
//         .eq('token', token)
//         .single()

//       if (lErr || !link) {
//         setError('Invalid or expired link. Please contact admin.')
//         setLoading(false)
//         return
//       }
//       setLinkData(link)

//       // 2. Load match
//       const { data: match, error: mErr } = await supabase
//         .from('matches')
//         .select(`*, 
//           tournament:tournaments(title, age_category, venue),
//           player1:players!matches_player1_id_fkey(full_name, club_name),
//           player2:players!matches_player2_id_fkey(full_name, club_name)
//         `)
//         .eq('id', link.match_id)
//         .single()

//       if (mErr) throw mErr
//       setMatchData(match)

//       // 3. Load judge
//       const { data: judge, error: jErr } = await supabase
//         .from('officials')
//         .select('full_name, unit, post')
//         .eq('id', link.judge_id)
//         .single()

//       if (!jErr && judge) setJudgeData(judge)

//       // 4. Load existing scores by this judge for this match
//       const { data: existing } = await supabase
//         .from('match_judge_scores')
//         .select('*')
//         .eq('match_id', link.match_id)
//         .eq('judge_id', link.judge_id)

//       if (existing && existing.length > 0) {
//         const newScores = { ...scores }
//         const newSaved = { ...savedRounds }
//         existing.forEach(e => {
//           newScores[e.round] = { red: e.red_score, blue: e.blue_score }
//           newSaved[e.round] = true
//         })
//         setScores(newScores)
//         setSavedRounds(newSaved)
//         setExistingScores(newSaved)
//       }
//     } catch (e) {
//       console.error(e)
//       setError('Error loading. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const updateScore = (round, field, value) => {
//     let v = parseInt(value) || 0
//     if (v < 0) v = 0
//     if (v > 10) v = 10
//     setScores(prev => ({
//       ...prev,
//       [round]: { ...prev[round], [field]: v }
//     }))
//   }

//   const saveRound = async (round) => {
//     setSaving(true)
//     try {
//       // Delete existing
//       await supabase.from('match_judge_scores')
//         .delete()
//         .eq('match_id', linkData.match_id)
//         .eq('judge_id', linkData.judge_id)
//         .eq('round', round)

//       // Insert new
//       const { error } = await supabase.from('match_judge_scores').insert([{
//         match_id: linkData.match_id,
//         judge_id: linkData.judge_id,
//         round: round,
//         red_score: scores[round].red,
//         blue_score: scores[round].blue,
//       }])
//       if (error) throw error

//       setSavedRounds(prev => ({ ...prev, [round]: true }))
//       toast.success(`✅ Round ${round} saved!`)
//     } catch (e) {
//       toast.error('Error: ' + e.message)
//     } finally { setSaving(false) }
//   }

//   const isRoundLocked = (round) => {
//     if (round === 1) return false
//     // Round 2 open only after Round 1 saved, etc.
//     return !savedRounds[round - 1]
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-[#e11d48] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p>Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
//         <div className="text-center p-8 glass rounded-2xl max-w-md">
//           <h1 className="font-display text-3xl font-bold text-red-500 mb-4">❌ Access Error</h1>
//           <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className={`min-h-screen py-8 px-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
//       <div className="max-w-3xl mx-auto">
//         {/* Header */}
//         <div className="mb-6 text-center">
//           <div className="flex items-center justify-center gap-3 mb-3">
//             <FaFistRaised className="text-4xl text-[#e11d48]" />
//             <h1 className="font-display text-3xl font-bold gradient-text">Judge Scoring Panel</h1>
//           </div>
//           <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
//             Judge: <b className="text-[#e11d48]">{judgeData?.full_name || 'N/A'}</b>
//             {judgeData?.unit && <span> ({judgeData.unit})</span>}
//           </p>
//         </div>

//         {/* Match Info */}
//         <div className={`glass rounded-2xl p-6 mb-6 ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
//           <div className="grid grid-cols-3 gap-3 items-center mb-4">
//             <div className="p-3 rounded-lg bg-red-600 text-center">
//               <p className="text-xs font-bold text-white mb-1">🔴 RED CORNER</p>
//               <p className="text-white font-bold">{matchData?.player1?.full_name || 'TBD'}</p>
//               <p className="text-xs text-white/70">{matchData?.player1?.club_name || ''}</p>
//             </div>
//             <div className="text-center font-display font-black text-2xl text-[#e11d48]">VS</div>
//             <div className="p-3 rounded-lg bg-blue-600 text-center">
//               <p className="text-xs font-bold text-white mb-1">🔵 BLUE CORNER</p>
//               <p className="text-white font-bold">{matchData?.player2?.full_name || 'TBD'}</p>
//               <p className="text-xs text-white/70">{matchData?.player2?.club_name || ''}</p>
//             </div>
//           </div>
//           <div className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
//             <p>{matchData?.tournament?.title} • {matchData?.tournament?.age_category}</p>
//             <p>{matchData?.weight_class && `${matchData.weight_class} KG`} • {matchData?.match_date ? new Date(matchData.match_date).toLocaleDateString('en-GB') : ''}</p>
//           </div>
//         </div>

//         {/* Round Scoring */}
//         {ROUNDS.map(round => {
//           const locked = isRoundLocked(round)
//           const saved = savedRounds[round]
//           return (
//             <motion.div
//               key={round}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className={`mb-4 p-5 rounded-2xl border-2 ${
//                 saved
//                   ? theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-400'
//                   : locked
//                     ? theme === 'dark' ? 'bg-gray-800/40 border-gray-700 opacity-50' : 'bg-gray-100 border-gray-300 opacity-50'
//                     : theme === 'dark' ? 'bg-[#e11d48]/10 border-[#e11d48]' : 'bg-[#e11d48]/5 border-[#e11d48]'
//               }`}
//             >
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className={`font-display font-bold text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   Round {round}
//                 </h3>
//                 {saved && (
//                   <span className="flex items-center gap-1 text-green-500 font-bold text-sm">
//                     <FaCheckCircle /> Saved
//                   </span>
//                 )}
//                 {locked && (
//                   <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                     (Save Round {round - 1} first)
//                   </span>
//                 )}
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-bold mb-2 text-red-500 text-center">🔴 RED Corner</label>
//                   <input
//                     type="number"
//                     min="0"
                   
//                     value={scores[round].red}
//                     onChange={(e) => updateScore(round, 'red', e.target.value)}
//                     disabled={locked}
//                     className={`w-full px-4 py-3 text-center rounded-lg border-2 font-bold text-2xl text-red-500 ${
//                       theme === 'dark' ? 'border-red-700 bg-gray-900' : 'border-red-300 bg-white'
//                     } ${locked ? 'cursor-not-allowed' : ''}`}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-bold mb-2 text-blue-500 text-center">🔵 BLUE Corner</label>
//                   <input
//                     type="number"
//                     min="0"
                    
//                     value={scores[round].blue}
//                     onChange={(e) => updateScore(round, 'blue', e.target.value)}
//                     disabled={locked}
//                     className={`w-full px-4 py-3 text-center rounded-lg border-2 font-bold text-2xl text-blue-500 ${
//                       theme === 'dark' ? 'border-blue-700 bg-gray-900' : 'border-blue-300 bg-white'
//                     } ${locked ? 'cursor-not-allowed' : ''}`}
//                   />
//                 </div>
//               </div>

//               <button
//                 onClick={() => saveRound(round)}
//                 disabled={locked || saving}
//                 className={`w-full mt-4 py-3 rounded-lg font-display font-bold flex items-center justify-center gap-2 text-white ${
//                   locked || saving
//                     ? 'bg-gray-500 cursor-not-allowed'
//                     : 'bg-[#e11d48] hover:bg-[#c01739] hover:scale-105 transition-transform'
//                 }`}
//               >
//                 {saving ? (
//                   <><FaHourglassHalf className="animate-spin" /> Saving...</>
//                 ) : (
//                   <><FaSave /> {saved ? `Update Round ${round}` : `Save Round ${round}`}</>
//                 )}
//               </button>
//             </motion.div>
//           )
//         })}

//         {/* Footer */}
//         <p className={`text-center text-xs mt-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
//           PunchTrack — Judge Scoring Panel
//         </p>
//       </div>
//     </div>
//   )
// }

// export default JudgeScorePage


import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import { FaSave, FaCheckCircle, FaHourglassHalf, FaFistRaised } from 'react-icons/fa'
import toast from 'react-hot-toast'

const ROUNDS = [1, 2, 3]

const JudgeScorePage = () => {
  const { token } = useParams()
  const { theme } = useStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [linkData, setLinkData] = useState(null)
  const [matchData, setMatchData] = useState(null)
  const [judgeData, setJudgeData] = useState(null)
  const [scores, setScores] = useState({
    1: { red: 10, blue: 9 },
    2: { red: 10, blue: 9 },
    3: { red: 10, blue: 9 },
  })
  const [savedRounds, setSavedRounds] = useState({ 1: false, 2: false, 3: false })
  const [saving, setSaving] = useState(false)
  const [activeCorner, setActiveCorner] = useState({ 1: null, 2: null, 3: null })

  useEffect(() => { loadLink() }, [token])

  const loadLink = async () => {
    try {
      const { data: link, error: lErr } = await supabase
        .from('judge_links').select('*').eq('token', token).single()
      if (lErr || !link) { setError('Invalid or expired link.'); setLoading(false); return }
      setLinkData(link)

      const { data: match, error: mErr } = await supabase
        .from('matches')
        .select(`*, tournament:tournaments(title, age_category, venue),
          player1:players!matches_player1_id_fkey(full_name, club_name),
          player2:players!matches_player2_id_fkey(full_name, club_name)`)
        .eq('id', link.match_id).single()
      if (mErr) throw mErr
      setMatchData(match)

      const { data: judge } = await supabase
        .from('officials').select('full_name, unit, post').eq('id', link.judge_id).single()
      if (judge) setJudgeData(judge)

      const { data: existing } = await supabase
        .from('match_judge_scores').select('*')
        .eq('match_id', link.match_id).eq('judge_id', link.judge_id)

      if (existing && existing.length > 0) {
        const newScores = { ...scores }
        const newSaved = { ...savedRounds }
        existing.forEach(e => {
          newScores[e.round] = { red: e.red_score, blue: e.blue_score }
          newSaved[e.round] = true
        })
        setScores(newScores); setSavedRounds(newSaved)
      }
    } catch (e) {
      console.error(e); setError('Error loading.')
    } finally { setLoading(false) }
  }

  const updateScore = (round, field, value) => {
    let v = parseInt(value) || 0
    if (v < 0) v = 0
    // ✅ NO UPPER LIMIT
    setScores(prev => ({ ...prev, [round]: { ...prev[round], [field]: v } }))
  }

  const bumpScore = (round, field, delta) => {
    const current = scores[round][field] || 0
    const next = Math.max(0, current + delta)
    setScores(prev => ({ ...prev, [round]: { ...prev[round], [field]: next } }))
  }

  const saveRound = async (round) => {
    setSaving(true)
    try {
      await supabase.from('match_judge_scores').delete()
        .eq('match_id', linkData.match_id)
        .eq('judge_id', linkData.judge_id)
        .eq('round', round)
      const { error } = await supabase.from('match_judge_scores').insert([{
        match_id: linkData.match_id, judge_id: linkData.judge_id,
        round: round, red_score: scores[round].red, blue_score: scores[round].blue,
      }])
      if (error) throw error
      setSavedRounds(prev => ({ ...prev, [round]: true }))
      toast.success(`✅ Round ${round} saved!`)
    } catch (e) { toast.error('Error: ' + e.message) }
    finally { setSaving(false) }
  }

  const isRoundLocked = (round) => round === 1 ? false : !savedRounds[round - 1]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-[#e11d48] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (error) return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="text-center p-8 max-w-md">
        <h1 className="font-display text-3xl font-bold text-red-500 mb-4">❌ Access Error</h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen py-8 px-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-3xl mx-auto">

        {/* HEADER — Judge Name */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <FaFistRaised className="text-4xl text-[#e11d48]" />
            <h1 className="font-display text-3xl font-bold">Judge Scoring</h1>
          </div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Judge: <b className="text-[#e11d48] text-xl">{judgeData?.full_name || 'N/A'}</b>
            {judgeData?.unit && <span className="text-sm"> ({judgeData.unit})</span>}
          </p>
        </div>

        {/* MATCH INFO — RED / BLUE buttons with player names + colors */}
        <div className={`rounded-2xl p-5 mb-6 ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-red-600 text-white text-center shadow-lg">
              <p className="text-xs font-bold mb-1 tracking-wider">🔴 RED CORNER</p>
              <p className="font-display font-black text-lg truncate">{matchData?.player1?.full_name || 'TBD'}</p>
              <p className="text-xs opacity-80 truncate">{matchData?.player1?.club_name || ''}</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-600 text-white text-center shadow-lg">
              <p className="text-xs font-bold mb-1 tracking-wider">🔵 BLUE CORNER</p>
              <p className="font-display font-black text-lg truncate">{matchData?.player2?.full_name || 'TBD'}</p>
              <p className="text-xs opacity-80 truncate">{matchData?.player2?.club_name || ''}</p>
            </div>
          </div>
          <div className={`text-center text-sm mt-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>{matchData?.tournament?.title} • {matchData?.tournament?.age_category}</p>
            <p>{matchData?.weight_class && `${matchData.weight_class} KG`} • {matchData?.match_date ? new Date(matchData.match_date).toLocaleDateString('en-GB') : ''}</p>
          </div>
        </div>

        {/* ROUND SCORING */}
        {ROUNDS.map(round => {
          const locked = isRoundLocked(round)
          const saved = savedRounds[round]
          return (
            <motion.div key={round} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-5 rounded-2xl border-2 ${
                saved ? theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-400'
                : locked ? theme === 'dark' ? 'bg-gray-800/40 border-gray-700 opacity-50' : 'bg-gray-100 border-gray-300 opacity-50'
                : theme === 'dark' ? 'bg-[#e11d48]/10 border-[#e11d48]' : 'bg-[#e11d48]/5 border-[#e11d48]'
              }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-display font-bold text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Round {round}</h3>
                {saved && <span className="flex items-center gap-1 text-green-500 font-bold text-sm"><FaCheckCircle /> Saved</span>}
                {locked && <span className="text-sm text-gray-400">(Save Round {round - 1} first)</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* RED */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setActiveCorner(p => ({ ...p, [round]: 'red' }))}
                    className={`w-full py-3 rounded-xl font-display font-black text-white text-lg mb-3 transition-all ${
                      activeCorner[round] === 'red' ? 'bg-red-700 ring-4 ring-red-400 scale-105' : 'bg-red-600'
                    } ${locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
                    disabled={locked}
                  >
                    🔴 RED
                  </button>
                  <div className="flex items-center justify-center gap-2">
                    <button type="button" onClick={() => bumpScore(round, 'red', -1)} disabled={locked}
                      className="w-10 h-10 rounded-lg bg-gray-500 text-white font-bold disabled:opacity-40">−</button>
                    <input type="number" min="0" value={scores[round].red}
                      onChange={(e) => updateScore(round, 'red', e.target.value)} disabled={locked}
                      className={`w-24 px-2 py-2 text-center rounded-lg border-2 font-black text-3xl text-red-500 ${
                        theme === 'dark' ? 'border-red-700 bg-gray-900' : 'border-red-300 bg-white'
                      } ${locked ? 'cursor-not-allowed' : ''}`} />
                    <button type="button" onClick={() => bumpScore(round, 'red', 1)} disabled={locked}
                      className="w-10 h-10 rounded-lg bg-red-600 text-white font-bold disabled:opacity-40">+</button>
                  </div>
                </div>

                {/* BLUE */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setActiveCorner(p => ({ ...p, [round]: 'blue' }))}
                    className={`w-full py-3 rounded-xl font-display font-black text-white text-lg mb-3 transition-all ${
                      activeCorner[round] === 'blue' ? 'bg-blue-700 ring-4 ring-blue-400 scale-105' : 'bg-blue-600'
                    } ${locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                    disabled={locked}
                  >
                    🔵 BLUE
                  </button>
                  <div className="flex items-center justify-center gap-2">
                    <button type="button" onClick={() => bumpScore(round, 'blue', -1)} disabled={locked}
                      className="w-10 h-10 rounded-lg bg-gray-500 text-white font-bold disabled:opacity-40">−</button>
                    <input type="number" min="0" value={scores[round].blue}
                      onChange={(e) => updateScore(round, 'blue', e.target.value)} disabled={locked}
                      className={`w-24 px-2 py-2 text-center rounded-lg border-2 font-black text-3xl text-blue-500 ${
                        theme === 'dark' ? 'border-blue-700 bg-gray-900' : 'border-blue-300 bg-white'
                      } ${locked ? 'cursor-not-allowed' : ''}`} />
                    <button type="button" onClick={() => bumpScore(round, 'blue', 1)} disabled={locked}
                      className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold disabled:opacity-40">+</button>
                  </div>
                </div>
              </div>

              <button onClick={() => saveRound(round)} disabled={locked || saving}
                className={`w-full mt-4 py-3 rounded-lg font-display font-bold flex items-center justify-center gap-2 text-white ${
                  locked || saving ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#e11d48] hover:bg-[#c01739]'
                }`}>
                {saving ? <><FaHourglassHalf className="animate-spin" /> Saving...</>
                        : <><FaSave /> {saved ? `Update Round ${round}` : `Save Round ${round}`}</>}
              </button>
            </motion.div>
          )
        })}

        <p className={`text-center text-xs mt-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          PunchTrack — Judge Scoring Panel
        </p>
      </div>
    </div>
  )
}


export default JudgeScorePage