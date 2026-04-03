import { Tabs } from 'expo-router'
import { Text } from 'react-native'

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f0f1f',
          borderTopColor: 'rgba(255,255,255,0.06)',
        },
        tabBarActiveTintColor: '#a78bfa',
        tabBarInactiveTintColor: '#4b5563',
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: '꿈', tabBarIcon: ({ color }) => <TabIcon emoji="🌙" /> }} />
      <Tabs.Screen name="new-dream" options={{ title: '기록', tabBarIcon: ({ color }) => <TabIcon emoji="✍️" /> }} />
      <Tabs.Screen name="weave" options={{ title: '직물', tabBarIcon: ({ color }) => <TabIcon emoji="🌐" /> }} />
      <Tabs.Screen name="profile" options={{ title: '프로필', tabBarIcon: ({ color }) => <TabIcon emoji="👤" /> }} />
    </Tabs>
  )
}