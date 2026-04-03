import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

const supabaseUrl = 'https://ficrhsijzkzjqstnchju.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpY3Joc2lqemt6anFzdG5jaGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMjQ3MTMsImV4cCI6MjA4NzgwMDcxM30.Gz8W8A6Ji_BGM0q4Yxx2XGL4eb2bYD25ybatMnLW-7U'

// Conditionally import AsyncStorage only for native platforms
const getStorage = () => {
  if (Platform.OS === 'web') {
    // For web, use localStorage or return undefined
    if (typeof window !== 'undefined' && window.localStorage) {
      return {
        getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
        setItem: (key: string, value: string) => Promise.resolve(window.localStorage.setItem(key, value)),
        removeItem: (key: string) => Promise.resolve(window.localStorage.removeItem(key)),
      }
    }
    return undefined
  }
  // For native platforms, use AsyncStorage
  const AsyncStorage = require('@react-native-async-storage/async-storage').default
  return AsyncStorage
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
