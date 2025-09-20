# Appwrite Auth Setup Guide (Expo Router Reset)

This guide explains how to **reset a bare-bones Expo Router project** and scaffold a working **Appwrite authentication flow** (email/password login, register, logout, and protected routes).

---

## Prerequisites
- Node.js and npm installed
- Expo CLI (`npx` is fine)
- An Appwrite project with:
  - **API Endpoint** (e.g. `https://<REGION>.cloud.appwrite.io/v1`)
  - **Project ID**
  - iOS **bundleIdentifier** / Android **package** registered in Appwrite

---

## 1. Install Dependencies

From your Expo project root:

```sh
npx expo install expo-router
npx expo install react-native-appwrite react-native-url-polyfill
Ensure your package.json uses Expo Router:

json
Copy code
{
  "main": "expo-router/entry"
}
2. Update app.json
Replace identifiers with your own:

json
Copy code
{
  "expo": {
    "name": "my-app",
    "slug": "my-app",
    "scheme": "myapp",
    "plugins": ["expo-router"],
    "ios": { "bundleIdentifier": "com.example.myapp", "supportsTablet": true },
    "android": { "package": "com.example.myapp" }
  }
}
3. Reset Script
Save the following as scripts/setup-app.sh and make it executable:

bash
Copy code
#!/usr/bin/env bash
set -Eeuo pipefail

echo "PWD=$(pwd)"
echo "Using shell: $SHELL"
echo "Node version: $(node -v || true)"
echo "npm version:  $(npm -v || true)"
echo "--- Starting setup ---"

if [ ! -f "package.json" ]; then
  echo "ERROR: package.json not found in $(pwd). Run this from your project root."
  exit 1
fi

echo "Resetting app/ and creating folders..."
rm -rf app
mkdir -pv "app/(auth)" appwrite components

echo "Writing app/_layout.tsx..."
cat > app/_layout.tsx <<'EOL'
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
EOL

echo "Writing app/index.tsx..."
cat > app/index.tsx <<'EOL'
import React, { useContext } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Link, Redirect } from 'expo-router'
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
EOL

echo 'Writing app/(auth)/login.tsx...'
cat > "app/(auth)/login.tsx" <<'EOL'
import React, { useContext, useState } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { Link, Redirect } from 'expo-router'
import TextInputField from '../../components/TextInputField'
import { login } from '../../appwrite/auth'
import { AuthContext } from '../_layout'

export default function Login() {
  const { user, setUser } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Redirect href="/home" />

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
      <TouchableOpacity onPress={onLogin} disabled={loading} style={{ backgroundColor: '#222', padding: 14, borderRadius: 8, marginTop: 4 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>{loading ? 'Signing in…' : 'Sign in'}</Text>
      </TouchableOpacity>
      <Link href="/(auth)/register" style={{ textAlign: 'center', marginTop: 14, fontWeight: '600' }}>Create an account</Link>
    </View>
  )
}
EOL

echo 'Writing app/(auth)/register.tsx...'
cat > "app/(auth)/register.tsx" <<'EOL'
import React, { useContext, useState } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { Redirect } from 'expo-router'
import TextInputField from '../../components/TextInputField'
import { register } from '../../appwrite/auth'
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
EOL

echo 'Writing app/home.tsx...'
cat > app/home.tsx <<'EOL'
import React, { useContext, useState } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { Redirect } from 'expo-router'
import { AuthContext } from './_layout'
import { logout } from '../appwrite/auth'

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
EOL

echo 'Writing appwrite/client.ts...'
cat > appwrite/client.ts <<'EOL'
import 'react-native-url-polyfill/auto'
import { Client, Account, Models } from 'react-native-appwrite'

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>')
  .setPlatform('com.example.myapp')

export const account = new Account(client)
export type User = Models.User<Models.Preferences>
EOL

echo 'Writing appwrite/auth.ts...'
cat > appwrite/auth.ts <<'EOL'
import { account } from './client'
import { ID } from 'react-native-appwrite'

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
EOL

echo 'Writing components/TextInputField.tsx...'
cat > components/TextInputField.tsx <<'EOL'
import React from 'react'
import { TextInput, View, Text, TextInputProps } from 'react-native'

type Props = TextInputProps & { label: string }

export default function TextInputField({ label, style, ...rest }: Props) {
  return (
    <View style={{ width: '100%', marginBottom: 12 }}>
      <Text style={{ marginBottom: 6, fontWeight: '600' }}>{label}</Text>
      <TextInput
        style={[
          {
            height: 44,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            paddingHorizontal: 12
          },
          style
        ]}
        {...rest}
      />
    </View>
  )
}
EOL

echo "--- Done. Resulting tree ---"
command -v tree >/dev/null 2>&1 && tree -a -I node_modules || (echo "(install 'tree' for nicer output)"; ls -la; echo "--- app/ ---"; ls -la app; echo "--- app/(auth) ---"; ls -la "app/(auth)"; ls -la appwrite; ls -la components)
4. Wire into npm run
In package.json:

json
Copy code
{
  "scripts": {
    "setup-app": "bash ./scripts/setup-app.sh"
  }
}
Run it:

sh
Copy code
npm run setup-app
5. Replace placeholders
In appwrite/client.ts:

Replace <REGION> with your Appwrite endpoint region.

Replace <PROJECT_ID> with your Appwrite Project ID.

Replace com.example.myapp with your real bundle ID / package ID.

6. Start the App
sh
Copy code
npx expo start -c
7. Verify Auth Flow
Visit / → shows welcome screen with links to login/register.

Register → redirects to /home.

Logout → returns to /.

✅ You now have a reproducible reset + auth scaffold script inside your guide.

## 8. Header Management & UX Features

The authentication flow includes several UX improvements for better navigation:

### **Header Configuration**
- **No Back Arrows**: `headerBackVisible: false` prevents accidental navigation
- **Clean Headers**: `headerLeft: () => null` ensures no unwanted left elements
- **Centered Titles**: `headerTitleAlign: 'center'` for consistent styling

### **Screen-Specific Settings**
- **Welcome Screen**: `headerShown: false` for full-screen experience
- **Auth Pages**: `presentation: 'modal'` for slide-up animation
- **Home Screen**: No back button to prevent returning to auth after login

### **Navigation Benefits**
- **Secure Flow**: Users can't accidentally navigate back to auth pages
- **Modal Presentation**: Auth screens feel like temporary overlays
- **Clean Interface**: No header clutter on welcome screen
- **Intentional UX**: Each screen has purpose-built navigation

### **Implementation Details**
The Stack navigator in `app/_layout.tsx` includes:
```tsx
<Stack 
  screenOptions={{ 
    headerTitleAlign: 'center',
    headerBackVisible: false,
    headerLeft: () => null,
  }}
>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="(auth)/login" options={{ 
    title: 'Sign In', 
    presentation: 'modal' 
  }} />
  <Stack.Screen name="(auth)/register" options={{ 
    title: 'Create Account', 
    presentation: 'modal' 
  }} />
  <Stack.Screen name="home" options={{ 
    title: 'Home',
    headerBackVisible: false,
    headerLeft: () => null,
  }} />
</Stack>
```

yaml
Copy code


