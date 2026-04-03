import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function ProfileScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState('free')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/'); return }
      setEmail(user.email ?? '')
      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      setPlan(data?.plan ?? 'free')
    })
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />

      <View style={styles.content}>
        <Text style={styles.avatar}>👤</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.planBadge}>
          <Text style={styles.planText}>
            {plan === 'free' ? '🆓 Free 플랜' : plan === 'dreamer' ? '✨ Dreamer 플랜' : '🌟 Weaver 플랜'}
          </Text>
        </View>

        {plan === 'free' && (
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => Alert.alert('업그레이드', '웹에서 플랜을 업그레이드해주세요!\ndreamweave-a3pl.vercel.app/pricing')}
          >
            <Text style={styles.upgradeBtnText}>✦ 플랜 업그레이드</Text>
          </TouchableOpacity>
        )}

        <View style={styles.divider} />

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070712' },
  orb1: { position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(107,70,193,0.15)' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  avatar: { fontSize: 64, marginBottom: 16 },
  email: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  planBadge: { backgroundColor: 'rgba(124,58,237,0.2)', borderWidth: 1, borderColor: 'rgba(124,58,237,0.4)', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 24 },
  planText: { color: '#c4b5fd', fontSize: 14, fontWeight: '600' },
  upgradeBtn: { backgroundColor: '#7c3aed', borderRadius: 30, paddingHorizontal: 32, paddingVertical: 14, marginBottom: 40 },
  upgradeBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 32 },
  signOutBtn: { paddingVertical: 12, paddingHorizontal: 32 },
  signOutText: { color: '#6b7280', fontSize: 15 },
})