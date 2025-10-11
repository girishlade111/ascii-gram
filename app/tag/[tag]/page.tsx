import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeedPost } from "@/components/feed-post"
import { Terminal, Hash } from "lucide-react"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { notFound } from "next/navigation"

export const revalidate = 60 // Revalidate this page every 60 seconds

interface TagPageProps {
  params: {
    tag: string
  }
}

async function getPostsByTag(tag: string, userId?: number) {
  try {
    // Get hashtag ID
    const hashtagResult = await sql`
      SELECT id FROM hashtags WHERE name = ${tag}
    `

    if (hashtagResult.length === 0) {
      return []
    }

    const hashtagId = hashtagResult[0].id

    // Get posts with this hashtag
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
        ${userId ? sql`EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ${userId}) as user_liked` : sql`false as user_liked`}
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN post_hashtags ph ON p.id = ph.post_id
      WHERE ph.hashtag_id = ${hashtagId}
      ORDER BY p.created_at DESC
      LIMIT 10
    `

    // Get all hashtags for each post
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
    console.error("Error fetching posts by hashtag:", error)
    return []
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = params
  const user = await getCurrentUser()
  const posts = await getPostsByTag(tag, user?.id)

  if (posts.length === 0) {
    // Check if hashtag exists
    const hashtagResult = await sql`
      SELECT id FROM hashtags WHERE name = ${tag}
    `

    if (hashtagResult.length === 0) {
      notFound()
    }
  }

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
        <div className="flex flex-col items-center">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-green-400 mb-2 flex items-center justify-center">
              <Hash className="mr-2 h-6 w-6" /> {tag}
            </h1>
            <p className="text-green-600">Posts tagged with #{tag}</p>
          </div>

          <div className="w-full max-w-md space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => <FeedPost key={post.id} post={post} />)
            ) : (
              <div className="text-center py-10 border border-green-900/50 rounded-md">
                <p className="text-green-600">No posts found with this hashtag</p>
                <Link href="/create" className="mt-4 inline-block">
                  <Button className="bg-green-900 text-green-500 hover:bg-green-800">Create Post</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
