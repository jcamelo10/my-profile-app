"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading...</p>
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Welcome, {session?.user?.name}</h1>
      <p>{session?.user?.email}</p>
      <button onClick={() => signOut({ callbackUrl: "/" })}>
        Sign out
      </button>
      <p style={{ marginTop: "2rem", color: "gray" }}>
        Profile form coming in Phase 3 & 4.
      </p>
    </main>
  )
}