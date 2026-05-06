import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Group from "@/lib/models/Group"
import User from "@/lib/models/User"

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { action, name, code } = await req.json()
  await connectDB()
  if (action === "create") {
    let inviteCode = generateCode()
    while (await Group.findOne({ inviteCode })) inviteCode = generateCode()
    const group = await Group.create({ name, inviteCode, adminEmail: session.user.email, members: [session.user.email] })
    await User.findOneAndUpdate({ email: session.user.email }, { groupId: group._id.toString() })
    return NextResponse.json(group)
  }
  if (action === "join") {
    const group = await Group.findOne({ inviteCode: code.toUpperCase() })
    if (!group) return NextResponse.json({ error: "Invalid code" }, { status: 404 })
    if (group.members.length >= 30) return NextResponse.json({ error: "Group is full" }, { status: 400 })
    if (!group.members.includes(session.user.email)) { group.members.push(session.user.email); await group.save() }
    await User.findOneAndUpdate({ email: session.user.email }, { groupId: group._id.toString() })
    return NextResponse.json(group)
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectDB()
  const user = await User.findOne({ email: session.user.email })
  if (!user?.groupId) return NextResponse.json(null)
  const group = await Group.findById(user.groupId)
  return NextResponse.json(group)
}
