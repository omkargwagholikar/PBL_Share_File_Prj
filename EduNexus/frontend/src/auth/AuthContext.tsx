import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getFirebaseAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onIdTokenChanged,
  updateProfile,
  type FirebaseUser,
} from '@/lib/firebase'
import type { AuthUser } from '@/types'

type AuthContextValue = {
  user: AuthUser | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function toAuthUser(fb: FirebaseUser | null): AuthUser | null {
  if (!fb) return null
  return {
    uid: fb.uid,
    email: fb.email,
    display_name: fb.displayName,
    role: 'student',
  }
}

const DEV_MODE = !import.meta.env.VITE_FIREBASE_API_KEY

const DEV_USER: AuthUser = {
  uid: 'dev-user',
  email: 'demo@edunexus.local',
  display_name: 'Demo Student',
  role: 'student',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(!DEV_MODE)
  const [devSignedIn, setDevSignedIn] = useState(DEV_MODE)

  useEffect(() => {
    if (DEV_MODE) return
    const unsub = onIdTokenChanged(getFirebaseAuth(), (fb) => {
      setFirebaseUser(fb)
      setLoading(false)
    })
    return unsub
  }, [])

  if (DEV_MODE) {
    const value: AuthContextValue = {
      user: devSignedIn ? DEV_USER : null,
      firebaseUser: null,
      loading: false,
      async signIn() {
        setDevSignedIn(true)
      },
      async signUp() {
        setDevSignedIn(true)
      },
      async signOut() {
        setDevSignedIn(false)
      },
    }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user: toAuthUser(firebaseUser),
      firebaseUser,
      loading,
      async signIn(email, password) {
        await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
      },
      async signUp(name, email, password) {
        const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
        if (cred.user && name) await updateProfile(cred.user, { displayName: name })
      },
      async signOut() {
        await fbSignOut(getFirebaseAuth())
      },
    }),
    [firebaseUser, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
