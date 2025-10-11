"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Search, PlusSquare, Hash, UserRound } from "lucide-react"
import { Logo } from "@/components/logo"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex gap-2 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="mr-2 px-0 text-green-500 hover:bg-transparent hover:text-green-400">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-black border-green-900 text-green-500 font-mono">
          {/* Fix: Don't nest Link components */}
          <div className="flex items-center">
            <div className="flex items-center" onClick={() => setOpen(false)}>
              <Logo size="sm" />
            </div>
          </div>
          <nav className="mt-8 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 text-lg" onClick={() => setOpen(false)}>
              <Home className="h-5 w-5" />
              Home
            </Link>
            <Link href="/explore" className="flex items-center gap-2 text-lg" onClick={() => setOpen(false)}>
              <Search className="h-5 w-5" />
              Explore
            </Link>
            <Link href="/create" className="flex items-center gap-2 text-lg" onClick={() => setOpen(false)}>
              <PlusSquare className="h-5 w-5" />
              Create
            </Link>
            <Link href="/trending" className="flex items-center gap-2 text-lg" onClick={() => setOpen(false)}>
              <Hash className="h-5 w-5" />
              Trending
            </Link>
            <Link href="/profile" className="flex items-center gap-2 text-lg" onClick={() => setOpen(false)}>
              <UserRound className="h-5 w-5" />
              Profile
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex items-center">
        <Logo size="sm" />
      </div>
    </div>
  )
}
