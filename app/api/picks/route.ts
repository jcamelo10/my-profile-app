import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectDB()
  const user = await User.findOne({ email: session.user.email })
  return NextResponse.json({ picks: user?.tournamentPicks, locked: user?.picksLocked })
}

export async function PUT(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectDB()
  const user = await User.findOne({ email: session.user.email })
  if (user?.picksLocked) return NextResponse.json({ error: "Picks already locked" }, { status: 403 })
  const body = await req.json()
  const updated = await User.findOneAndUpdate(
    { email: session.user.email },
    { tournamentPicks: body, picksLocked: true },
    { new: true }
  )
  return NextResponse.json({ picks: updated?.tournamentPicks, locked: updated?.picksLocked })
}
