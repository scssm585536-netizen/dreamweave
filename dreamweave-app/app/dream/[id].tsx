import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { supabase } from '../../lib/supabase'

interface Dream {
  id: string
  user_id: string
  content: string
  interpretation: string
  emotions: string[]
  keywords: string[]
  main_tag: string | null
  emotion_scores: Record<string, number> | null
  keyword_scores: Record<string, number> | null
  visibility: string
  created_at: string
}

export default function DreamDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [dream, setDream] = useState<Dream | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
    fetchDream()
  }, [id])

  useEffect(() => {
    if (userId && dream) setIsOwner(dream.user_id === userId)
  }, [userId, dream])

  async function fetchDream() {
    const { data } = await supabase
      .from('dreams')
      .select('*')
      .eq('id', id)
      .single()
    setDream(data)
  }

  async function handleDelete() {
    Alert.alert('삭제', '정말 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('dreams').delete().eq('id', id)
          router.back()
        }
      }
    ])
  }

  async function handleShare() {
    Share.share({
      message: `내 꿈을 DreamWeave에 기록했어요 🧵\n\n${dream?.content?.slice(0, 100)}...\n\nhttps://dreamweave-a3pl.vercel.app/dream/${id}`,
    })
  }

  async function handleVisibility(v: string) {
    await supabase.from('dreams').update({ visibility: v }).eq('id', id)
    setDream((prev) => prev ? { ...prev, visibility: v } : prev)
  }

  if (!dream) return (
    <View style={styles.loading}>
      <Text style={styles.loadingEmoji}>🧵</Text>
    </View>
  )

  const emotions = dream.emotions ?? []
  const keywords = dream.keywords ?? []
  const scores = dream.emotion_scores ?? {}

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>공유</Text>
          </TouchableOpacity>
          {isOwner && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.date}>
          {new Date(dream.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>

        {/* 공개 범위 변경 (본인만) */}
        {isOwner && (
          <View style={styles.visibilityContainer}>
            <Text style={styles.sectionLabel}>공개 범위</Text>
            <View style={styles.visibilityOptions}>
              {([
                { value: 'private', label: '🔒 비공개' },
                { value: 'anonymous', label: '👤 익명' },
                { value: 'public', label: '🌐 공개' },
              ]).map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.visibilityBtn, dream.visibility === opt.value && styles.activeVisibility]}
                  onPress={() => handleVisibility(opt.value)}
                >
                  <Text style={[styles.visibilityBtnText, dream.visibility === opt.value && styles.activeVisibilityText]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 꿈 내용 */}
        <Text style={styles.sectionLabel}>꿈 내용</Text>
        <Text style={styles.dreamContent}>{dream.content}</Text>

        {/* AI 해석 */}
        {dream.interpretation && (
          <View style={styles.interpretationBox}>
            <Text style={styles.interpretationLabel}>🔮 AI 해석 (Jung 심리학)</Text>
            <Text style={styles.interpretationText}>{dream.interpretation}</Text>
          </View>
        )}

        {/* 감정 */}
        {emotions.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>감정</Text>
            <View style={styles.tags}>
              {[...emotions]
                .sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0))
                .map((e, i) => (
                  <View key={e} style={[styles.emotionTag, i === 0 && styles.topEmotionTag]}>
                    <Text style={[styles.tagText, i === 0 && styles.topTagText]}>
                      {i === 0 ? '✦ ' : ''}{e}{scores[e] ? ` ${scores[e]}%` : ''}
                    </Text>
                  </View>
                ))}
            </View>
          </>
        )}

        {/* 핵심 상징 */}
        {keywords.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>핵심 상징</Text>
            <View style={styles.tags}>
              {keywords.map((k) => (
                <View key={k} style={styles.keywordTag}>
                  <Text style={styles.keywordText}>#{k}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070712' },
  loading: { flex: 1, backgroundColor: '#070712', alignItems: 'center', justifyContent: 'center' },
  loadingEmoji: { fontSize: 40 },
  orb1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(107,70,193,0.15)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  backText: { color: '#6b7280', fontSize: 14 },
  headerActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  actionBtnText: { color: '#9ca3af', fontSize: 13 },
  deleteBtn: { borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  deleteBtnText: { color: '#ef4444', fontSize: 13 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  date: { color: '#6b7280', fontSize: 13, marginBottom: 20 },
  sectionLabel: { color: '#6b7280', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, marginTop: 24 },
  dreamContent: { color: '#e2e8f0', fontSize: 16, lineHeight: 26 },
  interpretationBox: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)', borderRadius: 16, padding: 16, marginTop: 24 },
  interpretationLabel: { color: '#a78bfa', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  interpretationText: { color: '#d1d5db', fontSize: 15, lineHeight: 24, fontStyle: 'italic' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emotionTag: { backgroundColor: 'rgba(107,70,193,0.3)', borderWidth: 1, borderColor: 'rgba(107,70,193,0.3)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  topEmotionTag: { backgroundColor: 'rgba(124,58,237,0.3)', borderColor: 'rgba(124,58,237,0.6)' },
  tagText: { color: '#c4b5fd', fontSize: 13 },
  topTagText: { color: '#e9d5ff', fontWeight: '600' },
  keywordTag: { backgroundColor: 'rgba(67,56,202,0.3)', borderWidth: 1, borderColor: 'rgba(67,56,202,0.3)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  keywordText: { color: '#a5b4fc', fontSize: 13 },
  visibilityContainer: { marginBottom: 8 },
  visibilityOptions: { flexDirection: 'row', gap: 8 },
  visibilityBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  activeVisibility: { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: 'rgba(124,58,237,0.5)' },
  visibilityBtnText: { color: '#6b7280', fontSize: 12 },
  activeVisibilityText: { color: '#c4b5fd', fontWeight: '600' },
})
