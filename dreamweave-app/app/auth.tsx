import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/supabase'

export default function AuthScreen() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
      router.replace('/(tabs)/dashboard')
    } catch (err: any) {
      Alert.alert('오류', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <View style={styles.content}>
        <Text style={styles.logo}>🧵</Text>
        <Text style={styles.title}>DreamWeave</Text>
        <Text style={styles.desc}>꿈을 기록하고 세상과 연결하세요</Text>

        {/* 탭 */}
        <View style={styles.tabs}>
          {(['login', 'signup'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.tab, mode === m && styles.activeTab]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.tabText, mode === m && styles.activeTabText]}>
                {m === 'login' ? '로그인' : '회원가입'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 입력 */}
        <View style={styles.form}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="hello@example.com"
            placeholderTextColor="#374151"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#374151"
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.disabledBtn]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070712' },
  orb1: { position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(107,70,193,0.2)' },
  orb2: { position: 'absolute', bottom: -100, right: -100, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(99,102,241,0.15)' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, zIndex: 10 },
  logo: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '900', color: 'white', marginBottom: 8 },
  desc: { color: '#6b7280', fontSize: 14, marginBottom: 40 },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 30, padding: 4, marginBottom: 32, width: 280 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 26, alignItems: 'center' },
  activeTab: { backgroundColor: '#7c3aed' },
  tabText: { color: '#6b7280', fontWeight: '600', fontSize: 14 },
  activeTabText: { color: 'white' },
  form: { width: '100%' },
  label: { color: '#6b7280', fontSize: 11, letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: 'white', fontSize: 14, marginBottom: 20 },
  submitBtn: { backgroundColor: '#7c3aed', borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  disabledBtn: { opacity: 0.4 },
  submitBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
})