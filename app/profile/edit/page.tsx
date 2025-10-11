"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Terminal } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { PixelAvatarEditor, type AvatarData } from "@/components/pixel-avatar-editor"

export default function EditProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [bio, setBio] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/profile")

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login")
            return
          }
          throw new Error("Failed to fetch profile")
        }

        const data = await response.json()
        setProfile(data.user)
        setBio(data.user.bio || "")
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleSaveProfile = async () => {
    if (!profile) return

    try {
      setIsSaving(true)
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      router.push(`/profile/${profile.username}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAvatar = async (avatarData: AvatarData) => {
    try {
      const response = await fetch("/api/profile/avatar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatarData }),
      })

      if (!response.ok) {
        throw new Error("Failed to update avatar")
      }

      return Promise.resolve()
    } catch (error) {
      console.error("Error updating avatar:", error)
      return Promise.reject(error)
    }
  }

  if (isLoading) {
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
          <div className="max-w-md mx-auto text-center">
            <p>Loading profile...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!profile) {
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
          <div className="max-w-md mx-auto text-center">
            <p>Profile not found. Please try again.</p>
            <Link href="/">
              <Button className="mt-4 bg-green-900 text-green-500 hover:bg-green-800">Return to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    )
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
          <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-green-500">
                  Username
                </Label>
                <Input
                  id="username"
                  value={profile.username}
                  disabled
                  className="bg-black border-green-900 text-green-500 focus-visible:ring-green-700"
                />
                <p className="text-xs text-green-600 mt-1">Username cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="email" className="text-green-500">
                  Email
                </Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-black border-green-900 text-green-500 focus-visible:ring-green-700"
                />
                <p className="text-xs text-green-600 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="bio" className="text-green-500">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="bg-black border-green-900 text-green-500 focus-visible:ring-green-700 h-32"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Link href={`/profile/${profile.username}`}>
                  <Button variant="outline" className="border-green-900 text-green-500 hover:bg-green-900/20">
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={handleSaveProfile}
                  className="bg-green-900 text-green-500 hover:bg-green-800"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>

            {/* Avatar Editor */}
            <div>
              <PixelAvatarEditor initialData={profile.avatar_data} onSave={handleSaveAvatar} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
