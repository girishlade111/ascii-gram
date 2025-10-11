import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// Update user avatar
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { avatarData } = await request.json()

    // Update user avatar
    await sql`
      UPDATE users
      SET avatar_data = ${JSON.stringify(avatarData)}
      WHERE id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating avatar:", error)
    return NextResponse.json({ error: "An error occurred while updating your avatar" }, { status: 500 })
  }
}
