"use client"

import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/profile")
    }
  }, [status, router])

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading...</p>
  }

  return (
    <main style={{ padding: "4rem", textAlign: "center" }}>
      <h1>My Profile App</h1>
      <p>Sign in to view and edit your profile.</p>
      <button onClick={() => signIn("google")}>
        Sign in with Google
      </button>
    </main>
  )
}