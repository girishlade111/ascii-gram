import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// Get trending hashtags
export async function GET(request: NextRequest) {
  try {
    // Get hashtags with post count, ordered by popularity
    const result = await query(`
      SELECT 
        h.id,
        h.name,
        COUNT(ph.post_id) as post_count
      FROM hashtags h
      JOIN post_hashtags ph ON h.id = ph.hashtag_id
      GROUP BY h.id, h.name
      ORDER BY post_count DESC
      LIMIT 10
    `)

    const hashtags = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      postCount: Number.parseInt(row.post_count),
      tag: `#${row.name}`,
    }))

    return NextResponse.json({ hashtags })
  } catch (error) {
    console.error("Error fetching trending hashtags:", error)
    return NextResponse.json({ error: "An error occurred while fetching trending hashtags" }, { status: 500 })
  }
}
