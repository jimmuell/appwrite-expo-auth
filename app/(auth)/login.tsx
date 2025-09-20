import { Link, Redirect } from 'expo-router'
import React, { useContext, useState } from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'
import { login } from '../../appwrite/auth'
import TextInputField from '../../components/TextInputField'
import { AuthContext } from '../_layout'

export default function Login() {
  const { user, setUser } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Redirect href="/home" />

  function fillTestCredentials() {
    setEmail('jimmuell@aol.com')
    setPassword('12345678')
  }

  async function onLogin() {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter email and password.')
      return
    }
    setLoading(true)
    try {
      const me = await login(email.trim(), password)
      setUser(me)
    } catch (e: any) {
      Alert.alert('Login failed', e?.message ?? 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 20 }}>Sign in</Text>
      <TextInputField label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInputField label="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity onPress={fillTestCredentials} style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginTop: 4, marginBottom: 8 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Use Test Credentials</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onLogin} disabled={loading} style={{ backgroundColor: '#222', padding: 14, borderRadius: 8, marginTop: 4 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>{loading ? 'Signing in…' : 'Sign in'}</Text>
      </TouchableOpacity>
      <Link href="/(auth)/register" style={{ textAlign: 'center', marginTop: 14, fontWeight: '600' }}>Create an account</Link>
    </View>
  )
}
