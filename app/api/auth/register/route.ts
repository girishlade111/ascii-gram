import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 })
    }

    // Check if username or email already exists
    const existingUsers = await sql`
      SELECT username, email
      FROM users
      WHERE username = ${username} OR email = ${email}
    `

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0]
      if (existingUser.username === username) {
        return NextResponse.json({ error: "Username already exists" }, { status: 409 })
      }
      if (existingUser.email === email) {
        return NextResponse.json({ error: "Email already exists" }, { status: 409 })
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUsers = await sql`
      INSERT INTO users (username, email, password_hash, created_at)
      VALUES (${username}, ${email}, ${hashedPassword}, NOW())
      RETURNING id, username, email, bio, created_at
    `

    const newUser = newUsers[0]

    // Generate JWT token
    const token = await generateToken({
      id: newUser.id,
      username: newUser.username,
    })

    // Set auth cookie
    setAuthCookie(token)

    return NextResponse.json({ user: newUser })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 })
  }
}
