"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Heart, MessageSquare, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import { CommentList } from "@/components/comment-list"

interface Comment {
  id: string | number
  username: string
  content: string
  created_at: string
}

interface Post {
  id: string | number
  user_id: string | number
  username: string
  content: string
  grid_width?: number
  grid_height?: number
  created_at: string
  like_count: number
  comment_count: number
  comments?: Comment[]
  hashtags: string[]
  userLiked?: boolean
}

interface FeedPostProps {
  post: Post
  showComments?: boolean
  postUrl?: string // New prop for making the card clickable
}

export function FeedPost({ post, showComments = false, postUrl }: FeedPostProps) {
  const [liked, setLiked] = useState(post.userLiked || false)
  const [likeCount, setLikeCount] = useState(Number(post.like_count) || 0)
  const [isCommenting, setIsCommenting] = useState(showComments)
  const [commentCount, setCommentCount] = useState(Number(post.comment_count) || 0)
  const router = useRouter()

  // Format the date
  let formattedDate = ""
  try {
    formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
  } catch (error) {
    formattedDate = "some time ago"
  }

  const handleLike = async (e: React.MouseEvent) => {
    // Prevent the click from navigating if the card is clickable
    if (postUrl) {
      e.stopPropagation()
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to like post")
      }

      setLiked(!liked)
      setLikeCount(liked ? likeCount - 1 : likeCount + 1)
    } catch (error) {
      console.error("Error liking post:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const handleCopy = (e: React.MouseEvent) => {
    // Prevent the click from navigating if the card is clickable
    if (postUrl) {
      e.stopPropagation()
    }

    navigator.clipboard.writeText(post.content)
    toast({
      title: "Copied to clipboard",
      description: "ASCII art has been copied to your clipboard",
    })
  }

  const toggleComments = (e: React.MouseEvent) => {
    // Prevent the click from navigating if the card is clickable
    if (postUrl) {
      e.stopPropagation()
    }

    setIsCommenting(!isCommenting)
  }

  const handleCommentAdded = () => {
    setCommentCount(commentCount + 1)
  }

  const handleCardClick = () => {
    if (postUrl) {
      router.push(postUrl)
    }
  }

  // Create a wrapper component based on whether the card is clickable
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (postUrl) {
      return (
        <div onClick={handleCardClick} className="cursor-pointer transition-transform hover:scale-[1.01]">
          {children}
        </div>
      )
    }
    return <>{children}</>
  }

  return (
    <CardWrapper>
      <Card className="border border-green-900/50 bg-black text-green-500">
        <CardHeader className="border-b border-green-900/30 p-3 sm:p-4">
          <div className="flex justify-between items-center">
            {/* Use onClick with stopPropagation to prevent card click */}
            <Link
              href={`/profile/${post.username}`}
              className="font-bold hover:text-green-400 truncate"
              onClick={(e) => postUrl && e.stopPropagation()}
            >
              @{post.username}
            </Link>
            <span className="text-xs text-green-600 ml-2 whitespace-nowrap">{formattedDate}</span>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="overflow-x-auto">
            <pre className="whitespace-pre text-xs sm:text-sm leading-tight">{post.content.replace(/\\n/g, "\n")}</pre>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2 mt-3">
            {post.hashtags &&
              post.hashtags.map((tag, index) => (
                <Link href={`/tag/${tag.replace("#", "")}`} key={index} onClick={(e) => postUrl && e.stopPropagation()}>
                  <Badge
                    variant="outline"
                    className="text-xs sm:text-sm text-green-400 border-green-900 hover:bg-green-900/20"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col border-t border-green-900/30 p-3 sm:p-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={`px-1 sm:px-2 ${liked ? "text-red-500" : "text-green-500"} hover:bg-green-900/20`}
                onClick={handleLike}
              >
                <Heart className="h-4 w-4 mr-1" fill={liked ? "currentColor" : "none"} /> {likeCount}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="px-1 sm:px-2 text-green-500 hover:bg-green-900/20"
                onClick={toggleComments}
              >
                <MessageSquare className="h-4 w-4 mr-1" /> {commentCount}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="px-1 sm:px-2 text-green-500 hover:bg-green-900/20"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Copy</span>
            </Button>
          </div>

          {isCommenting && <CommentList postId={post.id} initialComments={post.comments} />}
        </CardFooter>
      </Card>
    </CardWrapper>
  )
}
