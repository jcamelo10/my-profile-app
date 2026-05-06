"use client"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useLang } from "@/lib/LangContext"
import { t } from "@/lib/i18n"

export default function WelcomePage() {
  const { status } = useSession()
  const router = useRouter()
  const { lang, setLang } = useLang()

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard")
  }, [status, router])

  if (status === "loading") return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100dvh"}}>
      <p className="text-muted">Cargando...</p>
    </div>
  )

  return (
    <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",background:"linear-gradient(180deg,#ffffff 0%,#f0f3ff 100%)",minHeight:"100dvh",padding:"var(--space-8) var(--space-6)"}}>
      <div style={{width:80,height:80,background:"var(--color-primary)",borderRadius:"var(--radius-2xl)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",marginBottom:"var(--space-3)",boxShadow:"var(--shadow-lg)"}}>
        <span style={{fontSize:"2.5rem"}}>⚽</span>
      </div>
      <h1 style={{fontSize:"var(--font-size-4xl)",fontWeight:800,letterSpacing:"-0.02em",color:"var(--color-secondary)",marginBottom:"var(--space-2)"}}>POLLON</h1>
      <p style={{fontSize:"var(--font-size-md)",color:"var(--color-gray-600)",marginBottom:"var(--space-1)",fontWeight:500}}>{t(lang,"welcome.subtitle")}</p>
      <p style={{fontSize:"var(--font-size-base)",color:"var(--color-gray-500)",marginBottom:"var(--space-10)",maxWidth:280}}>{t(lang,"welcome.description")}</p>
      <div style={{display:"flex",gap:"var(--space-2)",marginBottom:"var(--space-10)",fontSize:"1.5rem",opacity:0.8}}>🇺🇸 🇨🇦 🇲🇽</div>
      <div style={{width:"100%",maxWidth:320,display:"flex",flexDirection:"column",gap:"var(--space-3)"}}>
        <button className="btn btn--primary btn--lg btn--full" onClick={() => signIn("google")}>{t(lang,"welcome.getStarted")}</button>
        <button className="btn btn--secondary btn--lg btn--full" onClick={() => signIn("google")}>{t(lang,"welcome.login")}</button>
      </div>
      <div style={{marginTop:"var(--space-10)",display:"flex",gap:"var(--space-4)"}}>
        <button className={"btn btn--sm "+(lang==="en"?"btn--primary":"btn--ghost")} onClick={()=>setLang("en")}>EN</button>
        <button className={"btn btn--sm "+(lang==="es"?"btn--primary":"btn--ghost")} onClick={()=>setLang("es")}>ES</button>
      </div>
    </div>
  )
}
