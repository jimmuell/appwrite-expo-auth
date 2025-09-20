import { Link, Redirect } from 'expo-router'
import React, { useContext } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { AuthContext } from './_layout'

export default function Index() {
  const { user } = useContext(AuthContext)
  if (user) return <Redirect href="/home" />
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 24 }}>Welcome</Text>
      <Link href="/(auth)/login" asChild>
        <TouchableOpacity style={{ backgroundColor: '#222', padding: 14, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Sign in</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/(auth)/register" asChild>
        <TouchableOpacity style={{ padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#222' }}>
          <Text style={{ textAlign: 'center', fontWeight: '600' }}>Create an account</Text>
        </TouchableOpacity>
      </Link>
    </View>
  )
}
