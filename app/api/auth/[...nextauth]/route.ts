import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { connectDB } from "@/lib/mongodb"
import User from "@/lib/models/User"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      await connectDB()
      const existing = await User.findOne({ email: user.email })
      if (!existing) {
        await User.create({
          email: user.email,
          fullName: user.name || "",
        })
      }
      return true
    },
    async session({ session }) {
      return session
    },
  },
  pages: {
    signIn: "/",
  },
})

export { handler as GET, handler as POST }