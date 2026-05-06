"use client"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLang } from "@/lib/LangContext"
import { t } from "@/lib/i18n"

type Tab = "matches"|"leaderboard"|"settings"

const IcoMatches = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
const IcoLeaderboard = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
const IcoPicks = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IcoSettings = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { lang, setLang } = useLang()
  const [activeTab, setActiveTab] = useState<Tab>("matches")
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/")
  }, [status, router])

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (status === "loading") return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100dvh"}}>
      <p className="text-muted">{t(lang,"general.loading")}</p>
    </div>
  )

  const navItems = [
    {id:"matches", label:t(lang,"nav.matches"), Icon:IcoMatches},
    {id:"leaderboard", label:t(lang,"nav.leaderboard"), Icon:IcoLeaderboard},
    {id:"picks", label:t(lang,"nav.picks"), Icon:IcoPicks},
    {id:"settings", label:t(lang,"nav.settings"), Icon:IcoSettings},
  ]

  const handleNav = (id: string) => id === "picks" ? router.push("/picks") : setActiveTab(id as Tab)

  const LangToggle = () => (
    <div style={{display:"flex",gap:"0.5rem"}}>
      <button className={"btn btn--sm "+(lang==="en"?"btn--primary":"btn--ghost")} onClick={()=>setLang("en")}>EN</button>
      <button className={"btn btn--sm "+(lang==="es"?"btn--primary":"btn--ghost")} onClick={()=>setLang("es")}>ES</button>
    </div>
  )

  const statsBar = (
    <div style={{padding:"1rem 1.25rem",background:"var(--color-primary)",color:"#fff",display:"flex",justifyContent:"space-around"}}>
      {[["0",t(lang,"dashboard.points")],["—",t(lang,"dashboard.rank")],["0",t(lang,"dashboard.predicted")]].map(([val,label],i)=>(
        <div key={i} style={{textAlign:"center"}}>
          <div style={{fontSize:"var(--font-size-2xl)",fontWeight:800,lineHeight:1.2}}>{val}</div>
          <div style={{fontSize:"var(--font-size-xs)",opacity:0.85,marginTop:2}}>{label}</div>
        </div>
      ))}
    </div>
  )

  const tabBar = (
    <div style={{padding:"0.75rem 1.25rem 0"}}>
      <div className="tabs">
        {(["matches","leaderboard","settings"] as Tab[]).map(id=>(
          <button key={id} className={"tab"+(activeTab===id?" tab--active":"")} onClick={()=>setActiveTab(id)}>
            {id==="matches"?t(lang,"dashboard.tabMatches"):id==="leaderboard"?t(lang,"dashboard.tabLeaderboard"):t(lang,"dashboard.tabSettings")}
          </button>
        ))}
      </div>
    </div>
  )

  const matchesContent = (
    <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
      <p style={{fontSize:"var(--font-size-sm)",color:"var(--color-gray-500)",marginBottom:"0.25rem"}}>
        {lang==="es"?"Partidos del Mundial — Haz clic para predecir antes del partido":"World Cup Matches — Click to predict before kickoff"}
      </p>
      {[
        {match:"MEX vs RSA",group:"A",date:"Jun 11",time:"14:00",stadium:"México",status:"upcoming"},
        {match:"KOR vs CZE",group:"A",date:"Jun 11",time:"21:00",stadium:"Guadalajara",status:"upcoming"},
        {match:"CAN vs BIH",group:"B",date:"Jun 12",time:"14:00",stadium:"Toronto",status:"upcoming"},
        {match:"USA vs PAR",group:"D",date:"Jun 12",time:"20:00",stadium:"Los Ángeles",status:"upcoming"},
        {match:"BRA vs MAR",group:"C",date:"Jun 13",time:"17:00",stadium:"New York",status:"upcoming"},
      ].map((m,i)=>(
        <div key={i} className="match-card" onClick={()=>router.push("/predict/"+i)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
            <span className="badge badge--neutral">Grupo {m.group}</span>
            <span style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-500)"}}>{m.date} · {m.time} COL</span>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontWeight:700,fontSize:"var(--font-size-md)"}}>{m.match.split(" vs ")[0]}</span>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-400)",fontWeight:600}}>vs</div>
              <div style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-400)",marginTop:2}}>{m.stadium}</div>
            </div>
            <span style={{fontWeight:700,fontSize:"var(--font-size-md)"}}>{m.match.split(" vs ")[1]}</span>
          </div>
          <div style={{marginTop:"0.75rem",display:"flex",justifyContent:"flex-end"}}>
            <span className="badge badge--primary">{lang==="es"?"Predecir →":"Predict →"}</span>
          </div>
        </div>
      ))}
    </div>
  )

  const leaderboardContent = (
    <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.25rem"}}>
        <span style={{fontSize:"var(--font-size-sm)",fontWeight:600,color:"var(--color-gray-700)"}}>{t(lang,"leaderboard.player")}</span>
        <span style={{fontSize:"var(--font-size-sm)",fontWeight:600,color:"var(--color-gray-700)"}}>{t(lang,"leaderboard.pts")}</span>
      </div>
      {[
        {name:session?.user?.name??"You",pts:0,you:true},
      ].map((p,i)=>(
        <div key={i} className="card" style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem 1rem",border:p.you?"1.5px solid var(--color-primary)":undefined}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:i===0?"var(--color-gold)":i===1?"var(--color-silver)":i===2?"var(--color-bronze)":"var(--color-gray-200)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"var(--font-size-xs)",fontWeight:700,color:i<3?"#fff":"var(--color-gray-600)",flexShrink:0}}>{i+1}</div>
          <div className="avatar" style={{background:"var(--color-primary)",width:32,height:32,fontSize:"var(--font-size-xs)"}}>{p.name?.charAt(0)??"?"}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,fontSize:"var(--font-size-sm)"}}>{p.name} {p.you&&<span className="badge badge--primary" style={{marginLeft:4,fontSize:"0.6rem"}}>{t(lang,"leaderboard.you")}</span>}</div>
          </div>
          <div style={{fontWeight:800,fontSize:"var(--font-size-lg)",color:p.you?"var(--color-primary)":"var(--color-secondary)"}}>{p.pts}</div>
        </div>
      ))}
      <div className="card" style={{background:"var(--color-gray-50)",border:"none"}}>
        <div style={{fontWeight:700,marginBottom:"0.75rem",fontSize:"var(--font-size-sm)"}}>{t(lang,"leaderboard.scoring")}</div>
        {[
          ["7 pts",t(lang,"leaderboard.exactScore")],
          ["3 pts",t(lang,"leaderboard.correctWinner")],
          ["3 pts",t(lang,"leaderboard.exactGoals")],
          ["+1 pt",t(lang,"leaderboard.knockoutBonus")],
          ["25 pts",t(lang,"leaderboard.champion")],
          ["20 pts",t(lang,"leaderboard.topScorer")],
        ].map(([pts,label],i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"0.25rem 0",borderBottom:i<5?"1px solid var(--color-gray-200)":undefined,fontSize:"var(--font-size-sm)"}}>
            <span style={{color:"var(--color-gray-700)"}}>{label}</span>
            <span style={{fontWeight:700,color:"var(--color-primary)"}}>{pts}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const settingsContent = (
    <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
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
        <button className="btn btn--secondary btn--full" onClick={()=>signOut({callbackUrl:"/"})}>
          {t(lang,"settings.signOut")}
        </button>
      </div>
    </div>
  )

  const tabContent = (
    <div style={{padding:"1.25rem"}}>
      {activeTab==="matches" && matchesContent}
      {activeTab==="leaderboard" && leaderboardContent}
      {activeTab==="settings" && settingsContent}
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
          <button key={id} onClick={()=>handleNav(id)} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem 1rem",borderRadius:"var(--radius-lg)",border:"none",cursor:"pointer",background:activeTab===id?"var(--color-primary-light)":"transparent",color:activeTab===id?"var(--color-primary)":"var(--color-gray-700)",fontWeight:activeTab===id?600:500,fontSize:"var(--font-size-base)",fontFamily:"var(--font-family)",width:"100%",textAlign:"left",transition:"all 150ms ease"}}>
            <Icon/>{label}
          </button>
        ))}
      </div>
      <div style={{paddingTop:"1.5rem",borderTop:"1px solid var(--color-gray-200)"}}>
        <LangToggle/>
      </div>
    </div>
  )

  const bottomNav = (
    <nav className="bottom-nav">
      {navItems.map(({id,label,Icon})=>(
        <button key={id} className={"bottom-nav__item"+(activeTab===id?" bottom-nav__item--active":"")} onClick={()=>handleNav(id)}>
          <Icon/><span>{label}</span>
        </button>
      ))}
    </nav>
  )

  if (isDesktop) return (
    <div style={{display:"grid",gridTemplateColumns:"240px 1fr 300px",maxWidth:1200,margin:"0 auto",minHeight:"100dvh",background:"#fff",boxShadow:"var(--shadow-xl)"}}>
      <aside style={{borderRight:"1px solid var(--color-gray-200)",padding:"1.5rem",position:"sticky",top:0,height:"100dvh",overflowY:"auto"}}>
        {sidebar}
      </aside>
      <main style={{overflowY:"auto",minHeight:"100dvh"}}>
        {statsBar}{tabBar}{tabContent}
      </main>
      <aside style={{borderLeft:"1px solid var(--color-gray-200)",padding:"1.5rem",position:"sticky",top:0,height:"100dvh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1.25rem",paddingBottom:"1.25rem",borderBottom:"1px solid var(--color-gray-200)"}}>
          <div className="avatar" style={{background:"var(--color-primary)"}}>{session?.user?.name?.charAt(0)??"?"}</div>
          <div>
            <div style={{fontWeight:600,fontSize:"var(--font-size-sm)"}}>{session?.user?.name}</div>
            <div style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-500)"}}>{session?.user?.email}</div>
          </div>
        </div>
        <div style={{marginBottom:"1rem"}}>
          <div style={{fontSize:"var(--font-size-xs)",fontWeight:600,color:"var(--color-gray-500)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.5rem"}}>
            {lang==="es"?"Próximo partido":"Next match"}
          </div>
          <div className="card" style={{padding:"0.75rem"}}>
            <div style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-500)",marginBottom:"0.5rem"}}>Jun 11 · 14:00 COL · Grupo A</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontWeight:700}}>
              <span>🇲🇽 México</span>
              <span style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-400)"}}>vs</span>
              <span>Sud. África 🇿🇦</span>
            </div>
          </div>
        </div>
        <div>
          <div style={{fontSize:"var(--font-size-xs)",fontWeight:600,color:"var(--color-gray-500)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.5rem"}}>
            {lang==="es"?"Tu quiniela":"Your pool"}
          </div>
          <div className="card" style={{padding:"0.75rem",textAlign:"center"}}>
            <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🏆</div>
            <div style={{fontWeight:600,fontSize:"var(--font-size-sm)",marginBottom:"0.25rem"}}>{lang==="es"?"Sin grupo aún":"No group yet"}</div>
            <div style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-500)",marginBottom:"0.75rem"}}>{lang==="es"?"Crea o únete a un grupo":"Create or join a group"}</div>
            <button className="btn btn--primary btn--sm btn--full" onClick={()=>router.push("/groups")}>
              {lang==="es"?"Ir a grupos":"Go to groups"}
            </button>
          </div>
        </div>
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
      {statsBar}{tabBar}
      <div style={{paddingBottom:80}}>{tabContent}</div>
      {bottomNav}
    </div>
  )
}
