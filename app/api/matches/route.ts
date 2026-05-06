import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Match from "@/lib/models/Match"

export async function GET(req: Request) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (id) {
    const match = await Match.findById(id)
    if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(match)
  }

  const matches = await Match.find().sort({ kickoffUtc: 1 })
  return NextResponse.json(matches)
}
