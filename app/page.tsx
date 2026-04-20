'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'home' | 'matches' | 'teams' | 'tracker' | 'leaderboard' | 'mybets'

interface Team {
  id: string
  name: string
  tag: string
  color: string
  winRate: number
  totalEarnings: string
  ranking: number
  players: string[]
  description: string
  founded: string
  region: string
}

interface Match {
  id: string
  team1: string
  team2: string
  event: string
  eventType: string
  scheduledDate: string
  status: 'upcoming' | 'live' | 'completed'
  odds: [number, number]
  prize: string
  winner?: string
}

interface Bet {
  id: string
  matchId: string
  match: string
  teamId: string
  teamName: string
  amount: number
  odds: number
  potentialWin: number
  status: 'pending' | 'won' | 'lost'
  placedAt: string
}

interface LeaderboardEntry {
  rank: number
  name: string
  fanBucks: number
  totalWins: number
  winRate: number
  isUser?: boolean
}

interface TrackerResult {
  player: string
  platform: string
  wins: number
  matches: number
  kd: string
  winRate: string
  eliminations: number
  avgKills: string
  peakRating: number
  currentRating: number
  placements: { top1: number; top3: number; top10: number }
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const TEAMS: Record<string, Team> = {
  liquid: {
    id: 'liquid', name: 'Team Liquid', tag: 'TL', color: '#009AC7',
    winRate: 72, totalEarnings: '$2,400,000', ranking: 1,
    players: ['Vivid', 'Cented', 'Chap', 'Animal'],
    description: 'One of the most dominant Fortnite rosters ever assembled. Known for aggressive storm-surge plays and dominant FNCS Grand Finals runs.',
    founded: '2019', region: 'NA East',
  },
  faze: {
    id: 'faze', name: 'FaZe Clan', tag: 'FaZe', color: '#FF3333',
    winRate: 68, totalEarnings: '$1,950,000', ranking: 2,
    players: ['Dubs', 'Megga', 'Mero', 'Khanada'],
    description: "FaZe Clan's Fortnite roster is stacked with mechanically elite players who thrive under grand-final pressure. Multiple FNCS podium finishes.",
    founded: '2019', region: 'NA East',
  },
  nrg: {
    id: 'nrg', name: 'NRG Esports', tag: 'NRG', color: '#F7C52E',
    winRate: 65, totalEarnings: '$1,650,000', ranking: 3,
    players: ['Ronaldo', 'Wahame', 'Slackes', 'EpikWhale'],
    description: "NRG brings star power and veteran experience to every LAN. EpikWhale's World Cup pedigree makes this roster a perennial dark-horse favourite.",
    founded: '2019', region: 'NA West',
  },
  ghost: {
    id: 'ghost', name: 'Ghost Gaming', tag: 'GHST', color: '#9B59B6',
    winRate: 61, totalEarnings: '$1,200,000', ranking: 4,
    players: ['Bini', 'Mackwood', 'Furious', 'Rojo'],
    description: 'Ghost Gaming excels in coordinated zone rotations and late-game survival. A consistent finalist across ESL and DreamHack circuits.',
    founded: '2019', region: 'NA East',
  },
  '100t': {
    id: '100t', name: '100 Thieves', tag: '100T', color: '#E8001C',
    winRate: 58, totalEarnings: '$980,000', ranking: 5,
    players: ['Ceice', 'Kreo', 'Bucke', 'Trayz'],
    description: '100 Thieves combines elite game-sense with high-placement optimization. Ceice and Kreo are among the smartest strategic players in NA.',
    founded: '2019', region: 'NA East',
  },
  sentinels: {
    id: 'sentinels', name: 'Sentinels', tag: 'SEN', color: '#FF6B35',
    winRate: 55, totalEarnings: '$850,000', ranking: 6,
    players: ['Bugha', 'Commandment', 'Arkhram', 'Aspect'],
    description: 'Home of Fortnite World Cup champion Bugha. Sentinels are always dangerous at LAN events and capable of beating any team on their best day.',
    founded: '2020', region: 'NA East',
  },
}

const MATCHES: Match[] = [
  {
    id: 'm1', team1: 'liquid', team2: 'faze',
    event: 'FNCS Chapter 5 Season 4 Grand Finals', eventType: 'Grand Finals',
    scheduledDate: 'LIVE NOW', status: 'live',
    odds: [1.75, 2.15], prize: '$250,000',
  },
  {
    id: 'm2', team1: 'nrg', team2: '100t',
    event: 'DreamHack Pro Series 2024', eventType: 'Semi Finals',
    scheduledDate: 'Tomorrow, 6 PM EST', status: 'upcoming',
    odds: [1.90, 1.95], prize: '$100,000',
  },
  {
    id: 'm3', team1: 'ghost', team2: 'sentinels',
    event: 'ESL Katowice Invitational', eventType: 'Quarter Finals',
    scheduledDate: 'Apr 22 · 2 PM EST', status: 'upcoming',
    odds: [2.30, 1.65], prize: '$75,000',
  },
  {
    id: 'm4', team1: 'liquid', team2: 'nrg',
    event: 'Twitch Rivals Fortnite Showdown', eventType: 'Finals',
    scheduledDate: 'Apr 23 · 8 PM EST', status: 'upcoming',
    odds: [1.60, 2.40], prize: '$50,000',
  },
  {
    id: 'm5', team1: 'faze', team2: 'sentinels',
    event: 'FNCS Chapter 5 Week 3', eventType: 'Week Finals',
    scheduledDate: 'Apr 15 · Completed', status: 'completed',
    odds: [1.80, 2.05], prize: '$120,000', winner: 'sentinels',
  },
]

const STATIC_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'ProBetter99',     fanBucks: 15420, totalWins: 47, winRate: 78 },
  { rank: 2, name: 'FNmaster_X',      fanBucks: 12850, totalWins: 38, winRate: 72 },
  { rank: 3, name: 'SoloKing2024',    fanBucks: 11230, totalWins: 35, winRate: 69 },
  { rank: 4, name: 'BattleRoyalePro', fanBucks: 9870,  totalWins: 31, winRate: 65 },
  { rank: 5, name: 'VictoryRoyale',   fanBucks: 8540,  totalWins: 27, winRate: 61 },
  { rank: 6, name: 'StormSurge99',    fanBucks: 7230,  totalWins: 24, winRate: 58 },
  { rank: 7, name: 'HighGrounder',    fanBucks: 6180,  totalWins: 21, winRate: 55 },
  { rank: 8, name: 'BoxFighter88',    fanBucks: 5420,  totalWins: 18, winRate: 52 },
  { rank: 9, name: 'ZonePuller',      fanBucks: 4350,  totalWins: 15, winRate: 48 },
  { rank: 10, name: 'BushCamper',     fanBucks: 3280,  totalWins: 11, winRate: 42 },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [fanBucks, setFanBucks] = useState(1000)
  const [bets, setBets] = useState<Bet[]>([])
  const [bettingMatch, setBettingMatch] = useState<string | null>(null)
  const [bettingTeam, setBettingTeam] = useState<string | null>(null)
  const [betAmount, setBetAmount] = useState('')
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [trackerSearch, setTrackerSearch] = useState('')
  const [trackerResult, setTrackerResult] = useState<TrackerResult | null>(null)
  const [trackerLoading, setTrackerLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const savedFB = localStorage.getItem('fb_fanbucks')
    const savedBets = localStorage.getItem('fb_bets')
    if (savedFB) setFanBucks(parseInt(savedFB, 10))
    if (savedBets) { try { setBets(JSON.parse(savedBets)) } catch {} }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('fb_fanbucks', String(fanBucks))
  }, [fanBucks, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('fb_bets', JSON.stringify(bets))
  }, [bets, hydrated])

  const notify = (msg: string, type: 'success' | 'error' | 'info') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const placeBet = () => {
    if (!bettingMatch || !bettingTeam) return
    const amount = parseInt(betAmount, 10)
    if (!amount || amount < 10) { notify('Minimum bet is 10 FanBucks', 'error'); return }
    if (amount > fanBucks) { notify('Insufficient FanBucks!', 'error'); return }

    const match = MATCHES.find(m => m.id === bettingMatch)!
    const isTeam1 = match.team1 === bettingTeam
    const odds = isTeam1 ? match.odds[0] : match.odds[1]
    const team = TEAMS[bettingTeam]

    const newBet: Bet = {
      id: Date.now().toString(),
      matchId: bettingMatch,
      match: `${TEAMS[match.team1].name} vs ${TEAMS[match.team2].name}`,
      teamId: bettingTeam,
      teamName: team.name,
      amount,
      odds,
      potentialWin: Math.floor(amount * odds),
      status: 'pending',
      placedAt: new Date().toLocaleString(),
    }

    setFanBucks(prev => prev - amount)
    setBets(prev => [newBet, ...prev])
    setBettingMatch(null)
    setBettingTeam(null)
    setBetAmount('')
    notify(`Bet placed! ${amount} FanBucks on ${team.name}`, 'success')
  }

  const simulateResult = (betId: string) => {
    const bet = bets.find(b => b.id === betId)
    if (!bet || bet.status !== 'pending') return
    const won = Math.random() > 0.45
    setBets(prev => prev.map(b => b.id === betId ? { ...b, status: won ? 'won' : 'lost' } : b))
    if (won) {
      setFanBucks(prev => prev + bet.potentialWin)
      notify(`Won ${bet.potentialWin} FanBucks! 🎉`, 'success')
    } else {
      notify('Bet lost. Better luck next time!', 'error')
    }
  }

  const performSearch = useCallback((term: string) => {
    if (!term.trim()) return
    setTrackerLoading(true)
    setTrackerResult(null)
    setTimeout(() => {
      const wins = Math.floor(Math.random() * 500) + 50
      const matches = wins + Math.floor(Math.random() * 2000) + 200
      setTrackerResult({
        player: term,
        platform: 'PC',
        wins,
        matches,
        kd: (Math.random() * 5 + 1).toFixed(2),
        winRate: ((wins / matches) * 100).toFixed(1),
        eliminations: Math.floor(Math.random() * 15000) + 1000,
        avgKills: (Math.random() * 7 + 1).toFixed(1),
        peakRating: Math.floor(Math.random() * 3000) + 4000,
        currentRating: Math.floor(Math.random() * 2500) + 3500,
        placements: {
          top1: wins,
          top3: wins + Math.floor(Math.random() * 300),
          top10: wins + Math.floor(Math.random() * 800),
        },
      })
      setTrackerLoading(false)
    }, 1400)
  }, [])

  const openBet = (matchId: string, teamId: string) => {
    setBettingMatch(matchId)
    setBettingTeam(teamId)
    setBetAmount('')
  }

  const getLeaderboard = (): LeaderboardEntry[] => {
    const won = bets.filter(b => b.status === 'won').length
    const resolved = bets.filter(b => b.status !== 'pending').length
    const wr = resolved > 0 ? Math.round((won / resolved) * 100) : 0
    return [
      ...STATIC_LEADERBOARD,
      { rank: 0, name: 'You', fanBucks, totalWins: won, winRate: wr, isUser: true },
    ]
      .sort((a, b) => b.fanBucks - a.fanBucks)
      .map((e, i) => ({ ...e, rank: i + 1 }))
  }

  // ─── Sub-renders ──────────────────────────────────────────────────────────

  const MatchCard = ({ match }: { match: Match }) => {
    const t1 = TEAMS[match.team1]
    const t2 = TEAMS[match.team2]
    const alreadyBet = bets.some(b => b.matchId === match.id && b.status === 'pending')

    return (
      <div className="match-card-hover bg-gray-900 border border-gray-700/60 rounded-2xl overflow-hidden hover:border-yellow-500/50">
        <div className="flex items-center justify-between bg-gray-800/60 px-4 py-2.5">
          <div className="min-w-0">
            <span className="text-yellow-400 font-bold text-xs truncate block">{match.event}</span>
            <span className="text-gray-500 text-xs">{match.eventType}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <span className="text-gray-500 text-xs">{match.prize}</span>
            {match.status === 'live' && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center">
              <div className="w-11 h-11 rounded-full mx-auto mb-2 flex items-center justify-center font-black text-xs" style={{ background: t1.color + '25', color: t1.color, border: `2px solid ${t1.color}` }}>{t1.tag}</div>
              <p className="text-white font-bold text-sm leading-tight">{t1.name}</p>
              <p className="text-gray-500 text-xs">{t1.winRate}% WR</p>
            </div>
            <div className="text-center flex-shrink-0">
              <p className="text-gray-600 font-black text-xl">VS</p>
              <p className="text-gray-600 text-[10px] mt-0.5">{match.scheduledDate}</p>
            </div>
            <div className="flex-1 text-center">
              <div className="w-11 h-11 rounded-full mx-auto mb-2 flex items-center justify-center font-black text-xs" style={{ background: t2.color + '25', color: t2.color, border: `2px solid ${t2.color}` }}>{t2.tag}</div>
              <p className="text-white font-bold text-sm leading-tight">{t2.name}</p>
              <p className="text-gray-500 text-xs">{t2.winRate}% WR</p>
            </div>
          </div>

          {match.status !== 'completed' && !alreadyBet && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={() => openBet(match.id, match.team1)} className="bg-gray-800 hover:bg-yellow-400/15 border border-gray-700 hover:border-yellow-400 text-gray-300 hover:text-yellow-400 rounded-xl py-2 px-3 text-sm font-bold transition-all">
                {t1.tag} <span className="text-yellow-400">{match.odds[0]}x</span>
              </button>
              <button onClick={() => openBet(match.id, match.team2)} className="bg-gray-800 hover:bg-yellow-400/15 border border-gray-700 hover:border-yellow-400 text-gray-300 hover:text-yellow-400 rounded-xl py-2 px-3 text-sm font-bold transition-all">
                {t2.tag} <span className="text-yellow-400">{match.odds[1]}x</span>
              </button>
            </div>
          )}
          {alreadyBet && (
            <div className="mt-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl py-2 text-center text-yellow-400 font-bold text-sm">✓ Bet Placed</div>
          )}
          {match.status === 'completed' && match.winner && (
            <div className="mt-4 bg-green-400/10 border border-green-400/30 rounded-xl py-2 text-center">
              <span className="text-gray-500 text-sm">Winner: </span>
              <span className="text-green-400 font-bold">{TEAMS[match.winner].name}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Tab: Home ────────────────────────────────────────────────────────────

  const renderHome = () => (
    <div className="space-y-8">
      {/* Hero — live match */}
      <div className="relative rounded-3xl overflow-hidden border border-blue-500/30 p-8" style={{ background: 'linear-gradient(135deg, #0c1e4a 0%, #1a0a2e 50%, #0d1117 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Crect x='18' y='0' width='4' height='40'/%3E%3Crect x='0' y='18' width='40' height='4'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full animate-pulse">● LIVE</span>
            <span className="text-blue-300 text-sm font-semibold">FNCS Chapter 5 Season 4 — Grand Finals</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-1 leading-none">
            <span style={{ color: '#009AC7' }}>TEAM LIQUID</span>
            <span className="text-gray-500 mx-3">vs</span>
            <span style={{ color: '#FF3333' }}>FAZE CLAN</span>
          </h1>
          <p className="text-yellow-400 text-xl font-bold mt-2 mb-6">🏆 $250,000 Prize Pool</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => openBet('m1', 'liquid')} className="font-black px-6 py-3 rounded-xl transition text-lg shadow-lg" style={{ background: '#009AC7', boxShadow: '0 0 20px #009AC740' }}>
              Bet Team Liquid <span className="opacity-80">1.75×</span>
            </button>
            <button onClick={() => openBet('m1', 'faze')} className="font-black px-6 py-3 rounded-xl transition text-lg shadow-lg" style={{ background: '#FF3333', boxShadow: '0 0 20px #FF333340' }}>
              Bet FaZe Clan <span className="opacity-80">2.15×</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Your FanBucks', value: fanBucks.toLocaleString(), icon: '🪙', color: 'text-yellow-400' },
          { label: 'Active Bets',   value: bets.filter(b => b.status === 'pending').length, icon: '🎯', color: 'text-blue-400' },
          { label: 'Total Wins',    value: bets.filter(b => b.status === 'won').length, icon: '🏆', color: 'text-green-400' },
          { label: 'Live Matches',  value: MATCHES.filter(m => m.status === 'live').length, icon: '⚡', color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-700/60 rounded-2xl p-4">
            <p className="text-gray-500 text-xs mb-1">{s.label}</p>
            <p className={`${s.color} text-2xl font-black`}>{s.icon} {s.value}</p>
          </div>
        ))}
      </div>

      {/* Preview: upcoming matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-white">Upcoming Matches</h2>
          <button onClick={() => setActiveTab('matches')} className="text-yellow-400 hover:text-yellow-300 text-sm font-bold transition">View all →</button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {MATCHES.filter(m => m.status === 'upcoming').slice(0, 2).map(m => <MatchCard key={m.id} match={m} />)}
        </div>
      </div>

      {/* Preview: top teams */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-white">Top Teams</h2>
          <button onClick={() => setActiveTab('teams')} className="text-yellow-400 hover:text-yellow-300 text-sm font-bold transition">All teams →</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(TEAMS).slice(0, 3).map(t => (
            <button key={t.id} onClick={() => setActiveTab('teams')} className="bg-gray-900 border border-gray-700/60 rounded-2xl p-4 hover:border-yellow-500/40 transition text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0" style={{ background: t.color + '25', color: t.color, border: `2px solid ${t.color}` }}>{t.tag}</div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.winRate}% WR · #{t.ranking}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* How FanBucks work */}
      <div className="bg-gray-900 border border-yellow-400/20 rounded-2xl p-6">
        <h3 className="text-yellow-400 font-black text-lg mb-3">🪙 How FanBucks Work</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            { step: '1', title: 'Get 1,000 FanBucks free', desc: 'Every new member starts with 1,000 FanBucks — no real money required.' },
            { step: '2', title: 'Bet on Fortnite matches', desc: 'Pick a team, choose your amount, and confirm. Higher odds = bigger potential win.' },
            { step: '3', title: 'Climb the leaderboard', desc: 'Grow your stack and compete for the top spot on the Season Leaderboard.' },
          ].map(s => (
            <div key={s.step} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 font-black text-sm flex-shrink-0">{s.step}</div>
              <div>
                <p className="text-white font-bold mb-1">{s.title}</p>
                <p className="text-gray-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ─── Tab: Matches ─────────────────────────────────────────────────────────

  const renderMatches = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white">All Matches</h2>
        <span className="text-gray-500 text-sm">{MATCHES.filter(m => m.status === 'live').length} Live · {MATCHES.filter(m => m.status === 'upcoming').length} Upcoming</span>
      </div>

      {[
        { label: 'LIVE NOW', color: 'text-red-400', dotClass: 'bg-red-400 animate-pulse', filter: 'live' as const },
        { label: 'UPCOMING', color: 'text-yellow-400', dotClass: 'bg-yellow-400', filter: 'upcoming' as const },
        { label: 'COMPLETED', color: 'text-gray-500', dotClass: 'bg-gray-500', filter: 'completed' as const },
      ].map(section => {
        const list = MATCHES.filter(m => m.status === section.filter)
        if (!list.length) return null
        return (
          <div key={section.filter}>
            <h3 className={`${section.color} font-black text-xs mb-3 flex items-center gap-2`}>
              <span className={`w-2 h-2 rounded-full ${section.dotClass} inline-block`} />
              {section.label}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {list.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>
        )
      })}
    </div>
  )

  // ─── Tab: Teams ───────────────────────────────────────────────────────────

  const renderTeams = () => (
    <div className="space-y-5">
      <h2 className="text-2xl font-black text-white">Fortnite Teams Wiki</h2>
      {Object.values(TEAMS).map(team => (
        <div key={team.id} className="bg-gray-900 border border-gray-700/60 rounded-2xl overflow-hidden hover:border-yellow-500/30 transition">
          <div style={{ background: `linear-gradient(to right, ${team.color}30, transparent)` }} className="p-px rounded-2xl">
            <div className="bg-gray-900 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0" style={{ background: team.color + '20', color: team.color, border: `2px solid ${team.color}` }}>
                  {team.tag}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-white font-black text-xl">{team.name}</h3>
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{team.region}</span>
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">Est. {team.founded}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: team.color + '20', color: team.color }}>Rank #{team.ranking}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{team.description}</p>
                  <div className="mb-3">
                    <p className="text-gray-600 text-xs mb-1.5">ACTIVE ROSTER</p>
                    <div className="flex flex-wrap gap-2">
                      {team.players.map(p => <span key={p} className="bg-gray-800 text-white text-sm px-3 py-1 rounded-lg font-medium">{p}</span>)}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div><p className="text-gray-600 text-xs">WIN RATE</p><p className="text-white font-bold">{team.winRate}%</p></div>
                    <div><p className="text-gray-600 text-xs">EARNINGS</p><p className="text-green-400 font-bold">{team.totalEarnings}</p></div>
                    <div><p className="text-gray-600 text-xs">GLOBAL RANK</p><p className="text-yellow-400 font-bold">#{team.ranking}</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // ─── Tab: Tracker ─────────────────────────────────────────────────────────

  const renderTracker = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white">Fortnite Player Tracker</h2>
        <p className="text-gray-500 text-sm">Look up any player's stats to inform your bets</p>
      </div>

      {/* Search tool */}
      <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={trackerSearch}
            onChange={e => setTrackerSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { performSearch(trackerSearch) } }}
            placeholder="Enter Epic Games username…"
            className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-3 focus:border-yellow-400 outline-none text-sm"
          />
          <button
            onClick={() => performSearch(trackerSearch)}
            disabled={trackerLoading}
            className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 text-black font-black px-6 py-3 rounded-xl transition"
          >
            {trackerLoading ? '…' : 'Search'}
          </button>
        </div>
        <p className="text-gray-700 text-xs mt-2">Try: Bugha · Vivid · Cented · Dubs · EpikWhale</p>
      </div>

      {/* Pro quick-links */}
      <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-5">
        <p className="text-gray-500 text-xs font-bold mb-3">QUICK LOOKUP — PRO PLAYERS</p>
        <div className="flex flex-wrap gap-2">
          {['Bugha', 'Vivid', 'Cented', 'Dubs', 'Mero', 'EpikWhale', 'Ronaldo', 'Commandment', 'Bini', 'Kreo'].map(p => (
            <button key={p} onClick={() => { setTrackerSearch(p); performSearch(p) }} className="bg-gray-800 hover:bg-yellow-400/15 hover:text-yellow-400 text-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition">
              {p}
            </button>
          ))}
        </div>
      </div>

      {trackerLoading && (
        <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3 animate-spin inline-block">⟳</div>
          <p className="text-gray-400">Fetching player data…</p>
        </div>
      )}

      {trackerResult && !trackerLoading && (
        <div className="bg-gray-900 border border-yellow-400/30 rounded-2xl overflow-hidden animate-slide-in">
          <div className="p-5 border-b border-gray-700/60" style={{ background: 'linear-gradient(to right, rgba(232,181,25,0.08), transparent)' }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-yellow-400/15 border-2 border-yellow-400/50 flex items-center justify-center text-2xl font-black text-yellow-400">
                {trackerResult.player[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-white font-black text-2xl">{trackerResult.player}</h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">{trackerResult.platform}</span>
                  <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">Rating {trackerResult.currentRating}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Wins',         value: trackerResult.wins.toLocaleString(),         color: 'text-yellow-400', icon: '🏆' },
              { label: 'Win Rate',     value: `${trackerResult.winRate}%`,                 color: 'text-green-400',  icon: '📈' },
              { label: 'K/D',          value: trackerResult.kd,                            color: 'text-blue-400',   icon: '⚔️' },
              { label: 'Matches',      value: trackerResult.matches.toLocaleString(),       color: 'text-purple-400', icon: '🎮' },
              { label: 'Eliminations', value: trackerResult.eliminations.toLocaleString(), color: 'text-red-400',    icon: '💀' },
              { label: 'Avg Kills',    value: trackerResult.avgKills,                      color: 'text-orange-400', icon: '🎯' },
              { label: 'Peak Rating',  value: trackerResult.peakRating.toLocaleString(),   color: 'text-yellow-400', icon: '⭐' },
              { label: 'Top 3',        value: trackerResult.placements.top3.toLocaleString(), color: 'text-cyan-400', icon: '🥉' },
            ].map(s => (
              <div key={s.label} className="bg-gray-800 rounded-xl p-3">
                <p className="text-gray-500 text-xs">{s.icon} {s.label}</p>
                <p className={`${s.color} text-xl font-black mt-1`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="px-5 pb-5">
            <p className="text-gray-600 text-xs font-bold mb-3">PLACEMENT BREAKDOWN</p>
            {[
              { label: '#1 Victory Royale', count: trackerResult.placements.top1,  color: 'bg-yellow-400' },
              { label: 'Top 3',            count: trackerResult.placements.top3,  color: 'bg-blue-400' },
              { label: 'Top 10',           count: trackerResult.placements.top10, color: 'bg-green-400' },
            ].map(row => (
              <div key={row.label} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{row.label}</span>
                  <span className="text-white font-bold">{row.count.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${row.color} rounded-full`} style={{ width: `${(row.count / trackerResult.placements.top10) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // ─── Tab: Leaderboard ────────────────────────────────────────────────────

  const renderLeaderboard = () => {
    const lb = getLeaderboard()
    const medals = ['🥇', '🥈', '🥉']
    const podiumColors = ['border-yellow-400 bg-yellow-400/10', 'border-gray-400 bg-gray-400/10', 'border-orange-400 bg-orange-400/10']
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">FanBucks Leaderboard</h2>
          <span className="text-gray-500 text-sm">Season 4</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {lb.slice(0, 3).map((e, i) => (
            <div key={e.name} className={`border rounded-2xl p-4 text-center ${podiumColors[i]} ${e.isUser ? 'ring-2 ring-blue-400' : ''}`}>
              <div className="text-3xl mb-2">{medals[i]}</div>
              <p className={`font-black text-sm mb-1 ${e.isUser ? 'text-blue-400' : 'text-white'}`}>{e.name}{e.isUser ? ' (You)' : ''}</p>
              <p className="text-yellow-400 font-black text-lg">{e.fanBucks.toLocaleString()}</p>
              <p className="text-gray-500 text-xs">FanBucks</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-700/60 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-5 bg-gray-800/80 px-4 py-3 text-gray-500 text-xs font-bold">
            <span>#</span><span>PLAYER</span>
            <span className="text-right">FANBUCKS</span>
            <span className="text-right">WINS</span>
            <span className="text-right">WR</span>
          </div>
          {lb.map((e, i) => (
            <div key={e.name} className={`grid grid-cols-5 px-4 py-3 border-t border-gray-800/80 hover:bg-gray-800/30 transition ${e.isUser ? 'bg-blue-400/5 border-l-2 border-l-blue-400' : ''}`}>
              <span className={`font-bold ${i < 3 ? ['text-yellow-400','text-gray-400','text-orange-400'][i] : 'text-gray-600'}`}>#{e.rank}</span>
              <span className={`font-medium ${e.isUser ? 'text-blue-400' : 'text-white'}`}>{e.name}{e.isUser ? ' ⭐' : ''}</span>
              <span className="text-right text-yellow-400 font-bold">{e.fanBucks.toLocaleString()}</span>
              <span className="text-right text-white">{e.totalWins}</span>
              <span className="text-right text-gray-500">{e.winRate}%</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── Tab: My Bets ────────────────────────────────────────────────────────

  const renderMyBets = () => {
    const won  = bets.filter(b => b.status === 'won')
    const lost = bets.filter(b => b.status === 'lost')
    const resolved = won.length + lost.length
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">My Bets</h2>
          <div className="text-right">
            <p className="text-gray-500 text-xs">Balance</p>
            <p className="text-yellow-400 font-black text-xl">{fanBucks.toLocaleString()} FB</p>
          </div>
        </div>

        {bets.length === 0 ? (
          <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-white font-bold text-xl mb-2">No bets yet</p>
            <p className="text-gray-500 mb-5">Head to Matches to place your first bet with FanBucks!</p>
            <button onClick={() => setActiveTab('matches')} className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-6 py-3 rounded-xl transition">
              View Matches
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {bets.map(bet => (
              <div key={bet.id} className={`bg-gray-900 border rounded-2xl p-5 ${bet.status === 'won' ? 'border-green-500/40' : bet.status === 'lost' ? 'border-red-500/40' : 'border-gray-700/60'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-xs truncate mb-0.5">{bet.match}</p>
                    <p className="text-white font-bold">{bet.teamName}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      <span className="text-gray-400">Bet: <span className="text-white font-bold">{bet.amount} FB</span></span>
                      <span className="text-gray-400">Odds: <span className="text-yellow-400 font-bold">{bet.odds}×</span></span>
                      <span className="text-gray-400">Win: <span className="text-green-400 font-bold">{bet.potentialWin} FB</span></span>
                    </div>
                    <p className="text-gray-700 text-xs mt-1.5">{bet.placedAt}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {bet.status === 'pending' && (
                      <div>
                        <span className="bg-yellow-400/20 text-yellow-400 text-xs font-black px-3 py-1 rounded-full">PENDING</span>
                        <button onClick={() => simulateResult(bet.id)} className="block mt-2 text-gray-600 hover:text-gray-400 text-xs transition">
                          Simulate →
                        </button>
                      </div>
                    )}
                    {bet.status === 'won' && (
                      <div>
                        <span className="bg-green-400/20 text-green-400 text-xs font-black px-3 py-1 rounded-full">WON</span>
                        <p className="text-green-400 font-black text-lg mt-1">+{bet.potentialWin} FB</p>
                      </div>
                    )}
                    {bet.status === 'lost' && (
                      <div>
                        <span className="bg-red-400/20 text-red-400 text-xs font-black px-3 py-1 rounded-full">LOST</span>
                        <p className="text-red-400 font-black text-lg mt-1">−{bet.amount} FB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {resolved > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Wagered', value: bets.reduce((s, b) => s + b.amount, 0).toLocaleString() + ' FB', color: 'text-blue-400' },
              { label: 'Total Won',     value: won.reduce((s, b) => s + b.potentialWin, 0).toLocaleString() + ' FB', color: 'text-green-400' },
              { label: 'Win Rate',      value: Math.round((won.length / resolved) * 100) + '%', color: 'text-yellow-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-900 border border-gray-700/60 rounded-2xl p-4 text-center">
                <p className="text-gray-500 text-xs">{s.label}</p>
                <p className={`${s.color} font-black text-lg`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─── Betting Modal ────────────────────────────────────────────────────────

  const BettingModal = () => {
    if (!bettingMatch || !bettingTeam) return null
    const match = MATCHES.find(m => m.id === bettingMatch)!
    const team  = TEAMS[bettingTeam]
    const isT1  = match.team1 === bettingTeam
    const odds  = isT1 ? match.odds[0] : match.odds[1]
    const amt   = parseInt(betAmount, 10)
    const potWin = amt > 0 ? Math.floor(amt * odds) : 0

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={() => { setBettingMatch(null); setBettingTeam(null); setBetAmount('') }}>
        <div className="bg-gray-900 border border-yellow-500/40 rounded-2xl p-6 max-w-md w-full animate-slide-in" onClick={e => e.stopPropagation()}>
          <h3 className="text-2xl font-black text-yellow-400 mb-1">Place Your Bet</h3>
          <p className="text-gray-500 text-sm mb-5">{TEAMS[match.team1].name} vs {TEAMS[match.team2].name}</p>

          <div className="bg-gray-800 rounded-xl p-4 mb-4 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-xs">Betting on</p>
              <p className="text-white font-black text-lg">{team.name}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs">Odds</p>
              <p className="text-yellow-400 font-black text-2xl">{odds}×</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-gray-400 text-xs mb-1.5 block">Bet Amount (FanBucks)</label>
            <input
              type="number"
              value={betAmount}
              onChange={e => setBetAmount(e.target.value)}
              placeholder="Min. 10 FanBucks"
              autoFocus
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-3 text-lg focus:border-yellow-400 outline-none"
              min={10}
              max={fanBucks}
            />
            <div className="flex gap-2 mt-2">
              {[50, 100, 250, 500].map(p => (
                <button key={p} onClick={() => setBetAmount(String(Math.min(p, fanBucks)))} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs py-1.5 rounded-lg transition">{p}</button>
              ))}
            </div>
          </div>

          {amt > 0 && (
            <div className="bg-yellow-400/10 border border-yellow-400/25 rounded-xl p-4 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Potential win</span>
                <span className="text-yellow-400 font-black text-lg">{potWin} FB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Balance after</span>
                <span className="text-white">{(fanBucks - amt).toLocaleString()} FB</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => { setBettingMatch(null); setBettingTeam(null); setBetAmount('') }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition">
              Cancel
            </button>
            <button onClick={placeBet} className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 rounded-xl transition">
              Confirm Bet
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Nav tabs config ──────────────────────────────────────────────────────

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'home',        label: 'Home',        icon: '🏠' },
    { id: 'matches',     label: 'Matches',     icon: '⚡' },
    { id: 'teams',       label: 'Teams',       icon: '👥' },
    { id: 'tracker',     label: 'Tracker',     icon: '📊' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'mybets',      label: 'My Bets',     icon: '🎯' },
  ]

  const TAB_CONTENT: Record<Tab, () => JSX.Element> = {
    home: renderHome,
    matches: renderMatches,
    teams: renderTeams,
    tracker: renderTracker,
    leaderboard: renderLeaderboard,
    mybets: renderMyBets,
  }

  const pendingCount = bets.filter(b => b.status === 'pending').length

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen battle-bg text-white">
      {/* Notification toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 text-white px-5 py-3 rounded-xl shadow-xl font-bold text-sm animate-slide-in ${notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
          {notification.msg}
        </div>
      )}

      <BettingModal />

      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <button onClick={() => setActiveTab('home')} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-black" style={{ background: 'linear-gradient(135deg, #E8B519, #F7D875)' }}>FN</div>
              <span className="font-black text-lg leading-none">
                <span className="text-white">FortniteFandom</span>
                <span className="text-yellow-400">.wiki</span>
              </span>
            </button>

            {/* FanBucks balance */}
            <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/25 rounded-xl px-3 py-2 glow-gold">
              <span className="text-lg">🪙</span>
              <div>
                <p className="text-gray-500 text-[10px] leading-none">FanBucks</p>
                <p className="text-yellow-400 font-black text-base leading-none">{fanBucks.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Tab nav */}
          <div className="flex overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.id === 'mybets' && pendingCount > 0 && (
                  <span className="bg-yellow-400 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {TAB_CONTENT[activeTab]()}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-black" style={{ background: 'linear-gradient(135deg, #E8B519, #F7D875)' }}>FN</div>
            <span className="font-black text-sm"><span className="text-white">FortniteFandom</span><span className="text-yellow-400">.wiki</span></span>
          </div>
          <p className="text-gray-700 text-xs text-center">
            FanBucks are a virtual currency for entertainment only — no real money involved. Not affiliated with Epic Games or Fortnite.
          </p>
        </div>
      </footer>
    </main>
  )
}
