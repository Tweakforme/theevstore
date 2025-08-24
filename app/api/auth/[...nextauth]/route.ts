// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {  // ← ADD 'export' here
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text" },
        loginType: { label: "Login Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.loginType) return null

        try {
          if (credentials.loginType === "admin") {
            if (credentials.username === "Hodder" && credentials.password === "Hodder123!") {
              let adminUser = await prisma.user.findFirst({
                where: { 
                  email: "admin@theevstore.ca", 
                  role: "ADMIN" 
                }
              })

              if (!adminUser) {
                const hashedPassword = await bcrypt.hash("Hodder123!", 12)
                adminUser = await prisma.user.create({
                  data: {
                    email: "admin@theevstore.ca",
                    name: "Hodder Admin",
                    password: hashedPassword,
                    role: "ADMIN"
                  }
                })
              }

              return {
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
                role: adminUser.role
              }
            }
            return null
            
          } else if (credentials.loginType === "customer") {
            if (!credentials.email || !credentials.password) return null

            const user = await prisma.user.findUnique({
              where: { 
                email: credentials.email,
                role: "CUSTOMER"
              }
            })

            if (!user || !user.password) return null

            const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
            
            if (!isPasswordValid) return null

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            }
          }
          
          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        } finally {
          await prisma.$disconnect()
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/login"
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }