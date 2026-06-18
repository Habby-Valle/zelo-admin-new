import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

interface PatientAvatarProps {
  name: string
  mediaUrl?: string | null
  photoUrl?: string | null
  className?: string
  size?: string
  textSize?: string
}

export function PatientAvatar({
  name,
  mediaUrl,
  photoUrl,
  className,
  size = "h-8 w-8",
  textSize = "text-xs",
}: PatientAvatarProps) {
  const src = mediaUrl ?? photoUrl ?? undefined

  return (
    <Avatar className={`${size} shrink-0 ${className ?? ""}`}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback className={textSize}>{getInitials(name)}</AvatarFallback>
    </Avatar>
  )
}
