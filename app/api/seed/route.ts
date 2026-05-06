import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Match from "@/lib/models/Match"
import { groupStageMatches } from "@/lib/seedMatches"

export async function POST() {
  await connectDB()
  await Match.deleteMany({ stage: "group" })
  await Match.insertMany(groupStageMatches)
  return NextResponse.json({ ok: true, count: groupStageMatches.length })
}
