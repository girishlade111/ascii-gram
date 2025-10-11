"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface CommentFormProps {
  postId: string | number
  onCommentAdded: (comment: any) => void
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!comment.trim()) {
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add comment")
      }

      onCommentAdded(data.comment)
      setComment("")
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred adding your comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2 sm:mt-3">
      <Input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        className="bg-black border-green-900 text-green-500 focus-visible:ring-green-700 text-xs sm:text-sm h-8 sm:h-9"
        disabled={isSubmitting}
      />
      <Button
        type="submit"
        size="sm"
        className="bg-green-900 text-green-500 hover:bg-green-800 h-8 sm:h-9 px-2 sm:px-3"
        disabled={isSubmitting || !comment.trim()}
      >
        <Send className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </form>
  )
}
