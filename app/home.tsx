import { Redirect } from 'expo-router'
import React, { useContext, useState } from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'
import { logout } from '../appwrite/auth'
import { AuthContext } from './_layout'

export default function Home() {
  const { user, setUser } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)

  if (!user) return <Redirect href="/" />

  async function onLogout() {
    setLoading(true)
    try {
      await logout()
      setUser(null)
    } catch (e: any) {
      Alert.alert('Logout failed', e?.message ?? 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8 }}>Hello{user?.name ? `, ${user.name}` : ''}!</Text>
      <Text style={{ marginBottom: 24 }}>{user?.email}</Text>
      <TouchableOpacity onPress={onLogout} disabled={loading} style={{ backgroundColor: '#c00', padding: 14, borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>{loading ? 'Signing out…' : 'Sign out'}</Text>
      </TouchableOpacity>
    </View>
  )
}
