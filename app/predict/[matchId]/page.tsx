"use client"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useLang } from "@/lib/LangContext"
import { t } from "@/lib/i18n"

interface Match {
  _id: string
  matchNumber: number
  group: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  kickoffUtc: string
  venue: string
  homeScore: number|null
  awayScore: number|null
  isFinished: boolean
}

function formatColTime(utcStr: string) {
  const d = new Date(utcStr)
  return d.toLocaleString("es-CO", { timeZone:"America/Bogota", dateStyle:"medium", timeStyle:"short" })
}

function isLocked(kickoffUtc: string) {
  const kickoff = new Date(kickoffUtc)
  const lock = new Date(kickoff.getTime() - 15 * 60 * 1000)
  return new Date() >= lock
}

export default function PredictPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { lang } = useLang()
  const [match, setMatch] = useState<Match|null>(null)
  const [home, setHome] = useState("")
  const [away, setAway] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/")
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/matches").then(r=>r.json()).then((matches: Match[]) => {
        const m = matches[Number(params.matchId)]
        setMatch(m || null)
        setLoading(false)
      })
    }
  }, [status, params.matchId])

  const handleSubmit = async () => {
    if (!match || home==="" || away==="") return
    setSaving(true); setError("")
    const res = await fetch("/api/predictions", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ matchId: match._id, homeScore: Number(home), awayScore: Number(away) })
    })
    setSaving(false)
    if (!res.ok) { const d = await res.json(); setError(d.error); return }
    setSaved(true)
    setTimeout(() => router.push("/dashboard"), 1500)
  }

  if (status === "loading" || loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100dvh"}}><p className="text-muted">{t(lang,"general.loading")}</p></div>

  if (!match) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100dvh",gap:"1rem"}}>
      <p className="text-muted">{lang==="es"?"Partido no encontrado":"Match not found"}</p>
      <button className="btn btn--secondary" onClick={()=>router.push("/dashboard")}>{lang==="es"?"Volver":"Go back"}</button>
    </div>
  )

  const locked = isLocked(match.kickoffUtc)

  return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100dvh",background:"#fff"}}>
      <div className="screen-header">
        <button className="screen-header__back" onClick={()=>router.push("/dashboard")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
        <span className="screen-header__title">{t(lang,"score.title")}</span>
        <div style={{width:36}}/>
      </div>

      <div style={{padding:"1.25rem",display:"flex",flexDirection:"column",alignItems:"center",gap:"1.5rem"}}>
        <div style={{textAlign:"center"}}>
          <span className="badge badge--neutral" style={{marginBottom:"0.75rem"}}>{lang==="es"?"Grupo":"Group"} {match.group}</span>
          <div style={{fontSize:"var(--font-size-sm)",color:"var(--color-gray-500)",marginTop:"0.5rem"}}>{formatColTime(match.kickoffUtc)} COL</div>
          <div style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-400)",marginTop:"0.25rem"}}>{match.venue}</div>
        </div>

        {match.isFinished ? (
          <div className="card" style={{width:"100%",textAlign:"center"}}>
            <div style={{fontSize:"var(--font-size-sm)",color:"var(--color-gray-500)",marginBottom:"0.5rem"}}>{lang==="es"?"Resultado final":"Final score"}</div>
            <div style={{fontSize:"var(--font-size-3xl)",fontWeight:800}}>{match.homeScore} - {match.awayScore}</div>
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",gap:"1.5rem",width:"100%",justifyContent:"center"}}>
            <div style={{textAlign:"center",flex:1}}>
              <div style={{fontSize:"3rem",marginBottom:"0.5rem"}}>{match.homeFlag}</div>
              <div style={{fontWeight:700,fontSize:"var(--font-size-md)",marginBottom:"1rem"}}>{match.homeTeam}</div>
              <input type="number" className="score-input__field" min={0} max={20} placeholder="—" value={home} onChange={e=>setHome(e.target.value)} disabled={locked} style={{margin:"0 auto"}}/>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",paddingBottom:"0.5rem"}}>
              <div style={{width:40,height:40,background:"var(--color-gray-100)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"var(--font-size-sm)",fontWeight:700,color:"var(--color-gray-400)"}}>VS</div>
            </div>
            <div style={{textAlign:"center",flex:1}}>
              <div style={{fontSize:"3rem",marginBottom:"0.5rem"}}>{match.awayFlag}</div>
              <div style={{fontWeight:700,fontSize:"var(--font-size-md)",marginBottom:"1rem"}}>{match.awayTeam}</div>
              <input type="number" className="score-input__field" min={0} max={20} placeholder="—" value={away} onChange={e=>setAway(e.target.value)} disabled={locked} style={{margin:"0 auto"}}/>
            </div>
          </div>
        )}

        {locked ? (
          <div className="card" style={{width:"100%",background:"var(--color-gray-50)",border:"none",textAlign:"center"}}>
            <div style={{fontSize:"1.5rem",marginBottom:"0.5rem"}}>🔒</div>
            <p style={{fontSize:"var(--font-size-sm)",color:"var(--color-gray-600)"}}>{t(lang,"score.locked")}</p>
          </div>
        ) : (
          <>
            <div style={{display:"flex",alignItems:"flex-start",gap:"0.5rem",padding:"0.75rem 1rem",background:"var(--color-warning-light)",borderRadius:"var(--radius-lg)",width:"100%"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{fontSize:"var(--font-size-sm)",color:"var(--color-gray-700)"}}>{t(lang,"score.deadline")}</span>
            </div>
            <div className="card" style={{width:"100%",background:"var(--color-gray-50)",border:"none"}}>
              <div style={{fontWeight:600,marginBottom:"0.75rem",fontSize:"var(--font-size-sm)"}}>{t(lang,"score.howScoring")}</div>
              {[[t(lang,"score.rule1"),"var(--color-primary)"],[t(lang,"score.rule2"),"var(--color-primary)"],[t(lang,"score.rule3"),"var(--color-primary)"],[t(lang,"score.rule4"),"var(--color-success)"],[t(lang,"score.rule5"),"var(--color-gray-500)"]].map(([rule,color],i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.25rem 0",fontSize:"var(--font-size-sm)"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0}}/>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
            {error && <p style={{color:"var(--color-error)",fontSize:"var(--font-size-sm)"}}>{error}</p>}
            <div style={{width:"100%",display:"flex",flexDirection:"column",gap:"0.5rem"}}>
              {saved ? (
                <div style={{textAlign:"center",padding:"1rem",background:"var(--color-success-light)",borderRadius:"var(--radius-lg)"}}>
                  <span style={{fontWeight:600,color:"#00863A"}}>✓ {lang==="es"?"Predicción guardada":"Prediction saved"}</span>
                </div>
              ) : (
                <button className="btn btn--primary btn--lg btn--full" onClick={handleSubmit} disabled={saving||home===""||away===""}>
                  {saving?"...":t(lang,"score.submit")}
                </button>
              )}
              <p style={{textAlign:"center",fontSize:"var(--font-size-xs)",color:"var(--color-gray-400)"}}>{t(lang,"score.noChange")}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
