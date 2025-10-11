import { Terminal } from "lucide-react"
import Link from "next/link"
import { CreatePostForm } from "@/components/create-post-form"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CreatePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-green-500 font-mono">
      <header className="sticky top-0 z-50 w-full border-b border-green-900/50 bg-black/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Terminal className="h-6 w-6" />
            <span className="font-bold">ASCIIgram</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Create ASCII Art</h1>
          <CreatePostForm />
        </div>
      </main>
    </div>
  )
}
