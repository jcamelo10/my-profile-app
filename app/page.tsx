"use client"

import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useLang } from "@/lib/LangContext"
import { t } from "@/lib/i18n"

export default function WelcomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { lang, setLang } = useLang()

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard")
  }, [status, router])

  if (status === "loading") return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100dvh"}}><p>Cargando...</p></div>

  return (
    <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",background:"linear-gradient(180deg, #ffffff 0%, #f0f3ff 100%)",minHeight:"100dvh",padding:"2rem"}}>
      <div style={{width:80,height:80,background:"#304FFE",borderRadius:"1.5rem",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem",boxShadow:"0 10px 15px -3px rgba(0,0,0,0.08)"}}>
        <span style={{fontSize:"2.5rem"}}>⚽</span>
      </div>
      <h1 style={{fontSize:"2.25rem",fontWeight:800,color:"#000001",marginBottom:"0.5rem"}}>POLLON</h1>
      <p style={{color:"#757575",marginBottom:"0.25rem",fontWeight:500}}>{t(lang,"welcome.subtitle")}</p>
      <p style={{color:"#9E9E9E",marginBottom:"2.5rem",maxWidth:280}}>{t(lang,"welcome.description")}</p>
      <div style={{display:"flex",gap:"0.5rem",marginBottom:"2.5rem",fontSize:"1.5rem",opacity:0.8}}>🇺🇸 🇨🇦 🇲🇽</div>
      <div style={{width:"100%",maxWidth:320,display:"flex",flexDirection:"column",gap:"0.75rem"}}>
        <button className="btn btn--primary btn--lg btn--full" onClick={() => signIn("google")}>{t(lang,"welcome.getStarted")}</button>
        <button className="btn btn--secondary btn--lg btn--full" onClick={() => signIn("google")}>{t(lang,"welcome.login")}</button>
      </div>
      <div style={{marginTop:"2.5rem",display:"flex",gap:"1rem"}}>
        <button className={"btn btn--sm " + (lang==="en" ? "btn--primary" : "btn--ghost")} onClick={() => setLang("en")}>EN</button>
        <button className={"btn btn--sm " + (lang==="es" ? "btn--primary" : "btn--ghost")} onClick={() => setLang("es")}>ES</button>
      </div>
    </div>
  )
}
