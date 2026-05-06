"use client"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLang } from "@/lib/LangContext"
import { t } from "@/lib/i18n"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { lang, setLang } = useLang()
  const [activeTab, setActiveTab] = useState("matches")
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

  if (status === "loading") return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100dvh"}}><p>Loading...</p></div>

  const handleNav = (id: string) => id === "picks" ? router.push("/picks") : setActiveTab(id)
  const navIds = ["matches","leaderboard","picks","settings"]
  const navLabels: Record<string,string> = { matches: t(lang,"nav.matches"), leaderboard: t(lang,"nav.leaderboard"), picks: t(lang,"nav.picks"), settings: t(lang,"nav.settings") }

  const statsBar = (
    <div style={{padding:"var(--space-4) var(--space-5)",background:"var(--color-primary)",color:"white",display:"flex",justifyContent:"space-around"}}>
      {[["0",t(lang,"dashboard.points")],["—",t(lang,"dashboard.rank")],["0",t(lang,"dashboard.predicted")]].map(([val,label],i) => (
        <div key={i} style={{textAlign:"center"}}>
          <div style={{fontSize:"var(--font-size-2xl)",fontWeight:"800"}}>{val}</div>
          <div style={{fontSize:"var(--font-size-xs)",opacity:0.8}}>{label}</div>
        </div>
      ))}
    </div>
  )

  const tabBar = (
    <div style={{padding:"var(--space-3) var(--space-5) 0"}}>
      <div className="tabs">
        {["matches","leaderboard","settings"].map(id => (
          <button key={id} className={`tab ${activeTab===id?"tab--active":""}`} onClick={() => setActiveTab(id)}>
            {t(lang, `dashboard.tab${id.charAt(0).toUpperCase()+id.slice(1)}` as any)}
          </button>
        ))}
      </div>
    </div>
  )

  const tabContent = (
    <div style={{padding:"var(--space-5)"}}>
      {activeTab==="matches" && <p className="text-muted text-sm">{lang==="es"?"Los partidos aparecerán aquí próximamente.":"Matches will appear here soon."}</p>}
      {activeTab==="leaderboard" && <p className="text-muted text-sm">{lang==="es"?"La tabla aparecerá pronto.":"Leaderboard coming soon."}</p>}
      {activeTab==="settings" && (
        <div style={{display:"flex",flexDirection:"column",gap:"var(--space-4)"}}>
          <div className="card">
            <div style={{display:"flex",alignItems:"center",gap:"var(--space-3)"}}>
              <div className="avatar" style={{background:"var(--color-primary)"}}>{session?.user?.name?.charAt(0)??"?"}</div>
              <div>
                <div style={{fontWeight:"600"}}>{session?.user?.name}</div>
                <div className="text-sm text-muted">{session?.user?.email}</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{display:"flex",gap:"var(--space-2)"}}>
              <button className={`btn btn--sm ${lang==="en"?"btn--primary":"btn--secondary"}`} onClick={() => setLang("en")}>English</button>
              <button className={`btn btn--sm ${lang==="es"?"btn--primary":"btn--secondary"}`} onClick={() => setLang("es")}>Español</button>
            </div>
          </div>
          <div className="card">
            <button className="btn btn--secondary btn--full" onClick={() => signOut({callbackUrl:"/"})}>{t(lang,"settings.signOut")}</button>
          </div>
        </div>
      )}
    </div>
  )

  const sidebarNav = (
    <div style={{display:"flex",flexDirection:"column",gap:"var(--space-2)",height:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:"var(--space-3)",marginBottom:"var(--space-6)"}}>
        <div style={{width:36,height:36,background:"var(--color-primary)",borderRadius:"var(--radius-md)",display:"flex",alignItems:"center",justifyContent:"center"}}>⚽</div>
        <span style={{fontSize:"var(--font-size-xl)",fontWeight:"800"}}>POLLON</span>
      </div>
      {navIds.map(id => (
        <button key={id} onClick={() => handleNav(id)} style={{display:"flex",alignItems:"center",gap:"var(--space-3)",padding:"var(--space-3) var(--space-4)",borderRadius:"var(--radius-lg)",border:"none",cursor:"pointer",background:activeTab===id?"var(--color-primary-light)":"transparent",color:activeTab===id?"var(--color-primary)":"var(--color-gray-700)",fontWeight:activeTab===id?"600":"500",fontSize:"var(--font-size-base)",width:"100%",textAlign:"left"}}>
          {navLabels[id]}
        </button>
      ))}
      <div style={{marginTop:"auto",paddingTop:"var(--space-6)",borderTop:"1px solid var(--color-gray-200)",display:"flex",gap:"var(--space-2)"}}>
        <button className={`btn btn--sm ${lang==="en"?"btn--primary":"btn--secondary"}`} onClick={() => setLang("en")}>EN</button>
        <button className={`btn btn--sm ${lang==="es"?"btn--primary":"btn--secondary"}`} onClick={() => setLang("es")}>ES</button>
      </div>
    </div>
  )

  if (isDesktop) return (
    <div style={{display:"grid",gridTemplateColumns:"240px 1fr 280px",maxWidth:1200,margin:"0 auto",minHeight:"100dvh",background:"var(--color-white)",boxShadow:"var(--shadow-xl)"}}>
      <aside style={{borderRight:"1px solid var(--color-gray-200)",padding:"var(--space-6)",position:"sticky",top:0,height:"100dvh",overflowY:"auto"}}>{sidebarNav}</aside>
      <main style={{overflowY:"auto"}}>{statsBar}{tabBar}{tabContent}</main>
      <aside style={{borderLeft:"1px solid var(--color-gray-200)",padding:"var(--space-6)",position:"sticky",top:0,height:"100dvh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:"var(--space-3)",marginBottom:"var(--space-4)"}}>
          <div className="avatar" style={{background:"var(--color-primary)"}}>{session?.user?.name?.charAt(0)??"?"}</div>
          <div>
            <div style={{fontWeight:"600",fontSize:"var(--font-size-sm)"}}>{session?.user?.name}</div>
            <div style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-500)"}}>{session?.user?.email}</div>
          </div>
        </div>
        <p className="text-sm text-muted">{lang==="es"?"El torneo comienza el 11 de junio.":"Tournament starts June 11."}</p>
      </aside>
    </div>
  )

  return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100dvh",position:"relative"}}>
      <div className="screen-header">
        <div style={{display:"flex",alignItems:"center",gap:"var(--space-3)"}}>
          <div style={{width:32,height:32,background:"var(--color-primary)",borderRadius:"var(--radius-md)",display:"flex",alignItems:"center",justifyContent:"center"}}>⚽</div>
          <span className="screen-header__title">POLLON</span>
        </div>
        <div style={{display:"flex",gap:"var(--space-2)"}}>
          <button className={`btn btn--sm ${lang==="en"?"btn--primary":"btn--ghost"}`} onClick={() => setLang("en")}>EN</button>
          <button className={`btn btn--sm ${lang==="es"?"btn--primary":"btn--ghost"}`} onClick={() => setLang("es")}>ES</button>
        </div>
      </div>
      {statsBar}{tabBar}
      <div style={{paddingBottom:80}}>{tabContent}</div>
      <nav className="bottom-nav">
        {navIds.map(id => (
          <button key={id} className={`bottom-nav__item ${activeTab===id?"bottom-nav__item--active":""}`} onClick={() => handleNav(id)}>
            <span>{navLabels[id]}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}