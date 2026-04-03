import { useState, useEffect } from 'react'
import { translations, Locale } from '@/lib/i18n'

export function useLocale() {
  const [locale, setLocale] = useState<Locale>('ko')

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale
    if (saved && translations[saved]) setLocale(saved)
  }, [])

  function toggleLocale() {
    const next: Locale = locale === 'ko' ? 'en' : 'ko'
    setLocale(next)
    localStorage.setItem('locale', next)
  }

  return { locale, t: translations[locale], toggleLocale }
}