import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

interface Params {
  params: {
    id: string
  }
}

// Get a single post with comments
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const postId = params.id

    // Get post with user info
    const postResult = await query(
      `
      SELECT 
        p.id, 
        p.content, 
        p.grid_width, 
        p.grid_height, 
        p.created_at,
        u.id as user_id, 
        u.username,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `,
      [postId],
    )

    if (postResult.rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const post = postResult.rows[0]

    // Get comments for the post
    const commentsResult = await query(
      `
      SELECT 
        c.id, 
        c.content, 
        c.created_at,
        u.id as user_id, 
        u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `,
      [postId],
    )

    // Get hashtags for the post
    const hashtagResult = await query(
      `
      SELECT h.name
      FROM hashtags h
      JOIN post_hashtags ph ON h.id = ph.hashtag_id
      WHERE ph.post_id = $1
    `,
      [postId],
    )

    const hashtags = hashtagResult.rows.map((row) => `#${row.name}`)

    // Check if current user has liked the post
    const user = await getCurrentUser()
    let userLiked = false

    if (user) {
      const likeResult = await query("SELECT id FROM likes WHERE user_id = $1 AND post_id = $2", [user.id, postId])
      userLiked = likeResult.rows.length > 0
    }

    return NextResponse.json({
      post: {
        ...post,
        comments: commentsResult.rows,
        hashtags,
        userLiked,
      },
    })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json({ error: "An error occurred while fetching the post" }, { status: 500 })
  }
}

// Delete a post
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const postId = params.id

    // Check if post exists and belongs to the user
    const postResult = await query("SELECT user_id FROM posts WHERE id = $1", [postId])

    if (postResult.rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (postResult.rows[0].user_id !== user.id) {
      return NextResponse.json({ error: "You can only delete your own posts" }, { status: 403 })
    }

    // Delete post (cascade will delete likes, comments, and hashtag associations)
    await query("DELETE FROM posts WHERE id = $1", [postId])

    return NextResponse.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ error: "An error occurred while deleting the post" }, { status: 500 })
  }
}
