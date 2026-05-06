import { connectDB } from "@/lib/mongodb"
import Match from "@/lib/models/Match"
import { groupStageMatches } from "@/lib/seedMatches"

let seeded = false

export async function seedMatchesOnce() {
  if (seeded) return
  seeded = true
  try {
    await connectDB()
    const count = await Match.countDocuments()
    if (count === 0) {
      await Match.insertMany(groupStageMatches)
      console.log("✅ Seeded", groupStageMatches.length, "matches")
    }
  } catch (e) {
    console.error("Seed error:", e)
  }
}
