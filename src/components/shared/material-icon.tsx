import { cn } from "@/lib/utils"

interface MaterialIconProps {
  name: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const SIZE_CLASS = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
}

export function MaterialIcon({
  name,
  className,
  size = "md",
}: MaterialIconProps) {
  return (
    <span
      className={cn("material-icons select-none", SIZE_CLASS[size], className)}
      aria-hidden="true"
    >
      {name.replace(/-/g, "_")}
    </span>
  )
}
