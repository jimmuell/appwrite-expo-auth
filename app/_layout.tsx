import { Stack } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import 'react-native-url-polyfill/auto'
import { account, type User } from '../appwrite/client'

export const AuthContext = React.createContext<{
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}>({ user: null, setUser: () => {} })

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const me = await account.get()
        setUser(me)
      } catch {
        setUser(null)
      } finally {
        setChecking(false)
      }
    })()
  }, [])

  const ctx = useMemo(() => ({ user, setUser }), [user])

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <AuthContext.Provider value={ctx}>
      <Stack 
        screenOptions={{ 
          headerTitleAlign: 'center',
          headerBackVisible: false,
          headerLeft: () => null,
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Welcome',
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="(auth)/login" 
          options={{ 
            title: 'Sign In',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="(auth)/register" 
          options={{ 
            title: 'Create Account',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="home" 
          options={{ 
            title: 'Home',
            headerBackVisible: false,
            headerLeft: () => null,
          }} 
        />
      </Stack>
    </AuthContext.Provider>
  )
}
