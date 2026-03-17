import { Badge } from '../ui/Badge'
import type { Tag } from '../../types/tag'

interface TagBadgeProps {
  tag: Tag
  className?: string
}

export function TagBadge({ tag, className }: TagBadgeProps) {
  return (
    <Badge color={tag.color} className={className}>
      {tag.name}
    </Badge>
  )
}
