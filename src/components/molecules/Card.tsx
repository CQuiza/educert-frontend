import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: boolean
}

export default function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`rounded-xl border border-neutral-200 bg-white ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  )
}
