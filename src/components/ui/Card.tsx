import { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export default function Card({ children, glow = false, className = '', ...props }: Props) {
  return (
    <div
      className={`bg-[#1a1a2e] border rounded-2xl p-6 transition ${
        glow ? 'border-purple-600 shadow-lg shadow-purple-900/30' : 'border-purple-900'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
