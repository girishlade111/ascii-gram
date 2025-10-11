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

    // Check if post exists
    const postResult = await sql`
      SELECT id FROM posts WHERE id = ${postId}
    `

    if (postResult.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user already liked the post
    const likeResult = await sql`
      SELECT id FROM likes WHERE user_id = ${user.id} AND post_id = ${postId}
    `

    if (likeResult.length > 0) {
      // User already liked the post, so unlike it
      await sql`
        DELETE FROM likes WHERE user_id = ${user.id} AND post_id = ${postId}
      `
      return NextResponse.json({ liked: false })
    } else {
      // User hasn't liked the post, so like it
      await sql`
        INSERT INTO likes (user_id, post_id, created_at)
        VALUES (${user.id}, ${postId}, NOW())
      `
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Error liking post:", error)
    return NextResponse.json({ error: "An error occurred liking the post" }, { status: 500 })
  }
}
