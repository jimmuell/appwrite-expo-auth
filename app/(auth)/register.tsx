import { Redirect } from 'expo-router'
import React, { useContext, useState } from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'
import { register } from '../../appwrite/auth'
import TextInputField from '../../components/TextInputField'
import { AuthContext } from '../_layout'

export default function Register() {
  const { user, setUser } = useContext(AuthContext)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Redirect href="/home" />

  async function onRegister() {
    if (!name || !email || !password) {
      Alert.alert('Missing info', 'Please enter name, email, and password.')
      return
    }
    setLoading(true)
    try {
      const me = await register(email.trim(), password, name.trim())
      setUser(me)
    } catch (e: any) {
      Alert.alert('Register failed', e?.message ?? 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 20 }}>Create your account</Text>
      <TextInputField label="Name" value={name} onChangeText={setName} />
      <TextInputField label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInputField label="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity onPress={onRegister} disabled={loading} style={{ backgroundColor: '#222', padding: 14, borderRadius: 8, marginTop: 4 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>{loading ? 'Creating…' : 'Create account'}</Text>
      </TouchableOpacity>
    </View>
  )
}
