import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { comparePasswords, generateToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Find user by username
    const users = await sql`
      SELECT id, username, email, password_hash, bio
      FROM users
      WHERE username = ${username}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    // Generate JWT token
    const token = await generateToken({
      id: user.id,
      username: user.username,
    })

    // Set auth cookie
    setAuthCookie(token)

    // Return user data (excluding password)
    const { password_hash, ...userData } = user

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
