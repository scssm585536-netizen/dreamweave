import { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: Props) {
  const base = 'px-6 py-2 rounded-full font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40',
    outline: 'border border-purple-400 hover:bg-purple-900/40 text-white',
    ghost: 'hover:bg-purple-900/20 text-purple-300',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
