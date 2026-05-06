import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Match from "@/lib/models/Match"

export async function GET() {
  await connectDB()
  const matches = await Match.find().sort({ kickoffUtc: 1 })
  return NextResponse.json(matches)
}
