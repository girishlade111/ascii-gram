import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeedPost } from "@/components/feed-post"
import { Terminal } from "lucide-react"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export const revalidate = 60 // Revalidate this page every 60 seconds

async function getFeedPosts(userId: number) {
  try {
    // Get posts from users the current user follows
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
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ${userId}) as user_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id IN (
        SELECT following_id FROM follows WHERE follower_id = ${userId}
      )
      ORDER BY p.created_at DESC
      LIMIT 10
    `

    // Get hashtags for each post
    const posts = await Promise.all(
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
          userLiked: post.user_liked,
        }
      }),
    )

    return posts
  } catch (error) {
    console.error("Error fetching feed posts:", error)
    return []
  }
}

export default async function FeedPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const posts = await getFeedPosts(user.id)

  return (
    <div className="flex min-h-screen flex-col bg-black text-green-500 font-mono">
      <header className="sticky top-0 z-50 w-full border-b border-green-900/50 bg-black/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Terminal className="h-6 w-6" />
            <span className="font-bold">ASCIIgram</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <Link href="/profile">
              <Button variant="ghost" className="text-green-500 hover:text-green-400 hover:bg-green-900/20">
                <span className="text-xs sm:text-sm">@{user.username}</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="flex flex-col items-center">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-green-400 mb-2">Your Feed</h1>
            <p className="text-green-600">Posts from people you follow</p>
          </div>

          <div className="w-full max-w-md space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => <FeedPost key={post.id} post={post} />)
            ) : (
              <div className="text-center py-10 border border-green-900/50 rounded-md">
                <p className="text-green-600">Your feed is empty. Follow some users to see their posts!</p>
                <div className="mt-4 flex justify-center gap-4">
                  <Link href="/explore">
                    <Button className="bg-green-900 text-green-500 hover:bg-green-800">Explore Users</Button>
                  </Link>
                  <Link href="/create">
                    <Button className="bg-green-900 text-green-500 hover:bg-green-800">Create Post</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
