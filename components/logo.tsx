import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  // Size mappings
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <div className={`font-mono font-bold ${sizeClasses[size]} text-green-500 tracking-wider`}>
        <span className="inline-block px-1">ASCII</span>
        <span className="inline-block px-1">gram</span>
      </div>
    </Link>
  )
}
