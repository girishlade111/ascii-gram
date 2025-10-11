import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeedPost } from "@/components/feed-post"
import { Terminal, Edit } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { notFound } from "next/navigation"
import { PixelAvatarDisplay } from "@/components/pixel-avatar-editor"
import { FollowButton } from "@/components/follow-button"

export const revalidate = 60 // Revalidate this page every 60 seconds

interface ProfilePageProps {
  params: {
    username: string
  }
}

async function getProfile(username: string) {
  try {
    // Get user info
    const userResult = await sql`
      SELECT 
        id, 
        username, 
        bio, 
        avatar_data,
        created_at
      FROM users
      WHERE username = ${username}
    `

    if (userResult.length === 0) {
      return null
    }

    const user = userResult[0]

    // Get follower and following counts
    const followerCountResult = await sql`
      SELECT COUNT(*) as count FROM follows WHERE following_id = ${user.id}
    `

    const followingCountResult = await sql`
      SELECT COUNT(*) as count FROM follows WHERE follower_id = ${user.id}
    `

    // Get post count
    const postCountResult = await sql`
      SELECT COUNT(*) as count FROM posts WHERE user_id = ${user.id}
    `

    return {
      ...user,
      followerCount: Number(followerCountResult[0].count),
      followingCount: Number(followingCountResult[0].count),
      postCount: Number(postCountResult[0].count),
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

async function getUserPosts(userId: number, currentUserId?: number) {
  try {
    // Get posts with like count and comment count
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
        ${currentUserId ? sql`EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ${currentUserId}) as user_liked` : sql`false as user_liked`}
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ${userId}
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
    console.error("Error fetching user posts:", error)
    return []
  }
}

async function checkIfFollowing(currentUserId: number, profileUserId: number) {
  try {
    const followResult = await sql`
      SELECT id FROM follows WHERE follower_id = ${currentUserId} AND following_id = ${profileUserId}
    `
    return followResult.length > 0
  } catch (error) {
    console.error("Error checking follow status:", error)
    return false
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = params
  const profile = await getProfile(username)

  if (!profile) {
    notFound()
  }

  const currentUser = await getCurrentUser()
  const posts = await getUserPosts(profile.id, currentUser?.id)

  let isFollowing = false
  let isOwnProfile = false

  if (currentUser) {
    isOwnProfile = currentUser.id === profile.id
    if (!isOwnProfile) {
      isFollowing = await checkIfFollowing(currentUser.id, profile.id)
    }
  }

  // Parse avatar data if it exists
  let avatarData = null
  if (profile.avatar_data) {
    try {
      avatarData = typeof profile.avatar_data === "string" ? JSON.parse(profile.avatar_data) : profile.avatar_data
    } catch (e) {
      console.error("Error parsing avatar data:", e)
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
          <div className="flex flex-1 items-center justify-end space-x-2">
            {currentUser && (
              <Link href="/create">
                <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-400 hover:bg-green-900/20">
                  Create
                </Button>
              </Link>
            )}
            {currentUser ? (
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-400 hover:bg-green-900/20">
                  <span className="text-xs sm:text-sm">@{currentUser.username}</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-500 hover:text-green-400 hover:bg-green-900/20"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-green-900 text-green-500 hover:bg-green-800">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container py-4 md:py-6 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header - Responsive Layout */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8 border-b border-green-900/30 pb-4 sm:pb-6">
            {/* Avatar */}
            <PixelAvatarDisplay avatarData={avatarData} size="lg" className="mx-auto sm:mx-0" />

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">@{profile.username}</h1>
              {/* Bio with smaller font size and improved readability */}
              <p className="text-xs sm:text-sm text-green-600 mt-1 max-w-prose break-words">
                {profile.bio || "ASCII artist"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              {!isOwnProfile && currentUser && <FollowButton username={username} initialIsFollowing={isFollowing} />}
              {isOwnProfile && (
                <>
                  <Link href="/profile/edit" className="w-full sm:w-auto">
                    <Button
                      className="w-full flex items-center gap-1 bg-green-900 text-green-500 hover:bg-green-800"
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href="/create" className="w-full sm:w-auto">
                    <Button className="w-full bg-green-900 text-green-500 hover:bg-green-800" size="sm">
                      Create Post
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats - Responsive Grid */}
          <div className="grid grid-cols-3 gap-2 mb-6 text-center">
            <div className="border border-green-900/30 rounded-md p-2 sm:p-3">
              <div className="text-lg sm:text-xl font-bold">{profile.postCount}</div>
              <div className="text-xs sm:text-sm text-green-600">Posts</div>
            </div>
            <div className="border border-green-900/30 rounded-md p-2 sm:p-3">
              <div className="text-lg sm:text-xl font-bold">{profile.followerCount}</div>
              <div className="text-xs sm:text-sm text-green-600">Followers</div>
            </div>
            <div className="border border-green-900/30 rounded-md p-2 sm:p-3">
              <div className="text-lg sm:text-xl font-bold">{profile.followingCount}</div>
              <div className="text-xs sm:text-sm text-green-600">Following</div>
            </div>
          </div>

          {/* Tabs - Responsive Design */}
          <Tabs defaultValue="posts" className="mt-4">
            <TabsList className="w-full bg-green-900/20 border border-green-900/50">
              <TabsTrigger value="posts" className="flex-1 data-[state=active]:bg-green-900/40">
                Posts
              </TabsTrigger>
              <TabsTrigger value="liked" className="flex-1 data-[state=active]:bg-green-900/40">
                Liked
              </TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="mt-4">
              <div className="space-y-4 sm:space-y-6">
                {posts.length > 0 ? (
                  posts.map((post) => <FeedPost key={post.id} post={post} />)
                ) : (
                  <div className="text-center py-8 text-green-600 border border-green-900/30 rounded-md">
                    <p>No posts yet</p>
                    {isOwnProfile && (
                      <Link href="/create" className="mt-4 inline-block">
                        <Button size="sm" className="bg-green-900 text-green-500 hover:bg-green-800">
                          Create Your First Post
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="liked" className="mt-4">
              <div className="text-center py-8 text-green-600 border border-green-900/30 rounded-md">
                <p>Liked posts coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
