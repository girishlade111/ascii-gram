import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const postId = params.id
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    // Check if post exists
    const postResult = await sql`
      SELECT id FROM posts WHERE id = ${postId}
    `

    if (postResult.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Create comment
    const commentResult = await sql`
      INSERT INTO comments (user_id, post_id, content, created_at)
      VALUES (${user.id}, ${postId}, ${content}, NOW())
      RETURNING id, content, created_at
    `

    const comment = {
      ...commentResult[0],
      username: user.username,
      user_id: user.id,
    }

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "An error occurred adding the comment" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const postId = params.id

    // Check if post exists
    const postResult = await sql`
      SELECT id FROM posts WHERE id = ${postId}
    `

    if (postResult.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Get comments
    const commentsResult = await sql`
      SELECT c.id, c.user_id, u.username, c.content, c.created_at
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ${postId}
      ORDER BY c.created_at DESC
    `

    return NextResponse.json({ comments: commentsResult })
  } catch (error) {
    console.error("Error getting comments:", error)
    return NextResponse.json({ error: "An error occurred getting the comments" }, { status: 500 })
  }
}
