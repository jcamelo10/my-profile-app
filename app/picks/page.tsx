"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLang } from "@/lib/LangContext"
import { t } from "@/lib/i18n"

const TEAMS = ["Mexico","South Korea","South Africa","Czechia","Canada","Switzerland","Qatar","Bosnia & Herz.","Brazil","Morocco","Scotland","Haiti","USA","Australia","Paraguay","Türkiye","Germany","Curaçao","Ivory Coast","Ecuador","Netherlands","Japan","Sweden","Tunisia","Belgium","Iran","Egypt","New Zealand","Spain","Cape Verde","Saudi Arabia","Uruguay","France","Senegal","Iraq","Norway","Argentina","Algeria","Austria","Jordan","Portugal","DR Congo","Uzbekistan","Colombia","England","Croatia","Ghana","Panama"]

const PLAYERS = ["Kylian Mbappé (FRA)","Erling Haaland (NOR)","Lionel Messi (ARG)","Vinicius Jr. (BRA)","Lamine Yamal (ESP)","Jude Bellingham (ENG)","Rodri (ESP)","Phil Foden (ENG)","Bukayo Saka (ENG)","Cody Gakpo (NED)","Florian Wirtz (GER)","Jamal Musiala (GER)","Pedri (ESP)","Federico Valverde (URU)","Antoine Griezmann (FRA)","Harry Kane (ENG)","Marcus Rashford (ENG)","Neymar Jr. (BRA)","Ousmane Dembélé (FRA)","Leroy Sané (GER)","Julian Alvarez (ARG)","Emiliano Martínez (ARG)","Thibaut Courtois (BEL)","Alisson Becker (BRA)","Manuel Neuer (GER)","Diogo Costa (POR)","Gianluigi Donnarumma (ITA)","Yassine Bounou (MAR)","Mike Maignan (FRA)","Jordan Pickford (ENG)"]

export default function PicksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { lang } = useLang()
  const [picks, setPicks] = useState({ champion:"", runnerUp:"", thirdPlace:"", topScorer:"", goldenBall:"", goldenGlove:"" })
  const [locked, setLocked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/")
  }, [status, router])

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

  const Select = ({ label, value, onChange, options, pts }: { label:string, value:string, onChange:(v:string)=>void, options:string[], pts:string }) => (
    <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <label className="form-label">{label}</label>
        <span className="badge badge--primary">{pts}</span>
      </div>
      <select className="form-input" value={value} onChange={e=>onChange(e.target.value)} disabled={locked} style={{cursor:locked?"not-allowed":"pointer"}}>
        <option value="">{t(lang,"winner.selectTeam")}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
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

      <div style={{padding:"1.25rem",display:"flex",flexDirection:"column",gap:"1.25rem"}}>
        <div style={{textAlign:"center"}}>
          <h2 style={{fontSize:"var(--font-size-2xl)",fontWeight:800,marginBottom:"0.5rem"}}>{t(lang,"winner.heading")}</h2>
          <p className="text-muted text-sm">{locked ? (lang==="es"?"Tus picks están confirmados y no se pueden cambiar.":"Your picks are confirmed and cannot be changed.") : t(lang,"winner.subheading")}</p>
        </div>

        {locked && (
          <div className="card" style={{background:"var(--color-success-light)",border:"1px solid var(--color-success)",textAlign:"center"}}>
            <div style={{fontSize:"1.5rem",marginBottom:"0.25rem"}}>🔒</div>
            <div style={{fontWeight:600,color:"#00863A",fontSize:"var(--font-size-sm)"}}>{lang==="es"?"Picks confirmados":"Picks confirmed"}</div>
          </div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          <div className="card" style={{borderTop:"3px solid var(--color-gold)"}}>
            <Select label={t(lang,"winner.champion")} value={picks.champion} onChange={v=>setPicks(p=>({...p,champion:v}))} options={TEAMS} pts="25 pts"/>
          </div>
          <div className="card">
            <Select label={t(lang,"winner.runnerUp")} value={picks.runnerUp} onChange={v=>setPicks(p=>({...p,runnerUp:v}))} options={TEAMS} pts="15 pts"/>
          </div>
          <div className="card">
            <Select label={t(lang,"winner.thirdPlace")} value={picks.thirdPlace} onChange={v=>setPicks(p=>({...p,thirdPlace:v}))} options={TEAMS} pts="10 pts"/>
          </div>
          <div className="card" style={{borderTop:"3px solid var(--color-primary)"}}>
            <Select label={t(lang,"winner.topScorer")} value={picks.topScorer} onChange={v=>setPicks(p=>({...p,topScorer:v}))} options={PLAYERS} pts="20 pts"/>
          </div>
          <div className="card">
            <Select label={t(lang,"winner.goldenBall")} value={picks.goldenBall} onChange={v=>setPicks(p=>({...p,goldenBall:v}))} options={PLAYERS} pts="20 pts"/>
          </div>
          <div className="card">
            <Select label={t(lang,"winner.goldenGlove")} value={picks.goldenGlove} onChange={v=>setPicks(p=>({...p,goldenGlove:v}))} options={PLAYERS} pts="15 pts"/>
          </div>
        </div>

        {!locked && (
          <>
            <div className="card" style={{background:"var(--color-warning-light)",border:"none"}}>
              <p style={{fontSize:"var(--font-size-sm)",color:"var(--color-gray-700)"}}> ⚠️ {t(lang,"winner.warning")}</p>
            </div>
            <button className="btn btn--primary btn--lg btn--full" onClick={handleSave} disabled={saving||!allFilled}>
              {saving ? "..." : saved ? "✓ "+t(lang,"general.save") : t(lang,"winner.submit")}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
