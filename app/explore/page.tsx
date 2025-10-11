import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Terminal, UserRound } from "lucide-react"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export const revalidate = 60 // Revalidate this page every 60 seconds

async function getUsers() {
  try {
    // Get users with post count
    const result = await sql`
      SELECT 
        u.id,
        u.username,
        u.bio,
        u.created_at,
        COUNT(p.id) as post_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      GROUP BY u.id, u.username, u.bio, u.created_at
      ORDER BY post_count DESC, u.created_at DESC
      LIMIT 20
    `

    return result
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export default async function ExplorePage() {
  const users = await getUsers()
  const currentUser = await getCurrentUser()

  return (
    <div className="flex min-h-screen flex-col bg-black text-green-500 font-mono">
      <header className="sticky top-0 z-50 w-full border-b border-green-900/50 bg-black/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Terminal className="h-6 w-6" />
            <span className="font-bold">ASCIIgram</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            {currentUser ? (
              <Link href="/profile">
                <Button variant="ghost" className="text-green-500 hover:text-green-400 hover:bg-green-900/20">
                  <span className="text-xs sm:text-sm">@{currentUser.username}</span>
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
            <UserRound className="mr-2 h-6 w-6" /> Explore Users
          </h1>

          <div className="border border-green-900/50 rounded-md bg-black/90 overflow-hidden">
            {users.length > 0 ? (
              <ul className="divide-y divide-green-900/30">
                {users.map((user) => (
                  <li key={user.id} className="p-4 hover:bg-green-900/10">
                    <Link href={`/profile/${user.username}`} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-green-500 text-green-400 mr-3">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">@{user.username}</div>
                          <div className="text-sm text-green-600 truncate max-w-xs">{user.bio || "ASCII artist"}</div>
                        </div>
                      </div>
                      <span className="text-green-600">{user.post_count} posts</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-green-600">No users found</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
