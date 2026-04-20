'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'home' | 'matches' | 'teams' | 'tracker' | 'leaderboard' | 'mybets'

interface Team {
  id: string; name: string; tag: string; color: string
  winRate: number; totalEarnings: string; ranking: number
  players: string[]; description: string; founded: string; region: string
}
interface Match {
  id: string; team1: string; team2: string; event: string; eventType: string
  scheduledDate: string; status: 'upcoming' | 'live' | 'completed'
  odds: [number, number]; prize: string; winner?: string
}
interface Bet {
  id: string; matchId: string; match: string; teamId: string; teamName: string
  amount: number; odds: number; potentialWin: number
  status: 'pending' | 'won' | 'lost'; placedAt: string
}
interface LeaderboardEntry {
  rank: number; name: string; fanBucks: number
  totalWins: number; winRate: number; isUser?: boolean
}
interface TrackerResult {
  player: string; platform: string; wins: number; matches: number
  kd: string; winRate: string; eliminations: number; avgKills: string
  peakRating: number; currentRating: number
  placements: { top1: number; top3: number; top10: number }
}

// ─── Data ────────────────────────────────────────────────────────────────────

const TEAMS: Record<string, Team> = {
  liquid:    { id:'liquid',    name:'Team Liquid',  tag:'TL',   color:'#009AC7', winRate:72, totalEarnings:'$2,400,000', ranking:1, players:['Vivid','Cented','Chap','Animal'],              description:"One of the most dominant Fortnite rosters ever assembled. Known for aggressive storm-surge plays and dominant FNCS Grand Finals runs.",  founded:'2019', region:'NA East' },
  faze:      { id:'faze',      name:'FaZe Clan',    tag:'FaZe', color:'#FF3333', winRate:68, totalEarnings:'$1,950,000', ranking:2, players:['Dubs','Megga','Mero','Khanada'],                description:"FaZe Clan's Fortnite roster features mechanically elite players who thrive under grand-final pressure. Multiple FNCS podium finishes.",   founded:'2019', region:'NA East' },
  nrg:       { id:'nrg',       name:'NRG Esports',  tag:'NRG',  color:'#F7C52E', winRate:65, totalEarnings:'$1,650,000', ranking:3, players:['Ronaldo','Wahame','Slackes','EpikWhale'],       description:"NRG brings star power and veteran experience to every LAN. EpikWhale's World Cup pedigree makes this roster a perennial dark-horse.",      founded:'2019', region:'NA West' },
  ghost:     { id:'ghost',     name:'Ghost Gaming', tag:'GHST', color:'#9B59B6', winRate:61, totalEarnings:'$1,200,000', ranking:4, players:['Bini','Mackwood','Furious','Rojo'],              description:'Ghost Gaming excels in coordinated zone rotations and late-game survival. A consistent finalist across ESL and DreamHack circuits.',       founded:'2019', region:'NA East' },
  '100t':    { id:'100t',      name:'100 Thieves',  tag:'100T', color:'#E8001C', winRate:58, totalEarnings:'$980,000',   ranking:5, players:['Ceice','Kreo','Bucke','Trayz'],                  description:'100 Thieves combines elite game-sense with high-placement optimisation. Ceice and Kreo are among the most strategic players in NA.',       founded:'2019', region:'NA East' },
  sentinels: { id:'sentinels', name:'Sentinels',    tag:'SEN',  color:'#FF6B35', winRate:55, totalEarnings:'$850,000',   ranking:6, players:['Bugha','Commandment','Arkhram','Aspect'],        description:'Home of Fortnite World Cup champion Bugha. Sentinels are always dangerous at LAN events and capable of beating any team on their day.',   founded:'2020', region:'NA East' },
}

const MATCHES: Match[] = [
  { id:'m1', team1:'liquid',    team2:'faze',      event:'FNCS Chapter 5 Season 4 Grand Finals', eventType:'Grand Finals',   scheduledDate:'LIVE NOW',            status:'live',      odds:[1.75,2.15], prize:'$250,000' },
  { id:'m2', team1:'nrg',       team2:'100t',      event:'DreamHack Pro Series 2024',            eventType:'Semi Finals',    scheduledDate:'Tomorrow · 6 PM EST', status:'upcoming',  odds:[1.90,1.95], prize:'$100,000' },
  { id:'m3', team1:'ghost',     team2:'sentinels', event:'ESL Katowice Invitational',            eventType:'Quarter Finals', scheduledDate:'Apr 22 · 2 PM EST',   status:'upcoming',  odds:[2.30,1.65], prize:'$75,000'  },
  { id:'m4', team1:'liquid',    team2:'nrg',       event:'Twitch Rivals Fortnite Showdown',      eventType:'Finals',         scheduledDate:'Apr 23 · 8 PM EST',   status:'upcoming',  odds:[1.60,2.40], prize:'$50,000'  },
  { id:'m5', team1:'faze',      team2:'sentinels', event:'FNCS Chapter 5 Week 3',               eventType:'Week Finals',    scheduledDate:'Apr 15 · Completed',  status:'completed', odds:[1.80,2.05], prize:'$120,000', winner:'sentinels' },
]

const STATIC_LB: LeaderboardEntry[] = [
  { rank:1,  name:'ProBetter99',     fanBucks:15420, totalWins:47, winRate:78 },
  { rank:2,  name:'FNmaster_X',      fanBucks:12850, totalWins:38, winRate:72 },
  { rank:3,  name:'SoloKing2024',    fanBucks:11230, totalWins:35, winRate:69 },
  { rank:4,  name:'BattleRoyalePro', fanBucks:9870,  totalWins:31, winRate:65 },
  { rank:5,  name:'VictoryRoyale',   fanBucks:8540,  totalWins:27, winRate:61 },
  { rank:6,  name:'StormSurge99',    fanBucks:7230,  totalWins:24, winRate:58 },
  { rank:7,  name:'HighGrounder',    fanBucks:6180,  totalWins:21, winRate:55 },
  { rank:8,  name:'BoxFighter88',    fanBucks:5420,  totalWins:18, winRate:52 },
  { rank:9,  name:'ZonePuller',      fanBucks:4350,  totalWins:15, winRate:48 },
  { rank:10, name:'BushCamper',      fanBucks:3280,  totalWins:11, winRate:42 },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeTab, setActiveTab]       = useState<Tab>('home')
  const [fanBucks,  setFanBucks]        = useState(1000)
  const [bets,      setBets]            = useState<Bet[]>([])
  const [bettingMatch, setBettingMatch] = useState<string | null>(null)
  const [bettingTeam,  setBettingTeam]  = useState<string | null>(null)
  const [betAmount,    setBetAmount]    = useState('')
  const [note, setNote]                 = useState<{ msg: string; ok: boolean } | null>(null)
  const [trackerSearch,  setTrackerSearch]  = useState('')
  const [trackerResult,  setTrackerResult]  = useState<TrackerResult | null>(null)
  const [trackerLoading, setTrackerLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const fb   = localStorage.getItem('fb_fanbucks')
    const bts  = localStorage.getItem('fb_bets')
    if (fb)  setFanBucks(parseInt(fb, 10))
    if (bts) { try { setBets(JSON.parse(bts)) } catch {} }
    setHydrated(true)
  }, [])
  useEffect(() => { if (hydrated) localStorage.setItem('fb_fanbucks', String(fanBucks)) }, [fanBucks, hydrated])
  useEffect(() => { if (hydrated) localStorage.setItem('fb_bets', JSON.stringify(bets)) }, [bets, hydrated])

  const notify = (msg: string, ok = true) => {
    setNote({ msg, ok })
    setTimeout(() => setNote(null), 3000)
  }

  const openBet  = (matchId: string, teamId: string) => { setBettingMatch(matchId); setBettingTeam(teamId); setBetAmount('') }
  const closeBet = () => { setBettingMatch(null); setBettingTeam(null); setBetAmount('') }

  const placeBet = () => {
    if (!bettingMatch || !bettingTeam) return
    const amt = parseInt(betAmount, 10)
    if (!amt || amt < 10)   { notify('Minimum bet is 10 FanBucks', false); return }
    if (amt > fanBucks)     { notify('Insufficient FanBucks!',      false); return }
    const match = MATCHES.find(m => m.id === bettingMatch)!
    const isT1  = match.team1 === bettingTeam
    const odds  = isT1 ? match.odds[0] : match.odds[1]
    setBets(prev => [{
      id: Date.now().toString(),
      matchId: bettingMatch,
      match: `${TEAMS[match.team1].name} vs ${TEAMS[match.team2].name}`,
      teamId: bettingTeam, teamName: TEAMS[bettingTeam].name,
      amount: amt, odds, potentialWin: Math.floor(amt * odds),
      status: 'pending', placedAt: new Date().toLocaleString(),
    }, ...prev])
    setFanBucks(p => p - amt)
    closeBet()
    notify(`Bet placed on ${TEAMS[bettingTeam].name}!`)
  }

  const simulateResult = (betId: string) => {
    const bet = bets.find(b => b.id === betId)
    if (!bet || bet.status !== 'pending') return
    const won = Math.random() > 0.45
    setBets(prev => prev.map(b => b.id === betId ? { ...b, status: won ? 'won' : 'lost' } : b))
    if (won) { setFanBucks(p => p + bet.potentialWin); notify(`Won ${bet.potentialWin} FanBucks! 🎉`) }
    else                                                notify('Bet lost. Better luck next time!', false)
  }

  const performSearch = useCallback((term: string) => {
    if (!term.trim()) return
    setTrackerLoading(true); setTrackerResult(null)
    setTimeout(() => {
      const wins = Math.floor(Math.random() * 500) + 50
      const matches = wins + Math.floor(Math.random() * 2000) + 200
      setTrackerResult({
        player: term, platform: 'PC',
        wins, matches,
        kd: (Math.random() * 5 + 1).toFixed(2),
        winRate: ((wins / matches) * 100).toFixed(1),
        eliminations: Math.floor(Math.random() * 15000) + 1000,
        avgKills: (Math.random() * 7 + 1).toFixed(1),
        peakRating: Math.floor(Math.random() * 3000) + 4000,
        currentRating: Math.floor(Math.random() * 2500) + 3500,
        placements: { top1: wins, top3: wins + Math.floor(Math.random() * 300), top10: wins + Math.floor(Math.random() * 800) },
      })
      setTrackerLoading(false)
    }, 1400)
  }, [])

  const getLeaderboard = (): LeaderboardEntry[] => {
    const won = bets.filter(b => b.status === 'won').length
    const res = bets.filter(b => b.status !== 'pending').length
    return [
      ...STATIC_LB,
      { rank:0, name:'You', fanBucks, totalWins: won, winRate: res > 0 ? Math.round((won/res)*100) : 0, isUser: true },
    ].sort((a,b) => b.fanBucks - a.fanBucks).map((e,i) => ({ ...e, rank: i+1 }))
  }

  const pendingCount = bets.filter(b => b.status === 'pending').length

  // ── Match Card ─────────────────────────────────────────────────────────────

  const MatchCard = ({ match }: { match: Match }) => {
    const t1 = TEAMS[match.team1], t2 = TEAMS[match.team2]
    const alreadyBet = bets.some(b => b.matchId === match.id && b.status === 'pending')
    return (
      <div style={{ background:'var(--fd-surface)', border:'1px solid var(--fd-border)' }} className="rounded-lg overflow-hidden hover:border-[#00B4D8]/60 transition-colors duration-200">
        <div style={{ background:'var(--fd-surface-2)', borderBottom:'1px solid var(--fd-border)' }} className="px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[#00B4D8] font-bold text-xs truncate">{match.event}</p>
            <p style={{ color:'var(--fd-muted)' }} className="text-xs">{match.eventType} · {match.prize}</p>
          </div>
          {match.status === 'live' && (
            <span className="flex items-center gap-1.5 text-xs font-black text-[#F03738] flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#F03738] live-dot" /> LIVE
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center">
              <div className="w-11 h-11 rounded-full mx-auto mb-1.5 flex items-center justify-center font-black text-xs" style={{ background: t1.color+'22', color: t1.color, border:`2px solid ${t1.color}` }}>{t1.tag}</div>
              <p className="text-white font-bold text-sm leading-tight">{t1.name}</p>
              <p style={{ color:'var(--fd-muted)' }} className="text-xs">{t1.winRate}% WR</p>
            </div>
            <div className="text-center flex-shrink-0">
              <p style={{ color:'var(--fd-subtle)' }} className="font-black text-xl">VS</p>
              <p style={{ color:'var(--fd-subtle)' }} className="text-[10px] mt-0.5">{match.scheduledDate}</p>
            </div>
            <div className="flex-1 text-center">
              <div className="w-11 h-11 rounded-full mx-auto mb-1.5 flex items-center justify-center font-black text-xs" style={{ background: t2.color+'22', color: t2.color, border:`2px solid ${t2.color}` }}>{t2.tag}</div>
              <p className="text-white font-bold text-sm leading-tight">{t2.name}</p>
              <p style={{ color:'var(--fd-muted)' }} className="text-xs">{t2.winRate}% WR</p>
            </div>
          </div>

          {match.status !== 'completed' && !alreadyBet && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={() => openBet(match.id, match.team1)} style={{ background:'var(--fd-surface-2)', border:'1px solid var(--fd-border)', color:'var(--fd-muted)' }} className="hover:border-[#00B4D8] hover:text-[#00B4D8] rounded py-2 px-3 text-sm font-bold transition-all">
                {t1.tag} <span className="text-[#00B4D8]">{match.odds[0]}×</span>
              </button>
              <button onClick={() => openBet(match.id, match.team2)} style={{ background:'var(--fd-surface-2)', border:'1px solid var(--fd-border)', color:'var(--fd-muted)' }} className="hover:border-[#00B4D8] hover:text-[#00B4D8] rounded py-2 px-3 text-sm font-bold transition-all">
                {t2.tag} <span className="text-[#00B4D8]">{match.odds[1]}×</span>
              </button>
            </div>
          )}
          {alreadyBet && <div style={{ background:'var(--fd-blue-dim)', border:'1px solid var(--fd-blue)', color:'var(--fd-blue)' }} className="mt-4 rounded py-2 text-center font-bold text-sm">✓ Bet Placed</div>}
          {match.status === 'completed' && match.winner && (
            <div style={{ background:'rgba(60,193,59,0.1)', border:'1px solid rgba(60,193,59,0.4)' }} className="mt-4 rounded py-2 text-center">
              <span style={{ color:'var(--fd-muted)' }} className="text-sm">Winner: </span>
              <span className="text-[#3CC13B] font-bold">{TEAMS[match.winner].name}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Left Sidebar ───────────────────────────────────────────────────────────

  const LeftSidebar = () => (
    <aside className="hidden lg:block w-52 flex-shrink-0 space-y-4">
      {/* TOC */}
      <div className="toc">
        <p className="toc-title">On this wiki</p>
        {([
          ['home','🏠 Home'],['matches','⚡ Matches'],['teams','👥 Teams'],
          ['tracker','📊 Tracker'],['leaderboard','🏆 Leaderboard'],['mybets','🎯 My Bets'],
        ] as [Tab,string][]).map(([id,label]) => (
          <a key={id} href="#" onClick={e => { e.preventDefault(); setActiveTab(id) }}
            style={{ color: activeTab===id ? 'var(--fd-blue-hover)' : 'var(--fd-blue)', fontWeight: activeTab===id ? 700 : 400 }}>
            {label}
          </a>
        ))}
      </div>

      {/* FanBucks box */}
      <div style={{ background:'var(--fd-surface)', border:'1px solid var(--fd-border)' }} className="rounded-lg overflow-hidden">
        <div className="infobox-header" style={{ background:'var(--fd-surface-2)', color:'var(--fd-muted)' }}>Your Balance</div>
        <div className="p-3 text-center">
          <p className="text-3xl font-black" style={{ color:'var(--fd-gold)' }}>🪙 {fanBucks.toLocaleString()}</p>
          <p style={{ color:'var(--fd-muted)' }} className="text-xs mt-1">FanBucks</p>
        </div>
        {pendingCount > 0 && (
          <div style={{ borderTop:'1px solid var(--fd-border)', color:'var(--fd-muted)' }} className="px-3 py-2 text-xs text-center">
            <span className="text-[#00B4D8] font-bold">{pendingCount}</span> active bet{pendingCount>1?'s':''}
          </div>
        )}
      </div>

      {/* Top teams */}
      <div className="toc">
        <p className="toc-title">Top Teams</p>
        {Object.values(TEAMS).map(t => (
          <a key={t.id} href="#" onClick={e => { e.preventDefault(); setActiveTab('teams') }} className="flex items-center gap-2 py-1" style={{ color:'var(--fd-blue)' }}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0" style={{ background: t.color+'25', color: t.color, border:`1px solid ${t.color}` }}>{t.tag[0]}</span>
            <span className="truncate text-xs">{t.name}</span>
          </a>
        ))}
      </div>

      {/* Quick links */}
      <div className="toc">
        <p className="toc-title">Quick Links</p>
        {['FNCS 2024','DreamHack','ESL Katowice','Twitch Rivals','World Cup'].map(l => (
          <a key={l} href="#" onClick={e => { e.preventDefault(); setActiveTab('matches') }} style={{ color:'var(--fd-blue)' }} className="text-xs">{l}</a>
        ))}
      </div>
    </aside>
  )

  // ── Right Rail ─────────────────────────────────────────────────────────────

  const RightRail = () => {
    const lb = getLeaderboard().slice(0, 5)
    return (
      <aside className="hidden xl:block w-64 flex-shrink-0 space-y-4">
        {/* Mini leaderboard */}
        <div style={{ background:'var(--fd-surface)', border:'1px solid var(--fd-border)' }} className="rounded-lg overflow-hidden">
          <div className="infobox-header">🏆 Leaderboard</div>
          {lb.map((e, i) => (
            <div key={e.name} style={{ borderTop: i>0 ? '1px solid var(--fd-border)' : undefined }} className={`px-3 py-2 flex items-center justify-between ${e.isUser ? 'bg-[#00B4D8]/8' : ''}`}>
              <div className="flex items-center gap-2 min-w-0">
                <span style={{ color: i<3 ? ['#F5C518','#9FA3A8','#CD7F32'][i] : 'var(--fd-subtle)' }} className="text-xs font-black w-5">#{e.rank}</span>
                <span className={`text-xs truncate font-medium ${e.isUser ? 'text-[#00B4D8]' : 'text-white'}`}>{e.name}</span>
              </div>
              <span style={{ color:'var(--fd-gold)' }} className="text-xs font-bold flex-shrink-0 ml-2">{e.fanBucks.toLocaleString()}</span>
            </div>
          ))}
          <button onClick={() => setActiveTab('leaderboard')} style={{ borderTop:'1px solid var(--fd-border)', color:'var(--fd-blue)' }} className="w-full px-3 py-2 text-xs font-bold text-center hover:underline transition">
            Full leaderboard →
          </button>
        </div>

        {/* Live match CTA */}
        {MATCHES.filter(m => m.status === 'live').map(m => (
          <div key={m.id} style={{ background:'var(--fd-surface)', border:'1px solid var(--fd-border)' }} className="rounded-lg overflow-hidden">
            <div className="infobox-header flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F03738] live-dot" /> LIVE NOW
            </div>
            <div className="p-3">
              <p className="text-white font-bold text-sm text-center mb-1">{TEAMS[m.team1].name}</p>
              <p style={{ color:'var(--fd-muted)' }} className="text-xs text-center mb-2">vs {TEAMS[m.team2].name}</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => openBet(m.id, m.team1)} className="btn-fd py-1.5 text-xs">{TEAMS[m.team1].tag} {m.odds[0]}×</button>
                <button onClick={() => openBet(m.id, m.team2)} className="btn-fd py-1.5 text-xs">{TEAMS[m.team2].tag} {m.odds[1]}×</button>
              </div>
            </div>
          </div>
        ))}

        {/* Info box */}
        <div className="infobox">
          <div className="infobox-header">About FanBucks</div>
          <div className="infobox-row"><div className="infobox-label">Type</div><div className="infobox-value">Virtual currency</div></div>
          <div className="infobox-row"><div className="infobox-label">Start</div><div className="infobox-value text-[#F5C518] font-bold">1,000 FB free</div></div>
          <div className="infobox-row"><div className="infobox-label">Use</div><div className="infobox-value">Bet on matches</div></div>
          <div className="infobox-row"><div className="infobox-label">Real $</div><div className="infobox-value">No — fun only</div></div>
        </div>
      </aside>
    )
  }

  // ── Tab: Home ──────────────────────────────────────────────────────────────

  const renderHome = () => (
    <div className="space-y-6">
      {/* Wiki-style article header */}
      <div>
        <h1 className="wiki-h2 text-2xl">FortniteFandom.wiki — Esports Betting Hub</h1>
        <p style={{ color:'var(--fd-muted)' }} className="text-sm leading-relaxed">
          Welcome to the <strong className="text-white">FortniteFandom.wiki</strong> betting hub — the community home for Fortnite esports.
          Track teams, analyse player stats, and bet virtual <span style={{ color:'var(--fd-gold)' }} className="font-bold">FanBucks</span> on upcoming FNCS, DreamHack, and ESL events. No real money, just bragging rights.
        </p>
      </div>

      {/* Live match hero */}
      <div className="rounded-lg overflow-hidden" style={{ border:'1px solid var(--fd-border)' }}>
        <div style={{ background:'linear-gradient(135deg, #0c1e4a 0%, #1a0a2e 60%, #13141A 100%)', borderBottom:'1px solid var(--fd-border)' }} className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 text-[#F03738] text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-[#F03738] live-dot" /> LIVE — FNCS Chapter 5 Grand Finals
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-1 leading-none">
            <span style={{ color:'#009AC7' }}>TEAM LIQUID</span>
            <span style={{ color:'var(--fd-subtle)' }} className="mx-3 text-2xl">vs</span>
            <span style={{ color:'#FF3333' }}>FAZE CLAN</span>
          </h2>
          <p style={{ color:'var(--fd-gold)' }} className="font-bold mt-1 mb-4">🏆 $250,000 Prize Pool</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => openBet('m1','liquid')} className="btn-fd px-5 py-2.5 text-sm" style={{ background:'#009AC7' }}>
              Bet Team Liquid — 1.75×
            </button>
            <button onClick={() => openBet('m1','faze')} className="btn-fd px-5 py-2.5 text-sm" style={{ background:'#FF3333' }}>
              Bet FaZe Clan — 2.15×
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'Your FanBucks', value: fanBucks.toLocaleString(), icon:'🪙', color:'var(--fd-gold)' },
          { label:'Active Bets',   value: pendingCount,              icon:'🎯', color:'var(--fd-blue)' },
          { label:'Total Wins',    value: bets.filter(b=>b.status==='won').length, icon:'🏆', color:'#3CC13B' },
          { label:'Live Matches',  value: MATCHES.filter(m=>m.status==='live').length, icon:'⚡', color:'#F03738' },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--fd-surface)', border:'1px solid var(--fd-border)' }} className="rounded-lg p-4">
            <p style={{ color:'var(--fd-muted)' }} className="text-xs mb-1">{s.label}</p>
            <p style={{ color: s.color }} className="text-2xl font-black">{s.icon} {s.value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="wiki-h2">Upcoming Matches</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {MATCHES.filter(m=>m.status==='upcoming').slice(0,2).map(m => <MatchCard key={m.id} match={m} />)}
        </div>
        <button onClick={() => setActiveTab('matches')} style={{ color:'var(--fd-blue)' }} className="mt-3 text-sm font-bold hover:underline">View all matches →</button>
      </div>

      {/* How it works */}
      <div>
        <h2 className="wiki-h2">How FanBucks Work</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { n:'1', t:'Free FanBucks',    d:'Every member starts with 1,000 FanBucks — no real money, no sign-up required.' },
            { n:'2', t:'Bet on Matches',   d:'Pick any upcoming match, choose a team, and confirm your bet amount. Higher odds = bigger payout.' },
            { n:'3', t:'Climb the Board',  d:'Grow your FanBucks stack and compete for the top spot on the Season 4 leaderboard.' },
          ].map(s => (
            <div key={s.n} style={{ background:'var(--fd-surface)', border:'1px solid var(--fd-border)' }} className="rounded-lg p-4 flex gap-3">
              <div style={{ background:'var(--fd-blue-dim)', border:'1px solid var(--fd-blue)', color:'var(--fd-blue)' }} className="w-7 h-7 rounded flex items-center justify-center font-black text-sm flex-shrink-0">{s.n}</div>
              <div>
                <p className="text-white font-bold text-sm mb-1">{s.t}</p>
                <p style={{ color:'var(--fd-muted)' }} className="text-xs leading-relaxed">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ── Tab: Matches ───────────────────────────────────────────────────────────

  const renderMatches = () => (
    <div className="space-y-6">
      <h1 className="wiki-h2 text-2xl">Matches</h1>
      {[
        { key:'live',      label:'Live Now',   dot:'bg-[#F03738] live-dot', labelColor:'#F03738' },
        { key:'upcoming',  label:'Upcoming',   dot:'bg-[#F5C518]',          labelColor:'#F5C518' },
        { key:'completed', label:'Completed',  dot:'bg-[#6B7280]',          labelColor:'#6B7280' },
      ].map(s => {
        const list = MATCHES.filter(m => m.status === s.key as Match['status'])
        if (!list.length) return null
        return (
          <div key={s.key}>
            <h2 style={{ color: s.labelColor }} className="text-xs font-black flex items-center gap-2 mb-3 tracking-widest uppercase">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} /> {s.label}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {list.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>
        )
      })}
    </div>
  )

  // ── Tab: Teams ─────────────────────────────────────────────────────────────

  const renderTeams = () => (
    <div className="space-y-5">
      <h1 className="wiki-h2 text-2xl">Fortnite Teams</h1>
      {Object.values(TEAMS).map(team => (
        <div key={team.id} style={{ background:'var(--fd-surface)', border:'1px solid var(--fd-border)' }} className="rounded-lg overflow-hidden hover:border-[#00B4D8]/50 transition-colors">
          {/* Coloured top strip */}
          <div style={{ height:4, background: team.color }} />
          <div className="p-5">
            <div className="flex flex-col md:flex-row gap-5">
              {/* Infobox */}
              <div className="infobox w-full md:w-56 flex-shrink-0 self-start">
                <div className="infobox-header" style={{ background: team.color }}>{team.name}</div>
                <div className="infobox-row"><div className="infobox-label">Tag</div>    <div className="infobox-value font-bold" style={{ color: team.color }}>{team.tag}</div></div>
                <div className="infobox-row"><div className="infobox-label">Region</div> <div className="infobox-value">{team.region}</div></div>
                <div className="infobox-row"><div className="infobox-label">Founded</div><div className="infobox-value">{team.founded}</div></div>
                <div className="infobox-row"><div className="infobox-label">Rank</div>   <div className="infobox-value font-bold" style={{ color:'var(--fd-gold)' }}>#{team.ranking}</div></div>
                <div className="infobox-row"><div className="infobox-label">Win Rate</div><div className="infobox-value text-[#3CC13B] font-bold">{team.winRate}%</div></div>
                <div className="infobox-row"><div className="infobox-label">Earnings</div><div className="infobox-value text-[#3CC13B] font-bold">{team.totalEarnings}</div></div>
              </div>

              {/* Article */}
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-black text-xl mb-2">{team.name}</h2>
                <p style={{ color:'var(--fd-muted)' }} className="text-sm leading-relaxed mb-4">{team.description}</p>

                <h3 style={{ color:'var(--fd-blue)', borderBottom:'1px solid var(--fd-border)' }} className="text-xs font-black tracking-widest uppercase pb-1 mb-2">Active Roster</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {team.players.map(p => (
                    <span key={p} style={{ background:'var(--fd-surface-2)', border:'1px solid var(--fd-border)' }} className="text-white text-sm px-3 py-1 rounded font-medium">{p}</span>
                  ))}
                </div>

                <div className="flex gap-3 flex-wrap">
                  <button onClick={() => { setActiveTab('matches') }} style={{ color:'var(--fd-blue)', border:'1px solid var(--fd-blue)' }} className="text-xs font-bold px-3 py-1.5 rounded hover:bg-[#00B4D8]/10 transition">
                    View Matches
                  </button>
                  <button onClick={() => openBet(MATCHES.find(m => m.team1===team.id || m.team2===team.id && m.status!=='completed')?.id ?? '', team.id)} style={{ background:'var(--fd-blue)', color:'#fff' }} className="text-xs font-bold px-3 py-1.5 rounded hover:bg-[#00C8EE] transition">
                    Bet on {team.tag}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // ── Tab: Tracker ───────────────────────────────────────────────────────────

  const renderTracker = () => (
    <div className="space-y-5">
      <h1 className="wiki-h2 text-2xl">Player Tracker Tool</h1>
      <p style={{ color:'var(--fd-muted)' }} className="text-sm">Search any Epic Games username to view their competitive stats and inform your FanBucks bets.</p>

      <div style={{ background:'var(--fd-surface)', border:'1px solid var(--fd-border)' }} className="rounded-lg p-5">
        <div className="flex gap-3">
          <input
            type="text" value={trackerSearch}
            onChange={e => setTrackerSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && performSearch(trackerSearch)}
            placeholder="Epic Games username…"
            style={{ background:'var(--fd-bg)', border:'1px solid var(--fd-border)', color:'var(--fd-text)' }}
            className="flex-1 rounded px-3 py-2.5 text-sm focus:border-[#00B4D8] outline-none transition-colors"
          />
          <button onClick={() => performSearch(trackerSearch)} disabled={trackerLoading} className="btn-fd px-5 py-2.5 text-sm disabled:opacity-50">
            {trackerLoading ? '…' : 'Search'}
          </button>
        </div>
        <p style={{ color:'var(--fd-subtle)' }} className="text-xs mt-2">Try: Bugha · Vivid · Cented · Dubs · EpikWhale</p>
      </div>

      {/* Pro quick-links */}
      <div style={{ background:'var(--fd-surface)', border:'1px solid var(--fd-border)' }} className="rounded-lg p-4">
        <p style={{ color:'var(--fd-muted)' }} className="text-xs font-bold tracking-widest uppercase mb-3">Quick Lookup — Pro Players</p>
        <div className="flex flex-wrap gap-2">
          {['Bugha','Vivid','Cented','Dubs','Mero','EpikWhale','Ronaldo','Commandment','Bini','Kreo'].map(p => (
            <button key={p} onClick={() => { setTrackerSearch(p); performSearch(p) }}
              style={{ background:'var(--fd-surface-2)', border:'1px solid var(--fd-border)', color:'var(--fd-muted)' }}
              className="px-3 py-1.5 rounded text-sm font-medium hover:border-[#00B4D8] hover:text-[#00B4D8] transition">
              {p}
            </button>
          ))}
        </div>
      </div>

      {trackerLoading && (
        <div style={{ background:'var(--fd-surface)', border:'1px solid var(--fd-border)' }} className="rounded-lg p-10 text-center">
          <p style={{ color:'var(--fd-muted)' }}>Fetching player data…</p>
        </div>
      )}

      {trackerResult && !trackerLoading && (
        <div style={{ background:'var(--fd-surface)', border:'1px solid var(--fd-blue)' }} className="rounded-lg overflow-hidden animate-slide-in">
          <div style={{ background:'linear-gradient(to right, var(--fd-blue-dim), transparent)', borderBottom:'1px solid var(--fd-border)' }} className="p-5 flex items-center gap-4">
            <div style={{ background:'var(--fd-blue-dim)', border:'2px solid var(--fd-blue)', color:'var(--fd-blue)' }} className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-black">
              {trackerResult.player[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-white font-black text-2xl">{trackerResult.player}</h2>
              <div className="flex gap-2 mt-1">
                <span style={{ background:'var(--fd-surface-2)', color:'var(--fd-muted)' }} className="text-xs px-2 py-0.5 rounded">{trackerResult.platform}</span>
                <span style={{ background:'var(--fd-blue-dim)', color:'var(--fd-blue)' }} className="text-xs px-2 py-0.5 rounded font-bold">Rating {trackerResult.currentRating}</span>
              </div>
            </div>
          </div>

          <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label:'Wins',         v: trackerResult.wins.toLocaleString(),         c:'var(--fd-gold)',  i:'🏆' },
              { label:'Win Rate',     v: `${trackerResult.winRate}%`,                 c:'#3CC13B',         i:'📈' },
              { label:'K/D',          v: trackerResult.kd,                            c:'var(--fd-blue)',  i:'⚔️' },
              { label:'Matches',      v: trackerResult.matches.toLocaleString(),       c:'#9B59B6',         i:'🎮' },
              { label:'Eliminations', v: trackerResult.eliminations.toLocaleString(), c:'#F03738',         i:'💀' },
              { label:'Avg Kills',    v: trackerResult.avgKills,                      c:'#FF6B35',         i:'🎯' },
              { label:'Peak Rating',  v: trackerResult.peakRating.toLocaleString(),   c:'var(--fd-gold)',  i:'⭐' },
              { label:'Top 3',        v: trackerResult.placements.top3.toLocaleString(), c:'var(--fd-blue)', i:'🥉' },
            ].map(s => (
              <div key={s.label} style={{ background:'var(--fd-surface-2)', border:'1px solid var(--fd-border)' }} className="rounded-lg p-3">
                <p style={{ color:'var(--fd-muted)' }} className="text-xs">{s.i} {s.label}</p>
                <p style={{ color: s.c }} className="text-xl font-black mt-1">{s.v}</p>
              </div>
            ))}
          </div>

          <div className="px-5 pb-5">
            <p style={{ color:'var(--fd-muted)' }} className="text-xs font-bold tracking-widest uppercase mb-3">Placement Breakdown</p>
            {[
              { label:'#1 Victory Royale', count: trackerResult.placements.top1,  bar:'var(--fd-gold)' },
              { label:'Top 3',             count: trackerResult.placements.top3,  bar:'var(--fd-blue)' },
              { label:'Top 10',            count: trackerResult.placements.top10, bar:'#3CC13B' },
            ].map(row => (
              <div key={row.label} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color:'var(--fd-muted)' }}>{row.label}</span>
                  <span className="text-white font-bold">{row.count.toLocaleString()}</span>
                </div>
                <div style={{ background:'var(--fd-border)' }} className="h-1.5 rounded-full overflow-hidden">
                  <div style={{ width:`${(row.count/trackerResult.placements.top10)*100}%`, background: row.bar }} className="h-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // ── Tab: Leaderboard ───────────────────────────────────────────────────────

  const renderLeaderboard = () => {
    const lb = getLeaderboard()
    const medals = ['🥇','🥈','🥉']
    const podBorders = ['border-[#F5C518] bg-[rgba(245,197,24,0.07)]','border-[#9FA3A8] bg-[rgba(159,163,168,0.07)]','border-[#CD7F32] bg-[rgba(205,127,50,0.07)]']
    return (
      <div className="space-y-6">
        <h1 className="wiki-h2 text-2xl">FanBucks Leaderboard <span style={{ color:'var(--fd-muted)' }} className="text-base font-normal">— Season 4</span></h1>

        <div className="grid grid-cols-3 gap-3">
          {lb.slice(0,3).map((e,i) => (
            <div key={e.name} className={`border rounded-lg p-4 text-center ${podBorders[i]} ${e.isUser ? 'ring-1 ring-[#00B4D8]' : ''}`}>
              <div className="text-3xl mb-2">{medals[i]}</div>
              <p className={`font-black text-sm mb-1 ${e.isUser ? 'text-[#00B4D8]' : 'text-white'}`}>{e.name}{e.isUser ? ' (You)' : ''}</p>
              <p style={{ color:'var(--fd-gold)' }} className="font-black text-lg">{e.fanBucks.toLocaleString()}</p>
              <p style={{ color:'var(--fd-muted)' }} className="text-xs">FanBucks</p>
            </div>
          ))}
        </div>

        <div style={{ background:'var(--fd-surface)', border:'1px solid var(--fd-border)' }} className="rounded-lg overflow-hidden">
          <div style={{ background:'var(--fd-surface-2)', borderBottom:'1px solid var(--fd-border)', color:'var(--fd-muted)' }} className="grid grid-cols-5 px-4 py-2.5 text-[10px] font-black tracking-widest uppercase">
            {['#','Player','FanBucks','Wins','WR'].map(h => (
              <span key={h} style={{ color:'var(--fd-muted)' }} className={h!=='#' && h!=='Player' ? 'text-right' : ''}>{h}</span>
            ))}
          </div>
          {lb.map((e,i) => (
            <div key={e.name} style={{ borderTop:'1px solid var(--fd-border)', background: e.isUser ? 'rgba(0,180,216,0.04)' : undefined }} className={`grid grid-cols-5 px-4 py-2.5 hover:bg-white/[0.03] transition ${e.isUser ? 'border-l-2 border-l-[#00B4D8]' : ''}`}>
              <span style={{ color: i<3 ? ['#F5C518','#9FA3A8','#CD7F32'][i] : 'var(--fd-subtle)' }} className="font-bold text-sm">#{e.rank}</span>
              <span className={`font-medium text-sm ${e.isUser ? 'text-[#00B4D8]' : 'text-white'}`}>{e.name}{e.isUser ? ' ⭐' : ''}</span>
              <span style={{ color:'var(--fd-gold)' }} className="text-right font-bold text-sm">{e.fanBucks.toLocaleString()}</span>
              <span className="text-right text-white text-sm">{e.totalWins}</span>
              <span style={{ color:'var(--fd-muted)' }} className="text-right text-sm">{e.winRate}%</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Tab: My Bets ───────────────────────────────────────────────────────────

  const renderMyBets = () => {
    const won  = bets.filter(b => b.status === 'won')
    const resolved = bets.filter(b => b.status !== 'pending').length
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="wiki-h2 text-2xl mb-0">My Bets</h1>
          <div className="text-right">
            <p style={{ color:'var(--fd-muted)' }} className="text-xs">Balance</p>
            <p style={{ color:'var(--fd-gold)' }} className="font-black text-xl">{fanBucks.toLocaleString()} FB</p>
          </div>
        </div>

        {bets.length === 0 ? (
          <div style={{ background:'var(--fd-surface)', border:'1px solid var(--fd-border)' }} className="rounded-lg p-12 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-white font-bold text-xl mb-2">No bets yet</p>
            <p style={{ color:'var(--fd-muted)' }} className="mb-5 text-sm">Head to Matches and place your first FanBucks bet!</p>
            <button onClick={() => setActiveTab('matches')} className="btn-fd px-6 py-2.5 text-sm">View Matches</button>
          </div>
        ) : (
          <div className="space-y-3">
            {bets.map(bet => (
              <div key={bet.id} style={{ background:'var(--fd-surface)', border:`1px solid ${bet.status==='won' ? 'rgba(60,193,59,0.4)' : bet.status==='lost' ? 'rgba(240,55,56,0.4)' : 'var(--fd-border)'}` }} className="rounded-lg p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p style={{ color:'var(--fd-muted)' }} className="text-xs truncate mb-0.5">{bet.match}</p>
                    <p className="text-white font-bold">{bet.teamName}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      <span style={{ color:'var(--fd-muted)' }}>Bet: <span className="text-white font-bold">{bet.amount} FB</span></span>
                      <span style={{ color:'var(--fd-muted)' }}>Odds: <span style={{ color:'var(--fd-blue)' }} className="font-bold">{bet.odds}×</span></span>
                      <span style={{ color:'var(--fd-muted)' }}>Win: <span className="text-[#3CC13B] font-bold">{bet.potentialWin} FB</span></span>
                    </div>
                    <p style={{ color:'var(--fd-subtle)' }} className="text-xs mt-1.5">{bet.placedAt}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {bet.status==='pending' && (
                      <div>
                        <span style={{ background:'rgba(245,197,24,0.12)', color:'var(--fd-gold)', border:'1px solid rgba(245,197,24,0.3)' }} className="text-xs font-black px-3 py-1 rounded">PENDING</span>
                        <button onClick={() => simulateResult(bet.id)} style={{ color:'var(--fd-subtle)' }} className="block mt-2 text-xs hover:text-white transition">Simulate →</button>
                      </div>
                    )}
                    {bet.status==='won' && (
                      <div>
                        <span className="bg-[rgba(60,193,59,0.12)] text-[#3CC13B] border border-[rgba(60,193,59,0.3)] text-xs font-black px-3 py-1 rounded">WON</span>
                        <p className="text-[#3CC13B] font-black text-lg mt-1">+{bet.potentialWin} FB</p>
                      </div>
                    )}
                    {bet.status==='lost' && (
                      <div>
                        <span className="bg-[rgba(240,55,56,0.12)] text-[#F03738] border border-[rgba(240,55,56,0.3)] text-xs font-black px-3 py-1 rounded">LOST</span>
                        <p className="text-[#F03738] font-black text-lg mt-1">−{bet.amount} FB</p>
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
              { label:'Total Wagered', v: bets.reduce((s,b)=>s+b.amount,0).toLocaleString()+' FB',                        c:'var(--fd-blue)' },
              { label:'Total Won',     v: won.reduce((s,b)=>s+b.potentialWin,0).toLocaleString()+' FB',                   c:'#3CC13B' },
              { label:'Win Rate',      v: Math.round((won.length/resolved)*100)+'%',                                      c:'var(--fd-gold)' },
            ].map(s => (
              <div key={s.label} style={{ background:'var(--fd-surface)', border:'1px solid var(--fd-border)' }} className="rounded-lg p-4 text-center">
                <p style={{ color:'var(--fd-muted)' }} className="text-xs">{s.label}</p>
                <p style={{ color: s.c }} className="font-black text-lg">{s.v}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Betting Modal ──────────────────────────────────────────────────────────

  const BettingModal = () => {
    if (!bettingMatch || !bettingTeam) return null
    const match   = MATCHES.find(m => m.id === bettingMatch)!
    const team    = TEAMS[bettingTeam]
    const isT1    = match.team1 === bettingTeam
    const odds    = isT1 ? match.odds[0] : match.odds[1]
    const amt     = parseInt(betAmount, 10)
    const potWin  = amt > 0 ? Math.floor(amt * odds) : 0
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={closeBet}>
        <div style={{ background:'var(--fd-surface)', border:'1px solid var(--fd-blue)' }} className="rounded-lg p-6 max-w-md w-full animate-slide-in" onClick={e => e.stopPropagation()}>
          {/* Fandom-style modal header */}
          <div style={{ borderBottom:'2px solid var(--fd-blue)', paddingBottom:'0.75rem', marginBottom:'1rem' }}>
            <h3 style={{ color:'var(--fd-blue)' }} className="text-xl font-black">Place Bet</h3>
            <p style={{ color:'var(--fd-muted)' }} className="text-sm">{TEAMS[match.team1].name} vs {TEAMS[match.team2].name}</p>
          </div>

          <div style={{ background:'var(--fd-surface-2)', border:'1px solid var(--fd-border)' }} className="rounded-lg p-4 mb-4 flex justify-between items-center">
            <div>
              <p style={{ color:'var(--fd-muted)' }} className="text-xs">Betting on</p>
              <p className="text-white font-black text-lg">{team.name}</p>
            </div>
            <div className="text-right">
              <p style={{ color:'var(--fd-muted)' }} className="text-xs">Odds</p>
              <p style={{ color:'var(--fd-blue)' }} className="font-black text-2xl">{odds}×</p>
            </div>
          </div>

          <div className="mb-4">
            <label style={{ color:'var(--fd-muted)' }} className="text-xs mb-1.5 block font-bold tracking-wide uppercase">Bet Amount (FanBucks)</label>
            <input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)}
              placeholder="Min. 10 FanBucks" autoFocus min={10} max={fanBucks}
              style={{ background:'var(--fd-bg)', border:'1px solid var(--fd-border)', color:'var(--fd-text)' }}
              className="w-full rounded px-4 py-3 text-lg focus:border-[#00B4D8] outline-none transition-colors"
            />
            <div className="flex gap-2 mt-2">
              {[50,100,250,500].map(p => (
                <button key={p} onClick={() => setBetAmount(String(Math.min(p,fanBucks)))}
                  style={{ background:'var(--fd-surface-2)', border:'1px solid var(--fd-border)', color:'var(--fd-muted)' }}
                  className="flex-1 text-xs py-1.5 rounded hover:border-[#00B4D8] hover:text-[#00B4D8] transition">{p}</button>
              ))}
            </div>
          </div>

          {amt > 0 && (
            <div style={{ background:'var(--fd-blue-dim)', border:'1px solid rgba(0,180,216,0.3)' }} className="rounded-lg p-4 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color:'var(--fd-muted)' }}>Potential win</span>
                <span style={{ color:'var(--fd-blue)' }} className="font-black text-lg">{potWin} FB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color:'var(--fd-muted)' }}>Balance after</span>
                <span className="text-white">{(fanBucks-amt).toLocaleString()} FB</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={closeBet}
              style={{ background:'var(--fd-surface-2)', border:'1px solid var(--fd-border)', color:'var(--fd-muted)' }}
              className="flex-1 font-bold py-3 rounded hover:text-white transition">Cancel</button>
            <button onClick={placeBet} className="btn-fd flex-1 py-3 rounded font-black">Confirm Bet</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Tab config ─────────────────────────────────────────────────────────────

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id:'home',        label:'Home',        icon:'🏠' },
    { id:'matches',     label:'Matches',     icon:'⚡' },
    { id:'teams',       label:'Teams',       icon:'👥' },
    { id:'tracker',     label:'Tracker',     icon:'📊' },
    { id:'leaderboard', label:'Leaderboard', icon:'🏆' },
    { id:'mybets',      label:'My Bets',     icon:'🎯' },
  ]
  const TAB_CONTENT: Record<Tab, () => JSX.Element> = {
    home: renderHome, matches: renderMatches, teams: renderTeams,
    tracker: renderTracker, leaderboard: renderLeaderboard, mybets: renderMyBets,
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight:'100vh', background:'var(--fd-bg)' }}>
      {/* Toast */}
      {note && (
        <div style={{ background: note.ok ? '#3CC13B' : '#F03738' }}
          className="fixed top-4 right-4 z-50 text-white px-5 py-3 rounded shadow-xl font-bold text-sm animate-slide-in">
          {note.msg}
        </div>
      )}

      <BettingModal />

      {/* ── Fandom Global Nav ── */}
      <header style={{ background:'var(--fd-nav)', borderBottom:'1px solid var(--fd-border)' }} className="sticky top-0 z-30">
        {/* Top bar */}
        <div className="max-w-[1400px] mx-auto px-4">
          <div style={{ borderBottom:'1px solid var(--fd-border)' }} className="flex items-center justify-between h-12">
            <button onClick={() => setActiveTab('home')} className="flex items-center gap-2.5">
              {/* Fandom-style wordmark */}
              <div style={{ background:'var(--fd-blue)', borderRadius:3 }} className="w-7 h-7 flex items-center justify-center font-black text-xs text-white">FN</div>
              <span className="font-black text-base leading-none">
                <span className="text-white">FortniteFandom</span>
                <span style={{ color:'var(--fd-blue)' }}>.wiki</span>
              </span>
            </button>

            {/* Right: FanBucks */}
            <div style={{ background:'var(--fd-gold-dim)', border:'1px solid rgba(245,197,24,0.25)' }} className="flex items-center gap-2 rounded px-3 py-1.5">
              <span>🪙</span>
              <div>
                <p style={{ color:'var(--fd-subtle)' }} className="text-[10px] leading-none">FanBucks</p>
                <p style={{ color:'var(--fd-gold)' }} className="font-black text-sm leading-none">{fanBucks.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Tab nav */}
          <div className="flex overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors"
                style={{ borderBottomColor: activeTab===tab.id ? 'var(--fd-blue)' : 'transparent', color: activeTab===tab.id ? 'var(--fd-blue)' : 'var(--fd-muted)' }}>
                {tab.icon} {tab.label}
                {tab.id==='mybets' && pendingCount>0 && (
                  <span style={{ background:'var(--fd-blue)', color:'#fff' }} className="text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── 3-column layout ── */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          <LeftSidebar />

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {TAB_CONTENT[activeTab]()}
          </main>

          <RightRail />
        </div>
      </div>

      {/* ── Fandom-style footer ── */}
      <footer style={{ borderTop:'1px solid var(--fd-border)', background:'var(--fd-nav)', marginTop:'3rem' }}>
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div style={{ background:'var(--fd-blue)', borderRadius:3 }} className="w-6 h-6 flex items-center justify-center font-black text-xs text-white">FN</div>
              <span className="font-black text-sm"><span className="text-white">FortniteFandom</span><span style={{ color:'var(--fd-blue)' }}>.wiki</span></span>
            </div>
            <div className="flex gap-6 text-xs" style={{ color:'var(--fd-subtle)' }}>
              {['About','Community Portal','Help','Contact'].map(l => (
                <a key={l} href="#" style={{ color:'var(--fd-blue)' }} className="hover:underline">{l}</a>
              ))}
            </div>
            <p style={{ color:'var(--fd-subtle)' }} className="text-xs text-center">
              FanBucks = virtual currency only. Not affiliated with Epic Games or Fandom Inc.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
