"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Terminal, ArrowRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-green-500 font-mono">
      <div className="container flex flex-col items-center justify-center flex-1 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center">
              <Terminal className="h-8 w-8 mr-2" />
              <h1 className="text-3xl font-bold">ASCIIgram</h1>
            </Link>
            <p className="mt-2 text-green-600">Login to your account</p>
          </div>

          <div className="border border-green-900/50 rounded-md p-6 bg-black/90">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-green-500">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="ascii_lover"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-black border-green-900 text-green-500 focus-visible:ring-green-700"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-500">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-black border-green-900 text-green-500 focus-visible:ring-green-700"
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-900 text-green-500 hover:bg-green-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-green-400 hover:underline">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
