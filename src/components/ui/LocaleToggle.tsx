'use client'
import { useLocale } from '@/hooks/useLocale'

export default function LocaleToggle() {
  const { locale, toggleLocale } = useLocale()

  return (
    <button
      onClick={toggleLocale}
      className="text-xs px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 text-gray-500 hover:text-gray-300 transition"
    >
      {locale === 'ko' ? 'EN' : '한'}
    </button>
  )
}
