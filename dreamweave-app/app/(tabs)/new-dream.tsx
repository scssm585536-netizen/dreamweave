import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'

type Visibility = 'private' | 'anonymous' | 'public'

export default function NewDreamScreen() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('anonymous')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  async function handleSubmit() {
    if (!content.trim() || !userId) return
    setLoading(true)
    try {
      const res = await fetch('https://dreamweave-a3pl.vercel.app/api/dream/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, visibility, userId, plan: 'free' }),
      })
      const { dream, error } = await res.json()
      if (error) throw new Error(error)
      Alert.alert('🎉 완료', '꿈이 기록됐어요!', [
        { text: '확인', onPress: () => { setContent(''); router.push('/(tabs)/dashboard') } }
      ])
    } catch (err: any) {
      Alert.alert('오류', err.message ?? '꿈 저장에 실패했어요')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.orb1} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.badge}>오늘의 꿈</Text>
        <Text style={styles.title}>꿈을 기록해요</Text>
        <Text style={styles.desc}>기억나는 만큼만 써도 괜찮아요</Text>

        <Text style={styles.label}>꿈 내용</Text>
        <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder="오늘 밤, 나는..."
          placeholderTextColor="#374151"
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{content.length}자</Text>

        <Text style={styles.label}>공개 범위</Text>
        <View style={styles.visibilityOptions}>
          {([
            { value: 'private' as Visibility, icon: '🔒', label: '비공개', desc: '나만 보기' },
            { value: 'anonymous' as Visibility, icon: '👤', label: '익명', desc: '직물 참여' },
            { value: 'public' as Visibility, icon: '🌐', label: '공개', desc: '닉네임 표시' },
          ]).map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.visibilityOption, visibility === opt.value && styles.activeOption]}
              onPress={() => setVisibility(opt.value)}
            >
              <Text style={styles.visibilityIcon}>{opt.icon}</Text>
              <Text style={styles.visibilityLabel}>{opt.label}</Text>
              <Text style={styles.visibilityDesc}>{opt.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, (loading || !content.trim()) && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={loading || !content.trim()}
        >
          <Text style={styles.submitBtnText}>
            {loading ? '해석 중... 🔮' : '꿈 저장하기 →'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070712' },
  orb1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(107,70,193,0.15)' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  badge: { color: '#a78bfa', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 },
  title: { color: 'white', fontSize: 28, fontWeight: '900', marginBottom: 8 },
  desc: { color: '#6b7280', fontSize: 14, marginBottom: 32 },
  label: { color: '#6b7280', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  input: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, color: 'white', fontSize: 15, minHeight: 160, marginBottom: 4 },
  charCount: { color: '#374151', fontSize: 12, textAlign: 'right', marginBottom: 28 },
  visibilityOptions: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  visibilityOption: { flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 12, alignItems: 'center' },
  activeOption: { backgroundColor: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.5)' },
  visibilityIcon: { fontSize: 20, marginBottom: 4 },
  visibilityLabel: { color: 'white', fontSize: 12, fontWeight: '600', marginBottom: 2 },
  visibilityDesc: { color: '#6b7280', fontSize: 10 },
  submitBtn: { backgroundColor: '#7c3aed', borderRadius: 30, paddingVertical: 18, alignItems: 'center' },
  disabledBtn: { opacity: 0.3 },
  submitBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
})