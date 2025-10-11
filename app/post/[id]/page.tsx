import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeedPost } from "@/components/feed-post"
import { Terminal } from "lucide-react"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { notFound } from "next/navigation"

export const revalidate = 60 // Revalidate this page every 60 seconds

interface PostPageProps {
  params: {
    id: string
  }
}

async function getPost(id: string, userId?: number) {
  try {
    // Get post with user info
    const postResult = await sql`
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
      WHERE p.id = ${id}
    `

    if (postResult.length === 0) {
      return null
    }

    // Get hashtags for the post
    const hashtagResult = await sql`
      SELECT h.name
      FROM hashtags h
      JOIN post_hashtags ph ON h.id = ph.hashtag_id
      WHERE ph.post_id = ${id}
    `

    const hashtags = hashtagResult.map((row) => `#${row.name}`)

    // Get comments for the post
    const commentsResult = await sql`
      SELECT 
        c.id, 
        c.user_id, 
        u.username, 
        c.content, 
        c.created_at
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ${id}
      ORDER BY c.created_at ASC
    `

    return {
      ...postResult[0],
      hashtags,
      comments: commentsResult,
    }
  } catch (error) {
    console.error("Error fetching post:", error)
    return null
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = params
  const user = await getCurrentUser()
  const post = await getPost(id, user?.id)

  if (!post) {
    notFound()
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
          <div className="w-full max-w-md">
            <FeedPost post={post} showComments={true} />

            <div className="mt-6 flex justify-center">
              <Link href="/">
                <Button variant="outline" className="border-green-900 text-green-500 hover:bg-green-900/20">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
