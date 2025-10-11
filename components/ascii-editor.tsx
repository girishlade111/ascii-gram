"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AsciiEditorProps {
  onSubmit: (content: string, hashtags: string[]) => void
  isSubmitting: boolean
}

export function AsciiEditor({ onSubmit, isSubmitting }: AsciiEditorProps) {
  const [content, setContent] = useState("")
  const [hashtagInput, setHashtagInput] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])
  const [preview, setPreview] = useState("")

  useEffect(() => {
    // Update preview when content changes
    setPreview(content)
  }, [content])

  const handleAddHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags([...hashtags, hashtagInput.trim()])
      setHashtagInput("")
    }
  }

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddHashtag()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content, hashtags)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="content" className="text-green-500">
              ASCII Art
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Create your ASCII art here..."
              className="font-mono h-64 bg-black border-green-900 text-green-500 focus-visible:ring-green-700"
            />
          </div>

          <div>
            <Label htmlFor="hashtags" className="text-green-500">
              Hashtags
            </Label>
            <div className="flex gap-2">
              <Input
                id="hashtags"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add hashtags (e.g. ascii, art)"
                className="bg-black border-green-900 text-green-500 focus-visible:ring-green-700"
              />
              <Button
                type="button"
                onClick={handleAddHashtag}
                className="bg-green-900 text-green-500 hover:bg-green-800"
              >
                Add
              </Button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((tag) => (
                  <div key={tag} className="bg-green-900/30 text-green-400 px-2 py-1 rounded-md flex items-center">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(tag)}
                      className="ml-2 text-green-400 hover:text-green-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-green-500">Preview</Label>
          <div className="border border-green-900/50 rounded-md p-4 h-64 overflow-auto bg-black">
            <pre className="text-green-500 whitespace-pre">{preview}</pre>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        onClick={handleSubmit}
        className="w-full bg-green-900 text-green-500 hover:bg-green-800"
        disabled={isSubmitting || !content.trim()}
      >
        {isSubmitting ? "Creating Post..." : "Create Post"}
      </Button>
    </div>
  )
}
