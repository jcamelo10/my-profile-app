"use client"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLang } from "@/lib/LangContext"
import { t } from "@/lib/i18n"

type Section = "matches"|"leaderboard"|"settings"

interface Match {
  _id: string
  matchNumber: number
  group: string
  stage: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  kickoffUtc: string
  venue: string
  isFinished: boolean
  homeScore: number|null
  awayScore: number|null
}

const IcoMatches = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
const IcoLeaderboard = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
const IcoPicks = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IcoSettings = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>

function colTime(utcStr: string) {
  const d = new Date(utcStr)
  return d.toLocaleString("es-CO", { timeZone:"America/Bogota", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })
}

function isLocked(kickoffUtc: string) {
  return new Date() >= new Date(new Date(kickoffUtc).getTime() - 15 * 60 * 1000)
}

const GROUP_TABS = ["A","B","C","D","E","F","G","H","I","J","K","L"]
const STAGE_TABS = ["R32","R16","QF","SF","3rd","Final"]
const STAGE_LABELS: Record<string,string> = { r32:"Octavos", r16:"Cuartos", qf:"Cuartos", sf:"Semis", "3rd":"3er Lugar", final:"Final" }

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { lang, setLang } = useLang()
  const [section, setSection] = useState<Section>("matches")
  const [isDesktop, setIsDesktop] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState("A")

  useEffect(() => { if (status === "unauthenticated") router.push("/") }, [status, router])

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check(); window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/matches").then(r=>r.json()).then(data => {
        setMatches(Array.isArray(data) ? data : [])
        setLoading(false)
      }).catch(()=>setLoading(false))
    }
  }, [status])

  if (status === "loading") return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100dvh"}}><p className="text-muted">{t(lang,"general.loading")}</p></div>

  const navItems = [
    {id:"matches", label:t(lang,"nav.matches"), Icon:IcoMatches},
    {id:"leaderboard", label:t(lang,"nav.leaderboard"), Icon:IcoLeaderboard},
    {id:"picks", label:t(lang,"nav.picks"), Icon:IcoPicks},
    {id:"settings", label:t(lang,"nav.settings"), Icon:IcoSettings},
  ]

  const handleNav = (id: string) => id === "picks" ? router.push("/picks") : setSection(id as Section)

  const LangToggle = () => (
    <div style={{display:"flex",gap:"0.5rem"}}>
      <button className={"btn btn--sm "+(lang==="en"?"btn--primary":"btn--ghost")} onClick={()=>setLang("en")}>EN</button>
      <button className={"btn btn--sm "+(lang==="es"?"btn--primary":"btn--ghost")} onClick={()=>setLang("es")}>ES</button>
    </div>
  )

  const groupMatches = matches.filter(m => m.group === selectedGroup)
  const upcomingMatches = matches.filter(m => !m.isFinished).slice(0, 6)
  const predictedCount = 0

  const statsBar = (
    <div style={{padding:"1rem 1.25rem",background:"var(--color-primary)",color:"#fff",display:"flex",justifyContent:"space-around"}}>
      {[["0",t(lang,"dashboard.points")],["—",t(lang,"dashboard.rank")],[String(predictedCount),t(lang,"dashboard.predicted")]].map(([val,label],i)=>(
        <div key={i} style={{textAlign:"center"}}>
          <div style={{fontSize:"var(--font-size-2xl)",fontWeight:800,lineHeight:1.2}}>{val}</div>
          <div style={{fontSize:"var(--font-size-xs)",opacity:0.85,marginTop:2}}>{label}</div>
        </div>
      ))}
    </div>
  )

  // Scrollable group tab bar
  const groupTabBar = (
    <div style={{borderBottom:"1px solid var(--color-gray-200)"}}>
      <div style={{display:"flex",overflowX:"auto",padding:"0 1.25rem",gap:"0.25rem",scrollbarWidth:"none",msOverflowStyle:"none"}}>
        {GROUP_TABS.map(g=>(
          <button key={g} onClick={()=>setSelectedGroup(g)} style={{flexShrink:0,padding:"0.75rem 1rem",border:"none",background:"transparent",cursor:"pointer",fontFamily:"var(--font-family)",fontWeight:selectedGroup===g?700:500,fontSize:"var(--font-size-sm)",color:selectedGroup===g?"var(--color-primary)":"var(--color-gray-600)",borderBottom:selectedGroup===g?"2px solid var(--color-primary)":"2px solid transparent",transition:"all 150ms ease",whiteSpace:"nowrap"}}>
            {lang==="es"?"Grupo":"Group"} {g}
          </button>
        ))}
        <div style={{width:"1px",background:"var(--color-gray-200)",margin:"0.5rem 0.25rem"}}/>
        {[{key:"r32",label:lang==="es"?"Ronda 32":"Round 32"},{key:"r16",label:lang==="es"?"Octavos":"Round 16"},{key:"qf",label:lang==="es"?"Cuartos":"QF"},{key:"sf",label:lang==="es"?"Semis":"SF"},{key:"3rd",label:lang==="es"?"3er Lugar":"3rd"},{key:"final",label:"Final"}].map(({key,label})=>(
          <button key={key} onClick={()=>setSelectedGroup(key)} style={{flexShrink:0,padding:"0.75rem 1rem",border:"none",background:"transparent",cursor:"pointer",fontFamily:"var(--font-family)",fontWeight:selectedGroup===key?700:500,fontSize:"var(--font-size-sm)",color:selectedGroup===key?"var(--color-primary)":"var(--color-gray-600)",borderBottom:selectedGroup===key?"2px solid var(--color-primary)":"2px solid transparent",transition:"all 150ms ease",whiteSpace:"nowrap"}}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )

  const MatchCard = ({ m, index }: { m: Match, index: number }) => {
    const locked = isLocked(m.kickoffUtc)
    return (
      <div className={"match-card"+(locked?" match-card--locked":"")} onClick={()=>!locked && router.push("/predict/"+m._id)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
            <span style={{fontSize:"var(--font-size-xs)",fontWeight:600,color:"var(--color-gray-500)",textTransform:"uppercase",letterSpacing:"0.03em"}}>
              {lang==="es"?"Partido":"Match"} {m.matchNumber}
            </span>
          </div>
          <span style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-500)"}}>{colTime(m.kickoffUtc)} COL</span>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.5rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.75rem",flex:1}}>
            <span style={{fontSize:"1.75rem"}}>{m.homeFlag}</span>
            <span style={{fontWeight:700,fontSize:"var(--font-size-md)"}}>{m.homeTeam}</span>
          </div>
          <div style={{textAlign:"center",padding:"0 0.5rem"}}>
            {m.isFinished ? (
              <span style={{fontWeight:800,fontSize:"var(--font-size-xl)",color:"var(--color-secondary)"}}>{m.homeScore} - {m.awayScore}</span>
            ) : (
              <span style={{fontSize:"var(--font-size-xs)",fontWeight:600,color:"var(--color-gray-400)"}}>vs</span>
            )}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"0.75rem",flex:1,justifyContent:"flex-end"}}>
            <span style={{fontWeight:700,fontSize:"var(--font-size-md)"}}>{m.awayTeam}</span>
            <span style={{fontSize:"1.75rem"}}>{m.awayFlag}</span>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"0.5rem"}}>
          <span style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-400)"}}>{m.venue}</span>
          {m.isFinished ? (
            <span className="badge badge--neutral">{lang==="es"?"Finalizado":"Finished"}</span>
          ) : locked ? (
            <span className="badge badge--error">🔒 {lang==="es"?"Cerrado":"Locked"}</span>
          ) : (
            <span className="badge badge--primary">{lang==="es"?"Predecir →":"Predict →"}</span>
          )}
        </div>
      </div>
    )
  }

  const matchesSection = (
    <div>
      {groupTabBar}
      <div style={{padding:"1rem 1.25rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
        {loading ? (
          <p className="text-muted text-sm">{t(lang,"general.loading")}</p>
        ) : groupMatches.length === 0 ? (
          <div style={{textAlign:"center",padding:"2rem",color:"var(--color-gray-500)"}}>
            <div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>🏆</div>
            <p style={{fontSize:"var(--font-size-sm)"}}>{lang==="es"?"Los partidos de esta fase aparecerán cuando estén disponibles.":"Matches for this stage will appear when available."}</p>
          </div>
        ) : (
          groupMatches.map((m,i) => <MatchCard key={m._id} m={m} index={i}/>)
        )}
      </div>
    </div>
  )

  const leaderboardSection = (
    <div style={{padding:"1.25rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
      <div className="card" style={{background:"var(--color-gray-50)",border:"none"}}>
        <div style={{fontWeight:700,marginBottom:"0.75rem",fontSize:"var(--font-size-sm)"}}>{t(lang,"leaderboard.scoring")}</div>
        {[["7 pts",t(lang,"leaderboard.exactScore")],["3 pts",t(lang,"leaderboard.correctWinner")],["3 pts",t(lang,"leaderboard.exactGoals")],["+1 pt",t(lang,"leaderboard.knockoutBonus")],["25 pts",t(lang,"leaderboard.champion")],["20 pts",t(lang,"leaderboard.topScorer")],["20 pts",t(lang,"leaderboard.goldenBall")],["15 pts",t(lang,"leaderboard.runnerUp")],["15 pts",t(lang,"leaderboard.goldenGlove")],["10 pts",t(lang,"leaderboard.thirdPlace")],["2 pts",t(lang,"leaderboard.groupAdvance")]].map(([pts,label],i,arr)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"0.375rem 0",borderBottom:i<arr.length-1?"1px solid var(--color-gray-200)":undefined,fontSize:"var(--font-size-sm)"}}>
            <span style={{color:"var(--color-gray-700)"}}>{label}</span>
            <span style={{fontWeight:700,color:"var(--color-primary)"}}>{pts}</span>
          </div>
        ))}
      </div>
      <p className="text-muted text-sm" style={{textAlign:"center"}}>{lang==="es"?"La tabla aparecerá cuando empiece el torneo.":"Leaderboard will appear when the tournament starts."}</p>
    </div>
  )

  const settingsSection = (
    <div style={{padding:"1.25rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
      <div className="card">
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
          <div className="avatar" style={{background:"var(--color-primary)"}}>{session?.user?.name?.charAt(0)??"?"}</div>
          <div>
            <div style={{fontWeight:600}}>{session?.user?.name}</div>
            <div style={{fontSize:"var(--font-size-sm)",color:"var(--color-gray-500)"}}>{session?.user?.email}</div>
          </div>
        </div>
      </div>
      <div className="card">
        <div style={{fontWeight:700,marginBottom:"1rem"}}>{t(lang,"settings.language")}</div>
        <div style={{display:"flex",gap:"0.5rem"}}>
          <button className={"btn btn--sm "+(lang==="en"?"btn--primary":"btn--secondary")} onClick={()=>setLang("en")}>English</button>
          <button className={"btn btn--sm "+(lang==="es"?"btn--primary":"btn--secondary")} onClick={()=>setLang("es")}>Español</button>
        </div>
      </div>
      <div className="card">
        <div style={{fontWeight:700,marginBottom:"0.75rem"}}>{lang==="es"?"Mi quiniela":"My pool"}</div>
        <button className="btn btn--secondary btn--full" onClick={()=>router.push("/groups")} style={{marginBottom:"0.5rem"}}>
          {lang==="es"?"Crear o unirse a un grupo":"Create or join a group"}
        </button>
      </div>
      <div className="card">
        <button className="btn btn--secondary btn--full" onClick={()=>signOut({callbackUrl:"/"})}>{t(lang,"settings.signOut")}</button>
      </div>
    </div>
  )

  const sidebar = (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"2rem"}}>
        <div style={{width:36,height:36,background:"var(--color-primary)",borderRadius:"var(--radius-md)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:"1.2rem"}}>⚽</span>
        </div>
        <span style={{fontSize:"var(--font-size-xl)",fontWeight:800}}>POLLON</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"0.25rem",flex:1}}>
        {navItems.map(({id,label,Icon})=>(
          <button key={id} onClick={()=>handleNav(id)} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem 1rem",borderRadius:"var(--radius-lg)",border:"none",cursor:"pointer",background:section===id?"var(--color-primary-light)":"transparent",color:section===id?"var(--color-primary)":"var(--color-gray-700)",fontWeight:section===id?600:500,fontSize:"var(--font-size-base)",fontFamily:"var(--font-family)",width:"100%",textAlign:"left",transition:"all 150ms ease"}}>
            <Icon/>{label}
          </button>
        ))}
      </div>
      <div style={{paddingTop:"1.5rem",borderTop:"1px solid var(--color-gray-200)"}}>
        <LangToggle/>
      </div>
    </div>
  )

  const rightSidebar = (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1.25rem",paddingBottom:"1.25rem",borderBottom:"1px solid var(--color-gray-200)"}}>
        <div className="avatar" style={{background:"var(--color-primary)"}}>{session?.user?.name?.charAt(0)??"?"}</div>
        <div>
          <div style={{fontWeight:600,fontSize:"var(--font-size-sm)"}}>{session?.user?.name}</div>
          <div style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-500)"}}>{session?.user?.email}</div>
        </div>
      </div>
      <div style={{fontSize:"var(--font-size-xs)",fontWeight:700,color:"var(--color-gray-500)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.75rem"}}>
        {lang==="es"?"Próximos partidos":"Upcoming matches"}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {upcomingMatches.length === 0 ? (
          <p style={{fontSize:"var(--font-size-sm)",color:"var(--color-gray-500)"}}>{lang==="es"?"No hay partidos próximos":"No upcoming matches"}</p>
        ) : upcomingMatches.map(m=>(
          <div key={m._id} className="card" style={{padding:"0.75rem",cursor:"pointer"}} onClick={()=>router.push("/predict/"+m._id)}>
            <div style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-500)",marginBottom:"0.375rem"}}>{colTime(m.kickoffUtc)} · {lang==="es"?"Grupo":"Group"} {m.group}</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontWeight:600,fontSize:"var(--font-size-sm)"}}>{m.homeFlag} {m.homeTeam}</span>
              <span style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-400)"}}>vs</span>
              <span style={{fontWeight:600,fontSize:"var(--font-size-sm)"}}>{m.awayTeam} {m.awayFlag}</span>
            </div>
            {!isLocked(m.kickoffUtc) && (
              <div style={{marginTop:"0.375rem",textAlign:"right"}}>
                <span style={{fontSize:"var(--font-size-xs)",color:"var(--color-primary)",fontWeight:600}}>{lang==="es"?"Predecir →":"Predict →"}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const bottomNav = (
    <nav className="bottom-nav">
      {navItems.map(({id,label,Icon})=>(
        <button key={id} className={"bottom-nav__item"+(section===id?" bottom-nav__item--active":"")} onClick={()=>handleNav(id)}>
          <Icon/><span>{label}</span>
        </button>
      ))}
    </nav>
  )

  const mainContent = (
    <>
      {section === "matches" && matchesSection}
      {section === "leaderboard" && leaderboardSection}
      {section === "settings" && settingsSection}
    </>
  )

  if (isDesktop) return (
    <div style={{display:"grid",gridTemplateColumns:"220px 1fr 280px",maxWidth:1200,margin:"0 auto",minHeight:"100dvh",background:"#fff",boxShadow:"var(--shadow-xl)"}}>
      <aside style={{borderRight:"1px solid var(--color-gray-200)",padding:"1.5rem",position:"sticky",top:0,height:"100dvh",overflowY:"auto"}}>
        {sidebar}
      </aside>
      <main style={{overflowY:"auto",minHeight:"100dvh"}}>
        {statsBar}
        {mainContent}
      </main>
      <aside style={{borderLeft:"1px solid var(--color-gray-200)",padding:"1.5rem",position:"sticky",top:0,height:"100dvh",overflowY:"auto"}}>
        {rightSidebar}
      </aside>
    </div>
  )

  return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100dvh",position:"relative",background:"#fff"}}>
      <div className="screen-header">
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
          <div style={{width:32,height:32,background:"var(--color-primary)",borderRadius:"var(--radius-md)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:"1.1rem"}}>⚽</span>
          </div>
          <span className="screen-header__title">POLLON</span>
        </div>
        <LangToggle/>
      </div>
      {statsBar}
      <div style={{paddingBottom:80}}>{mainContent}</div>
      {bottomNav}
    </div>
  )
}
