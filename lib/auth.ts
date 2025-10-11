import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { sql } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

async function generateToken(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(JWT_SECRET))
}

function setAuthCookie(token: string) {
  cookies().set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

function clearAuthCookie() {
  cookies().delete("auth_token")
}

// Add the getCurrentUser function
export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")

  if (!token) {
    return null
  }

  try {
    // Verify the token
    const verified = await jwtVerify(token.value, new TextEncoder().encode(JWT_SECRET))

    const userId = verified.payload.id

    // Get user from database
    const result = await sql`
      SELECT id, username, email, bio, created_at
      FROM users
      WHERE id = ${userId}
    `

    if (result.length === 0) {
      return null
    }

    return result[0]
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}

export { comparePasswords, generateToken, setAuthCookie, clearAuthCookie, hashPassword }
