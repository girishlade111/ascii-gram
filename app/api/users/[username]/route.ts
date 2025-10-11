import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

interface Params {
  params: {
    username: string
  }
}

// Get user profile
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { username } = params

    // Get user info
    const userResult = await query(
      `
      SELECT 
        id, 
        username, 
        bio, 
        created_at
      FROM users
      WHERE username = $1
    `,
      [username],
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult.rows[0]

    // Get follower and following counts
    const followerCountResult = await query("SELECT COUNT(*) as count FROM follows WHERE following_id = $1", [user.id])

    const followingCountResult = await query("SELECT COUNT(*) as count FROM follows WHERE follower_id = $1", [user.id])

    // Get post count
    const postCountResult = await query("SELECT COUNT(*) as count FROM posts WHERE user_id = $1", [user.id])

    // Check if current user is following this user
    const currentUser = await getCurrentUser()
    let isFollowing = false

    if (currentUser && currentUser.id !== user.id) {
      const followResult = await query("SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2", [
        currentUser.id,
        user.id,
      ])
      isFollowing = followResult.rows.length > 0
    }

    return NextResponse.json({
      user: {
        ...user,
        followerCount: Number.parseInt(followerCountResult.rows[0].count),
        followingCount: Number.parseInt(followingCountResult.rows[0].count),
        postCount: Number.parseInt(postCountResult.rows[0].count),
        isFollowing,
      },
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "An error occurred while fetching the user profile" }, { status: 500 })
  }
}
