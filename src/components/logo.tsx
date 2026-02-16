import * as React from 'react'
import { Boxes } from 'lucide-react'

interface LogoProps extends React.ComponentProps<typeof Boxes> {
  size?: number | string
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return <Boxes size={size} className={className} {...props} />
}
