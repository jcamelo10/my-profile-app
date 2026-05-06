import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Prediction from "@/lib/models/Prediction"
import Match from "@/lib/models/Match"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectDB()
  const predictions = await Prediction.find({ userId: session.user.email })
  return NextResponse.json(predictions)
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { matchId, homeScore, awayScore } = await req.json()
  await connectDB()

  // Check lock — 15 min before kickoff
  const match = await Match.findById(matchId)
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 })
  const lockTime = new Date(match.kickoffUtc.getTime() - 15 * 60 * 1000)
  if (new Date() >= lockTime) return NextResponse.json({ error: "Predictions locked" }, { status: 403 })

  const prediction = await Prediction.findOneAndUpdate(
    { userId: session.user.email, matchId },
    { homeScore, awayScore },
    { upsert: true, new: true }
  )
  return NextResponse.json(prediction)
}
