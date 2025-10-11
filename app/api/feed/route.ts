import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// Get personalized feed for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Get posts from users the current user follows
    const result = await query(
      `
      SELECT 
        p.id, 
        p.content, 
        p.grid_width, 
        p.grid_height, 
        p.created_at,
        u.id as user_id, 
        u.username,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id IN (
        SELECT following_id FROM follows WHERE follower_id = $1
      )
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [user.id, limit, offset],
    )

    // Get hashtags for each post
    const posts = await Promise.all(
      result.rows.map(async (post) => {
        const hashtagResult = await query(
          `
        SELECT h.name
        FROM hashtags h
        JOIN post_hashtags ph ON h.id = ph.hashtag_id
        WHERE ph.post_id = $1
      `,
          [post.id],
        )

        const hashtags = hashtagResult.rows.map((row) => `#${row.name}`)

        return {
          ...post,
          hashtags,
        }
      }),
    )

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching feed:", error)
    return NextResponse.json({ error: "An error occurred while fetching your feed" }, { status: 500 })
  }
}
