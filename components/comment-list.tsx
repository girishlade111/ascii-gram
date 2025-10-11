"use client"

import { useState, useEffect } from "react"
import { Comment } from "@/components/comment"
import { CommentForm } from "@/components/comment-form"
import { toast } from "@/components/ui/use-toast"

interface CommentData {
  id: string | number
  username: string
  content: string
  created_at: string
  avatarData?: any
}

interface CommentListProps {
  postId: string | number
  initialComments?: CommentData[]
}

export function CommentList({ postId, initialComments = [] }: CommentListProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments)
  const [isLoading, setIsLoading] = useState(initialComments.length === 0)

  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments()
    }
  }, [postId, initialComments.length])

  const fetchComments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/posts/${postId}/comments`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load comments")
      }

      setComments(data.comments)
    } catch (error) {
      console.error("Error loading comments:", error)
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommentAdded = (newComment: CommentData) => {
    setComments((prevComments) => [...prevComments, newComment])
  }

  return (
    <div className="w-full mt-3 space-y-2 sm:space-y-3" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-xs sm:text-sm font-medium text-green-400">Comments</h3>

      {isLoading ? (
        <div className="text-center py-2 text-xs sm:text-sm text-green-600">Loading comments...</div>
      ) : comments.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              id={comment.id}
              username={comment.username}
              content={comment.content}
              createdAt={comment.created_at}
              avatarData={comment.avatarData}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-2 text-xs sm:text-sm text-green-600">No comments yet</div>
      )}

      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
    </div>
  )
}
