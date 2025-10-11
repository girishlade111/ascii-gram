import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

interface Params {
  params: {
    tag: string
  }
}

// Get posts by hashtag
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { tag } = params
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Get hashtag ID
    const hashtagResult = await query("SELECT id FROM hashtags WHERE name = $1", [tag])

    if (hashtagResult.rows.length === 0) {
      return NextResponse.json({ posts: [] })
    }

    const hashtagId = hashtagResult.rows[0].id

    // Get posts with this hashtag
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
      JOIN post_hashtags ph ON p.id = ph.post_id
      WHERE ph.hashtag_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [hashtagId, limit, offset],
    )

    // Get all hashtags for each post
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
    console.error("Error fetching posts by hashtag:", error)
    return NextResponse.json({ error: "An error occurred while fetching posts" }, { status: 500 })
  }
}
