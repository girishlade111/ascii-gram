"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface FollowButtonProps {
  username: string
  initialIsFollowing: boolean
}

export function FollowButton({ username, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${username}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to follow user")
      }

      const data = await response.json()
      setIsFollowing(data.following)

      toast({
        title: data.following ? "Following" : "Unfollowed",
        description: data.following ? `You are now following @${username}` : `You have unfollowed @${username}`,
      })
    } catch (error) {
      console.error("Error following user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleFollow}
      className="w-full sm:w-auto bg-green-900 text-green-500 hover:bg-green-800"
      size="sm"
      disabled={isLoading}
    >
      {isLoading ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}
    </Button>
  )
}
