import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

interface Params {
  params: {
    username: string
  }
}

// Get posts by a specific user
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { username } = params
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Get user ID
    const userResult = await query("SELECT id FROM users WHERE username = $1", [username])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = userResult.rows[0].id

    // Get posts with like count and comment count
    const result = await query(
      `
      SELECT 
        p.id, 
        p.content, 
        p.grid_width, 
        p.grid_height, 
        p.created_at,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [userId, limit, offset],
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
          username,
          user_id: userId,
          hashtags,
        }
      }),
    )

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching user posts:", error)
    return NextResponse.json({ error: "An error occurred while fetching user posts" }, { status: 500 })
  }
}
