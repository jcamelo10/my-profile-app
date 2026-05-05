"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface League {
  id: number
  name: string
  ccode: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [age, setAge] = useState("")
  const [favoriteFood, setFavoriteFood] = useState("")
  const [favoriteTeam, setFavoriteTeam] = useState("")
  const [leagues, setLeagues] = useState<League[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  // Load profile data
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          setFullName(data.fullName || "")
          setAge(data.age || "")
          setFavoriteFood(data.favoriteFood || "")
          setFavoriteTeam(data.favoriteTeam || "")
        })
    }
  }, [status])

 // Load football leagues
  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => {
        if (data.response?.leagues) {
          setLeagues(data.response.leagues)
        }
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, age: Number(age), favoriteFood, favoriteTeam }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (status === "loading") return <p style={{ padding: "2rem" }}>Loading...</p>

  return (
    <main style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h1>My Profile</h1>
      <p style={{ color: "gray", marginBottom: "2rem" }}>{session?.user?.email}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>

        <div>
          <label>Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>

        <div>
          <label>Favorite Food</label>
          <input
            type="text"
            value={favoriteFood}
            onChange={(e) => setFavoriteFood(e.target.value)}
            style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>

        <div>
          <label>Favorite Football Team</label>
          <select
            value={favoriteTeam}
            onChange={(e) => setFavoriteTeam(e.target.value)}
            style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          >
            <option value="">Select a league/team...</option>
           {leagues.map((league) => (
  <option key={league.id} value={league.name}>
    {league.name} ({league.ccode})
  </option>
))}
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "0.75rem", marginTop: "1rem", cursor: "pointer" }}
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
        </button>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        style={{ marginTop: "2rem", padding: "0.5rem 1rem", cursor: "pointer" }}
      >
        Sign out
      </button>
    </main>
  )
}