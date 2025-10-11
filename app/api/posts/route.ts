import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { content, hashtags } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Calculate grid dimensions
    const lines = content.split("\n")
    const gridHeight = lines.length
    const gridWidth = Math.max(...lines.map((line) => line.length))

    // Create post
    const postResult = await sql`
      INSERT INTO posts (user_id, content, grid_width, grid_height, created_at)
      VALUES (${user.id}, ${content}, ${gridWidth}, ${gridHeight}, NOW())
      RETURNING id
    `

    const postId = postResult[0].id

    // Process hashtags
    if (hashtags && hashtags.length > 0) {
      for (const tag of hashtags) {
        // Check if hashtag exists
        const existingHashtags = await sql`
          SELECT id FROM hashtags WHERE name = ${tag}
        `

        let hashtagId

        if (existingHashtags.length > 0) {
          // Use existing hashtag
          hashtagId = existingHashtags[0].id
        } else {
          // Create new hashtag
          const newHashtag = await sql`
            INSERT INTO hashtags (name, created_at)
            VALUES (${tag}, NOW())
            RETURNING id
          `
          hashtagId = newHashtag[0].id
        }

        // Link hashtag to post
        await sql`
          INSERT INTO post_hashtags (post_id, hashtag_id)
          VALUES (${postId}, ${hashtagId})
        `
      }
    }

    return NextResponse.json({ success: true, postId })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "An error occurred creating the post" }, { status: 500 })
  }
}
