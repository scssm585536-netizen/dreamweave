import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'

interface Dream {
  id: string
  content: string
  emotions: string[]
  main_tag: string | null
  emotion_scores: Record<string, number> | null
  visibility: string
  created_at: string
}

export default function DashboardScreen() {
  const router = useRouter()
  const [dreams, setDreams] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/'); return }
      setUserId(user.id)
      fetchDreams(user.id, tab)
    })
  }, [])

  async function fetchDreams(uid: string, currentTab: 'all' | 'mine') {
    setLoading(true)
    if (currentTab === 'all') {
      const { data } = await supabase
        .from('dreams')
        .select('*')
        .neq('visibility', 'private')
        .order('created_at', { ascending: false })
      setDreams(data ?? [])
    } else {
      const { data } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
      setDreams(data ?? [])
    }
    setLoading(false)
  }

  async function onRefresh() {
    setRefreshing(true)
    if (userId) await fetchDreams(userId, tab)
    setRefreshing(false)
  }

  function switchTab(t: 'all' | 'mine') {
    setTab(t)
    if (userId) fetchDreams(userId, t)
  }

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />

      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>🧵 DreamWeave</Text>
          <Text style={styles.title}>꿈 아카이브</Text>
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/(tabs)/new-dream')}>
          <Text style={styles.newBtnText}>+ 기록</Text>
        </TouchableOpacity>
      </View>

      {/* 탭 */}
      <View style={styles.tabs}>
        {(['all', 'mine'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.activeTab]}
            onPress={() => switchTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
              {t === 'all' ? '🌐 전체 피드' : '🌙 내 꿈'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 꿈 목록 */}
      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
      >
        {dreams.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={styles.emptyText}>아직 꿈이 없어요</Text>
          </View>
        ) : (
          dreams.map((dream) => (
            <TouchableOpacity
              key={dream.id}
              style={styles.card}
              onPress={() => router.push(`/dream/${dream.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>
                  {new Date(dream.created_at).toLocaleDateString('ko-KR')}
                </Text>
                <View style={styles.cardRight}>
                  {dream.main_tag && (
                    <View style={styles.mainTag}>
                      <Text style={styles.mainTagText}>✦ {dream.main_tag}</Text>
                    </View>
                  )}
                  <View style={styles.visibilityBadge}>
                    <Text style={styles.visibilityText}>
                      {dream.visibility === 'private' ? '🔒' : dream.visibility === 'anonymous' ? '👤' : '🌐'}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.cardContent} numberOfLines={2}>
                {dream.content}
              </Text>
              <View style={styles.emotions}>
                {(dream.emotions ?? []).slice(0, 3).map((e) => (
                  <View key={e} style={styles.emotionTag}>
                    <Text style={styles.emotionText}>
                      {e}{dream.emotion_scores?.[e] ? ` ${dream.emotion_scores[e]}%` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070712' },
  orb1: { position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(107,70,193,0.15)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  logo: { color: '#a78bfa', fontSize: 12, letterSpacing: 2, marginBottom: 4 },
  title: { color: 'white', fontSize: 28, fontWeight: '900' },
  newBtn: { backgroundColor: '#7c3aed', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginTop: 8 },
  newBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
  tabs: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 30, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 26, alignItems: 'center' },
  activeTab: { backgroundColor: '#7c3aed' },
  tabText: { color: '#6b7280', fontSize: 13, fontWeight: '600' },
  activeTabText: { color: 'white' },
  list: { flex: 1, paddingHorizontal: 20 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#6b7280', fontSize: 16 },
  card: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardDate: { color: '#6b7280', fontSize: 12 },
  cardRight: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  mainTag: { backgroundColor: 'rgba(147,51,234,0.2)', borderWidth: 1, borderColor: 'rgba(147,51,234,0.3)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  mainTagText: { color: '#c4b5fd', fontSize: 11 },
  visibilityBadge: { paddingHorizontal: 4 },
  visibilityText: { fontSize: 14 },
  cardContent: { color: '#d1d5db', fontSize: 14, lineHeight: 20, marginBottom: 10 },
  emotions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  emotionTag: { backgroundColor: 'rgba(107,70,193,0.3)', borderWidth: 1, borderColor: 'rgba(107,70,193,0.3)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  emotionText: { color: '#c4b5fd', fontSize: 11 },
})