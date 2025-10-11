import Link from "next/link"
import { Logo } from "@/components/logo"

export function MainNav() {
  return (
    <div className="mr-4 hidden md:flex">
      <Logo className="mr-6" />
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link href="/explore" className="transition-colors hover:text-green-400">
          Explore
        </Link>
        <Link href="/create" className="transition-colors hover:text-green-400">
          Create
        </Link>
        <Link href="/trending" className="transition-colors hover:text-green-400">
          Trending
        </Link>
      </nav>
    </div>
  )
}
