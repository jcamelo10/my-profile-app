"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLang } from "@/lib/LangContext"
import { t } from "@/lib/i18n"

const TEAMS = ["Algeria","Argentina","Australia","Austria","Belgium","Bosnia & Herz.","Brazil","Canada","Cape Verde","Colombiia","Czechia","Curaçao","Croatia","DR Congo","Ecuador","Egypt","England","France","Germany","Ghana","Haiti","Iran","Iraq","Ivory Coast","Japan","Jordan","Mexico","Morocco","Netherlands","New Zealand","Norway","Panama","Paraguay","Portugal","Qatar","Saudi Arabia","Scotland","Senegal","South Africa","South Korea","Spain","Sweden","Switzerland","Türkiye","Tunisia","Uruguay","USA","Uzbekistan"]

const PLAYERS = ["Kylian Mbappé (FRA)","Erling Haaland (NOR)","Lionel Messi (ARG)","Vinicius Jr. (BRA)","Lamine Yamal (ESP)","Jude Bellingham (ENG)","Rodri (ESP)","Phil Foden (ENG)","Bukayo Saka (ENG)","Cody Gakpo (NED)","Florian Wirtz (GER)","Jamal Musiala (GER)","Pedri (ESP)","Federico Valverde (URU)","Antoine Griezmann (FRA)","Harry Kane (ENG)","Neymar Jr. (BRA)","Ousmane Dembélé (FRA)","Leroy Sané (GER)","Julian Alvarez (ARG)","Emiliano Martínez (ARG)","Thibaut Courtois (BEL)","Alisson Becker (BRA)","Manuel Neuer (GER)","Diogo Costa (POR)","Mike Maignan (FRA)","Jordan Pickford (ENG)","Luis Díaz (COL)","James Rodríguez (COL)","Robert Lewandowski (POL)","Cristiano Ronaldo (POR)","Romelu Lukaku (BEL)"]

interface Picks {
  champion: string
  runnerUp: string
  thirdPlace: string
  topScorer: string
  goldenBall: string
  goldenGlove: string
}

export default function PicksPage() {
  const { status } = useSession()
  const router = useRouter()
  const { lang } = useLang()
  const [picks, setPicks] = useState<Picks>({ champion:"", runnerUp:"", thirdPlace:"", topScorer:"", goldenBall:"", goldenGlove:"" })
  const [locked, setLocked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => { if (status === "unauthenticated") router.push("/") }, [status, router])

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check(); window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/picks").then(r=>r.json()).then(data => {
        if (data.picks) setPicks(data.picks)
        setLocked(data.locked || false)
        setLoading(false)
      })
    }
  }, [status])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch("/api/picks", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(picks) })
    setSaving(false)
    if (res.ok) { setSaved(true); setLocked(true) }
  }

  const allFilled = picks.champion && picks.runnerUp && picks.thirdPlace && picks.topScorer && picks.goldenBall && picks.goldenGlove

  if (status === "loading" || loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100dvh"}}><p className="text-muted">{t(lang,"general.loading")}</p></div>

  const pickItems = [
    { key:"champion" as keyof Picks, label:t(lang,"winner.champion"), pts:"25 pts", options:TEAMS, gold:true },
    { key:"runnerUp" as keyof Picks, label:t(lang,"winner.runnerUp"), pts:"15 pts", options:TEAMS },
    { key:"thirdPlace" as keyof Picks, label:t(lang,"winner.thirdPlace"), pts:"10 pts", options:TEAMS },
    { key:"topScorer" as keyof Picks, label:t(lang,"winner.topScorer"), pts:"20 pts", options:PLAYERS },
    { key:"goldenBall" as keyof Picks, label:t(lang,"winner.goldenBall"), pts:"20 pts", options:PLAYERS },
    { key:"goldenGlove" as keyof Picks, label:t(lang,"winner.goldenGlove"), pts:"15 pts", options:PLAYERS },
  ]

  const content = (
    <div style={{display:"flex",flexDirection:"column",gap:"1.25rem",padding: isDesktop ? "2rem" : "1.25rem"}}>
      {!isDesktop && (
        <div style={{textAlign:"center"}}>
          <h2 style={{fontSize:"var(--font-size-2xl)",fontWeight:800,marginBottom:"0.5rem"}}>{t(lang,"winner.heading")}</h2>
          <p className="text-muted text-sm">{locked ? (lang==="es"?"Tus picks están confirmados.":"Your picks are confirmed.") : t(lang,"winner.subheading")}</p>
        </div>
      )}

      {locked && (
        <div className="card" style={{background:"var(--color-success-light)",border:"1px solid var(--color-success)",textAlign:"center"}}>
          <div style={{fontSize:"1.5rem",marginBottom:"0.25rem"}}>🔒</div>
          <div style={{fontWeight:700,color:"#00863A"}}>{lang==="es"?"Picks confirmados — no se pueden cambiar":"Picks confirmed — cannot be changed"}</div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",gap:"1rem"}}>
        {pickItems.map(({key,label,pts,options,gold})=>(
          <div key={key} className="card" style={{borderTop: gold ? "3px solid var(--color-gold)" : undefined}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
              <label style={{fontWeight:700,fontSize:"var(--font-size-md)"}}>{label}</label>
              <span className="badge badge--primary">{pts}</span>
            </div>
            <select
              className="form-input"
              value={picks[key]}
              onChange={e=>setPicks(p=>({...p,[key]:e.target.value}))}
              disabled={locked}
              style={{cursor:locked?"not-allowed":"pointer"}}
            >
              <option value="">{t(lang,"winner.selectTeam")}</option>
              {options.map(o=><option key={o} value={o}>{o}</option>)}
            </select>
            {picks[key] && (
              <div style={{marginTop:"0.5rem",fontSize:"var(--font-size-sm)",color:"var(--color-primary)",fontWeight:600}}>
                ✓ {picks[key]}
              </div>
            )}
          </div>
        ))}
      </div>

      {!locked && (
        <>
          <div className="card" style={{background:"var(--color-warning-light)",border:"none"}}>
            <p style={{fontSize:"var(--font-size-sm)",color:"var(--color-gray-700)"}}>⚠️ {t(lang,"winner.warning")}</p>
          </div>
          <button className="btn btn--primary btn--lg btn--full" onClick={handleSave} disabled={saving||!allFilled}>
            {saving?"...":saved?"✓ "+t(lang,"general.save"):t(lang,"winner.submit")}
          </button>
          {!allFilled && <p style={{textAlign:"center",fontSize:"var(--font-size-xs)",color:"var(--color-gray-500)"}}>{lang==="es"?"Completa todos los campos para confirmar":"Fill all fields to confirm"}</p>}
        </>
      )}
    </div>
  )

  if (isDesktop) return (
    <div style={{maxWidth:900,margin:"0 auto",minHeight:"100dvh",padding:"2rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"2rem"}}>
        <button className="btn btn--ghost btn--sm" onClick={()=>router.push("/dashboard")}>← {lang==="es"?"Volver":"Back"}</button>
        <div>
          <h1 style={{fontSize:"var(--font-size-3xl)",fontWeight:800}}>{t(lang,"winner.title")}</h1>
          <p className="text-muted text-sm">{locked ? (lang==="es"?"Tus picks están confirmados.":"Your picks are confirmed.") : t(lang,"winner.subheading")}</p>
        </div>
      </div>
      {content}
    </div>
  )

  return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100dvh",background:"#fff"}}>
      <div className="screen-header">
        <button className="screen-header__back" onClick={()=>router.push("/dashboard")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
        <span className="screen-header__title">{t(lang,"winner.title")}</span>
        <div style={{width:36}}/>
      </div>
      {content}
    </div>
  )
}
