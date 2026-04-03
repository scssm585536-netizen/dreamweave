import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LandingScreen() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [lang, setLang] = useState<'ko' | 'en'>('ko')

  const text = {
    ko: {
      badge: 'AI 꿈 동기화 · 2026',
      sub1: '아침에 꿈만 쓰면,',
      sub2: '"AI가 내 꿈을 전 세계 사람들의 꿈과\n실시간으로 엮어 하나의 거대한\n꿈 직물로 만들어줍니다"',
      start: '지금 시작하기 →',
      explore: '둘러보기',
    },
    en: {
      badge: 'AI Dream Sync · 2026',
      sub1: 'Just write your dream in the morning,',
      sub2: '"AI weaves your dream with people\naround the world into one giant\ndream tapestry in real time"',
      start: 'Get Started →',
      explore: 'Explore',
    },
  }[lang]

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/(tabs)/dashboard')
      else setChecking(false)
    })
  }, [])

  if (checking) return (
    <View style={styles.loadingContainer}>
      <Text style={styles.emoji}>🧵</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* 배경 */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <View style={styles.content}>
        {/* 언어 전환 버튼 */}
        <TouchableOpacity
          onPress={() => setLang(lang === 'ko' ? 'en' : 'ko')}
          style={styles.langBtn}
        >
          <Text style={styles.langBtnText}>{lang === 'ko' ? 'EN' : '한'}</Text>
        </TouchableOpacity>

        {/* 배지 */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{text.badge}</Text>
        </View>

        {/* 타이틀 */}
        <Text style={styles.title1}>Dream</Text>
        <Text style={styles.title2}>sync</Text>

        <Text style={styles.sub1}>{text.sub1}</Text>
        <Text style={styles.sub2}>{text.sub2}</Text>

        {/* 버튼 */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/auth')}
        >
          <Text style={styles.primaryBtnText}>{text.start}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/explore')}
        >
          <Text style={styles.secondaryBtnText}>{text.explore}</Text>
        </TouchableOpacity>

        {/* 기능 소개 */}
        <View style={styles.features}>
          {[
            { icon: '✍️', title: '꿈 기록' },
            { icon: '🔮', title: 'AI 해석' },
            { icon: '🌐', title: '꿈 직물' },
          ].map((f) => (
            <View key={f.title} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070712', alignItems: 'center', justifyContent: 'center' },
  loadingContainer: { flex: 1, backgroundColor: '#070712', alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 40 },
  orb1: { position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(107,70,193,0.2)' },
  orb2: { position: 'absolute', bottom: -100, right: -100, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(99,102,241,0.15)' },
  content: { alignItems: 'center', paddingHorizontal: 24, zIndex: 10 },
  langBtn: { position: 'absolute', top: 60, right: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  langBtnText: { color: '#6b7280', fontSize: 13 },
  badge: { borderWidth: 1, borderColor: 'rgba(147,51,234,0.3)', backgroundColor: 'rgba(147,51,234,0.1)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 32 },
  badgeText: { color: '#c4b5fd', fontSize: 11, letterSpacing: 2 },
  title1: { fontSize: 56, fontWeight: '900', color: 'white', lineHeight: 60 },
  title2: { fontSize: 56, fontWeight: '900', color: '#a78bfa', lineHeight: 60, marginBottom: 20 },
  sub1: { color: '#9ca3af', fontSize: 16, marginBottom: 8 },
  sub2: { color: 'rgba(196,181,253,0.8)', fontSize: 15, fontStyle: 'italic', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  primaryBtn: { backgroundColor: '#7c3aed', borderRadius: 30, paddingHorizontal: 40, paddingVertical: 16, marginBottom: 12, width: 260, alignItems: 'center' },
  primaryBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  secondaryBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 30, paddingHorizontal: 40, paddingVertical: 16, width: 260, alignItems: 'center', marginBottom: 48 },
  secondaryBtnText: { color: '#9ca3af', fontSize: 16 },
  features: { flexDirection: 'row', gap: 32 },
  featureItem: { alignItems: 'center' },
  featureIcon: { fontSize: 28, marginBottom: 6 },
  featureTitle: { color: '#7c3aed', fontSize: 12, fontWeight: '600' },
})
