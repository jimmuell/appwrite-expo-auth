import { ID } from 'react-native-appwrite'
import { account } from './client'

export async function register(email: string, password: string, name: string) {
  await account.create({ userId: ID.unique(), email, password, name })
  await account.createEmailPasswordSession({ email, password })
  return account.get()
}

export async function login(email: string, password: string) {
  await account.createEmailPasswordSession({ email, password })
  return account.get()
}

export async function logout() {
  return account.deleteSession('current')
}
