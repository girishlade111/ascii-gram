import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { username: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { username } = params

    // Get user to follow
    const userResult = await sql`
      SELECT id FROM users WHERE username = ${username}
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userToFollowId = userResult[0].id

    // Can't follow yourself
    if (currentUser.id === userToFollowId) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 })
    }

    // Check if already following
    const followResult = await sql`
      SELECT id FROM follows WHERE follower_id = ${currentUser.id} AND following_id = ${userToFollowId}
    `

    if (followResult.length > 0) {
      // Already following, so unfollow
      await sql`
        DELETE FROM follows WHERE follower_id = ${currentUser.id} AND following_id = ${userToFollowId}
      `
      return NextResponse.json({ following: false })
    } else {
      // Not following, so follow
      await sql`
        INSERT INTO follows (follower_id, following_id, created_at)
        VALUES (${currentUser.id}, ${userToFollowId}, NOW())
      `
      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error("Error following user:", error)
    return NextResponse.json({ error: "An error occurred following the user" }, { status: 500 })
  }
}
