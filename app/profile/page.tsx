import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ProfileRedirect() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  redirect(`/profile/${user.username}`)
}
