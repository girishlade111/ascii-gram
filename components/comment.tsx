import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { PixelAvatarDisplay } from "@/components/pixel-avatar-editor"

interface CommentProps {
  id: string | number
  username: string
  content: string
  createdAt: string
  avatarData?: any
}

export function Comment({ username, content, createdAt, avatarData }: CommentProps) {
  // Format the date
  let formattedDate = ""
  try {
    formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true })
  } catch (error) {
    formattedDate = "some time ago"
  }

  return (
    <div className="border-t border-green-900/20 pt-2 pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/profile/${username}`}>
            <PixelAvatarDisplay avatarData={avatarData} size="xs" />
          </Link>
          <Link href={`/profile/${username}`} className="font-bold text-green-400 hover:underline text-sm truncate">
            @{username}
          </Link>
        </div>
        <span className="text-xs text-green-600 ml-2 whitespace-nowrap">{formattedDate}</span>
      </div>
      <p className="text-xs sm:text-sm mt-1 break-words pl-10">{content}</p>
    </div>
  )
}
