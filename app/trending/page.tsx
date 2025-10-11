import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Terminal, Hash } from "lucide-react"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export const revalidate = 60 // Revalidate this page every 60 seconds

async function getTrendingHashtags() {
  try {
    // Get hashtags with post count, ordered by popularity
    const result = await sql`
      SELECT 
        h.id,
        h.name,
        COUNT(ph.post_id) as post_count
      FROM hashtags h
      JOIN post_hashtags ph ON h.id = ph.hashtag_id
      GROUP BY h.id, h.name
      ORDER BY post_count DESC
      LIMIT 10
    `

    return result
  } catch (error) {
    console.error("Error fetching trending hashtags:", error)
    return []
  }
}

export default async function TrendingPage() {
  const hashtags = await getTrendingHashtags()
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen flex-col bg-black text-green-500 font-mono">
      <header className="sticky top-0 z-50 w-full border-b border-green-900/50 bg-black/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Terminal className="h-6 w-6" />
            <span className="font-bold">ASCIIgram</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            {user ? (
              <Link href="/profile">
                <Button variant="ghost" className="text-green-500 hover:text-green-400 hover:bg-green-900/20">
                  <span className="text-xs sm:text-sm">@{user.username}</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-green-500 hover:text-green-400 hover:bg-green-900/20">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-green-900 text-green-500 hover:bg-green-800">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 flex items-center">
            <Hash className="mr-2 h-6 w-6" /> Trending Hashtags
          </h1>

          <div className="border border-green-900/50 rounded-md bg-black/90 overflow-hidden">
            {hashtags.length > 0 ? (
              <ul className="divide-y divide-green-900/30">
                {hashtags.map((hashtag) => (
                  <li key={hashtag.id} className="p-4 hover:bg-green-900/10">
                    <Link href={`/tag/${hashtag.name}`} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Hash className="mr-2 h-5 w-5 text-green-400" />
                        <span className="text-lg font-medium">{hashtag.name}</span>
                      </div>
                      <span className="text-green-600">{hashtag.post_count} posts</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-green-600">No trending hashtags found</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
