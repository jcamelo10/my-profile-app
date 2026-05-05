import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()
  const user = await User.findOne({ email: session.user.email })
  return NextResponse.json(user)
}

export async function PUT(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { fullName, age, favoriteFood, favoriteTeam } = body

  await connectDB()
  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { fullName, age, favoriteFood, favoriteTeam },
    { new: true }
  )

  return NextResponse.json(user)
}