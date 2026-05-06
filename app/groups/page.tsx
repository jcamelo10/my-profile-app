"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLang } from "@/lib/LangContext"
import { t } from "@/lib/i18n"

type View = "choice"|"create"|"join"|"invite"

export default function GroupsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { lang } = useLang()
  const [view, setView] = useState<View>("choice")
  const [groupName, setGroupName] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [createdCode, setCreatedCode] = useState("")
  const [createdName, setCreatedName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/")
  }, [status, router])

  const handleCreate = async () => {
    if (!groupName.trim()) return
    setLoading(true); setError("")
    const res = await fetch("/api/groups", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action:"create",name:groupName}) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setCreatedCode(data.inviteCode)
    setCreatedName(data.name)
    setView("invite")
  }

  const handleJoin = async () => {
    if (!inviteCode.trim()) return
    setLoading(true); setError("")
    const res = await fetch("/api/groups", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action:"join",code:inviteCode}) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push("/dashboard")
  }

  const copyCode = () => {
    navigator.clipboard.writeText(createdCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (status === "loading") return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100dvh"}}><p className="text-muted">{t(lang,"general.loading")}</p></div>

  return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100dvh",background:"#fff"}}>
      <div className="screen-header">
        <button className="screen-header__back" onClick={() => view==="choice" ? router.push("/dashboard") : setView("choice")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
        <span className="screen-header__title">{t(lang,"groups.choiceTitle")}</span>
        <div style={{width:36}}/>
      </div>

      <div style={{padding:"1.25rem",display:"flex",flexDirection:"column",gap:"1.25rem"}}>
        {view === "choice" && (
          <>
            <div style={{textAlign:"center",paddingTop:"1rem"}}>
              <h2 style={{fontSize:"var(--font-size-2xl)",fontWeight:800,marginBottom:"0.5rem"}}>{t(lang,"groups.choiceHeading")}</h2>
              <p className="text-muted text-sm">{t(lang,"groups.choiceDesc")}</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.75rem",paddingTop:"0.5rem"}}>
              <button className="card" style={{border:"1.5px solid var(--color-gray-200)",cursor:"pointer",textAlign:"left",transition:"all 150ms ease"}} onClick={() => setView("create")}>
                <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
                  <div style={{width:44,height:44,background:"var(--color-primary-light)",borderRadius:"var(--radius-lg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",flexShrink:0}}>🏆</div>
                  <div>
                    <div style={{fontWeight:700,marginBottom:"0.25rem"}}>{t(lang,"groups.createTitle")}</div>
                    <div style={{fontSize:"var(--font-size-sm)",color:"var(--color-gray-500)"}}>{t(lang,"groups.createDesc")}</div>
                  </div>
                </div>
              </button>
              <button className="card" style={{border:"1.5px solid var(--color-gray-200)",cursor:"pointer",textAlign:"left",transition:"all 150ms ease"}} onClick={() => setView("join")}>
                <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
                  <div style={{width:44,height:44,background:"var(--color-success-light)",borderRadius:"var(--radius-lg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",flexShrink:0}}>🤝</div>
                  <div>
                    <div style={{fontWeight:700,marginBottom:"0.25rem"}}>{t(lang,"groups.joinTitle")}</div>
                    <div style={{fontSize:"var(--font-size-sm)",color:"var(--color-gray-500)"}}>{t(lang,"groups.joinDesc")}</div>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {view === "create" && (
          <>
            <div style={{textAlign:"center",paddingTop:"0.5rem"}}>
              <h2 style={{fontSize:"var(--font-size-2xl)",fontWeight:800,marginBottom:"0.5rem"}}>{t(lang,"groups.nameHeading")}</h2>
              <p className="text-muted text-sm">{t(lang,"groups.nameDesc")}</p>
            </div>
            <div className="form-group">
              <label className="form-label">{t(lang,"groups.groupName")}</label>
              <input className="form-input" placeholder={lang==="es"?"Ej: Los Campeones":"E.g. The Champions"} maxLength={40} value={groupName} onChange={e=>setGroupName(e.target.value)}/>
              <span className="form-helper">{groupName.length}/40 {t(lang,"groups.nameHelper")}</span>
            </div>
            <div className="card" style={{background:"var(--color-primary-lighter)",border:"none"}}>
              <div style={{fontWeight:600,marginBottom:"0.25rem",fontSize:"var(--font-size-sm)"}}>{t(lang,"groups.adminNote")}</div>
              <div style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-600)"}}>{t(lang,"groups.adminDesc")}</div>
            </div>
            {error && <p style={{color:"var(--color-error)",fontSize:"var(--font-size-sm)"}}>{error}</p>}
            <button className="btn btn--primary btn--lg btn--full" onClick={handleCreate} disabled={loading||!groupName.trim()}>
              {loading ? "..." : t(lang,"groups.createBtn")}
            </button>
          </>
        )}

        {view === "join" && (
          <>
            <div style={{textAlign:"center",paddingTop:"0.5rem"}}>
              <h2 style={{fontSize:"var(--font-size-2xl)",fontWeight:800,marginBottom:"0.5rem"}}>{t(lang,"groups.joinHeading")}</h2>
              <p className="text-muted text-sm">{t(lang,"groups.joinSubheading")}</p>
            </div>
            <div className="form-group">
              <label className="form-label">{t(lang,"groups.inviteCode")}</label>
              <input className="form-input" placeholder="ABC123" maxLength={6} value={inviteCode} onChange={e=>setInviteCode(e.target.value.toUpperCase())} style={{textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:700}}/>
            </div>
            {error && <p style={{color:"var(--color-error)",fontSize:"var(--font-size-sm)"}}>{lang==="es"?"Código inválido. Intenta de nuevo.":"Invalid code. Try again."}</p>}
            <button className="btn btn--primary btn--lg btn--full" onClick={handleJoin} disabled={loading||inviteCode.length<6}>
              {loading ? "..." : t(lang,"groups.joinBtn")}
            </button>
          </>
        )}

        {view === "invite" && (
          <>
            <div style={{textAlign:"center",paddingTop:"1rem"}}>
              <div style={{fontSize:"3rem",marginBottom:"0.75rem"}}>🎉</div>
              <h2 style={{fontSize:"var(--font-size-2xl)",fontWeight:800,marginBottom:"0.5rem"}}>{t(lang,"invite.heading")}</h2>
              <p style={{fontSize:"var(--font-size-lg)",fontWeight:600,color:"var(--color-primary)",marginBottom:"0.5rem"}}>{createdName}</p>
              <p className="text-muted text-sm">{t(lang,"invite.subheading")}</p>
            </div>
            <div className="card" style={{textAlign:"center",background:"var(--color-primary-lighter)",border:"2px dashed var(--color-primary)"}}>
              <div style={{fontSize:"var(--font-size-xs)",color:"var(--color-gray-600)",marginBottom:"0.5rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t(lang,"groups.inviteCode")}</div>
              <div style={{fontSize:"var(--font-size-4xl)",fontWeight:800,letterSpacing:"0.15em",color:"var(--color-primary)"}}>{createdCode}</div>
            </div>
            <p className="text-muted text-sm" style={{textAlign:"center"}}>{t(lang,"invite.note")}</p>
            <button className="btn btn--secondary btn--full" onClick={copyCode}>
              {copied ? "✓ "+( lang==="es"?"Copiado!":"Copied!") : t(lang,"invite.copyCode")}
            </button>
            <button className="btn btn--primary btn--lg btn--full" onClick={() => router.push("/dashboard")}>
              {t(lang,"invite.continue")}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
