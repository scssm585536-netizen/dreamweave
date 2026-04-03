import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/supabase'

interface Dream {
  id: string
  content: string
  emotions: string[]
  main_tag: string | null
  emotion_scores: Record<string, number> | null
  created_at: string
}

export default function ExploreScreen() {
  const router = useRouter()
  const [dreams, setDreams] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { fetchDreams() }, [])

  async function fetchDreams() {
    const { data } = await supabase
      .from('dreams')
      .select('id, content, emotions, main_tag, emotion_scores, created_at')
      .neq('visibility', 'private')
      .order('created_at', { ascending: false })
      .limit(50)
    setDreams(data ?? [])
    setLoading(false)
  }

  async function onRefresh() {
    setRefreshing(true)
    await fetchDreams()
    setRefreshing(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🌐 꿈 피드</Text>
        <TouchableOpacity onPress={() => router.push('/auth')} style={styles.loginBtn}>
          <Text style={styles.loginText}>로그인</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>전 세계 사람들의 꿈을 둘러보세요</Text>

      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
      >
        {loading ? (
          <Text style={styles.loadingText}>불러오는 중...</Text>
        ) : dreams.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={styles.emptyText}>아직 공개된 꿈이 없어요</Text>
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
                {dream.main_tag && (
                  <View style={styles.mainTag}>
                    <Text style={styles.mainTagText}>✦ {dream.main_tag}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardContent} numberOfLines={3}>
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
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070712' },
  orb1: { position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(107,70,193,0.15)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  backBtn: { paddingVertical: 8, paddingRight: 16 },
  backText: { color: '#6b7280', fontSize: 14 },
  title: { color: 'white', fontSize: 18, fontWeight: '900' },
  loginBtn: { backgroundColor: '#7c3aed', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 7 },
  loginText: { color: 'white', fontSize: 13, fontWeight: '600' },
  subtitle: { color: '#6b7280', fontSize: 13, paddingHorizontal: 20, marginBottom: 16 },
  list: { flex: 1, paddingHorizontal: 20 },
  loadingText: { color: '#6b7280', textAlign: 'center', marginTop: 40 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#6b7280', fontSize: 16 },
  card: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardDate: { color: '#6b7280', fontSize: 12 },
  mainTag: { backgroundColor: 'rgba(147,51,234,0.2)', borderWidth: 1, borderColor: 'rgba(147,51,234,0.3)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  mainTagText: { color: '#c4b5fd', fontSize: 11 },
  cardContent: { color: '#d1d5db', fontSize: 14, lineHeight: 20, marginBottom: 10 },
  emotions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  emotionTag: { backgroundColor: 'rgba(107,70,193,0.3)', borderWidth: 1, borderColor: 'rgba(107,70,193,0.3)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  emotionText: { color: '#c4b5fd', fontSize: 11 },
})
