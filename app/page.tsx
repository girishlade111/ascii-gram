import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { FeedPost } from "@/components/feed-post"
import { Plus } from "lucide-react"

export const revalidate = 60 // Revalidate this page every 60 seconds

export default async function HomePage() {
  const user = await getCurrentUser()

  let posts = []
  try {
    const postsResult = await sql`
      SELECT 
        p.id, 
        p.content, 
        p.grid_width, 
        p.grid_height, 
        p.created_at,
        u.id as user_id, 
        u.username,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        ${user ? sql`EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ${user.id}) as user_liked` : sql`false as user_liked`}
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `

    posts = await Promise.all(
      postsResult.map(async (post) => {
        const hashtagResult = await sql`
          SELECT h.name
          FROM hashtags h
          JOIN post_hashtags ph ON h.id = ph.hashtag_id
          WHERE ph.post_id = ${post.id}
        `

        const hashtags = hashtagResult.map((row) => `#${row.name}`)

        return {
          ...post,
          hashtags,
        }
      }),
    )
  } catch (error) {
    console.error("Error fetching posts:", error)
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-green-500 font-mono">
      <header className="sticky top-0 z-50 w-full border-b border-green-900/50 bg-black/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <MainNav />
          <MobileNav />
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
        <div className="flex flex-col items-center">
          {/* Logo section removed */}

          <div className="w-full max-w-md space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="group">
                  <FeedPost post={post} postUrl={`/post/${post.id}`} />
                </div>
              ))
            ) : (
              <div className="text-center py-10 border border-green-900/50 rounded-md">
                <p className="text-green-600">No posts found. Be the first to create one!</p>
                <Link href="/create" className="mt-4 inline-block">
                  <Button className="bg-green-900 text-green-500 hover:bg-green-800">Create Post</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating create button for mobile */}
      {user && (
        <Link href="/create" className="md:hidden fixed bottom-6 right-6 z-50">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-green-900 text-green-500 hover:bg-green-800 shadow-lg"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Create Post</span>
          </Button>
        </Link>
      )}
    </div>
  )
}
