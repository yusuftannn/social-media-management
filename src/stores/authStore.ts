import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import type { AppUser, UserRole } from '@/types'

const defaultRole: UserRole = 'Agency Owner'

const toAppUser = async (firebaseUser: User): Promise<AppUser> => {
  let data: Partial<AppUser> | undefined

  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    data = userDoc.data() as Partial<AppUser> | undefined
  } catch {
    data = undefined
  }

  return {
    id: firebaseUser.uid,
    name: data?.name ?? firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'Kullanici',
    email: firebaseUser.email ?? data?.email ?? '',
    role: data?.role ?? defaultRole,
    avatar: firebaseUser.photoURL ?? data?.avatar,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AppUser | null>(null)
  const loading = ref(true)
  const authReady = ref(false)
  const isAuthenticated = computed(() => Boolean(user.value))

  let readyPromise: Promise<void> | null = null

  const init = () => {
    if (readyPromise) return readyPromise

    readyPromise = new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        loading.value = true
        user.value = firebaseUser ? await toAppUser(firebaseUser) : null
        loading.value = false
        authReady.value = true
        resolve()
      })
    })

    return readyPromise
  }

  const login = async (email: string, password: string) => {
    loading.value = true
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      user.value = await toAppUser(credential.user)
    } finally {
      loading.value = false
    }
  }

  const register = async (name: string, email: string, password: string, role: UserRole = defaultRole) => {
    loading.value = true
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)

      await updateProfile(credential.user, { displayName: name })
      try {
        await setDoc(doc(db, 'users', credential.user.uid), {
          name,
          email,
          role,
          createdAt: serverTimestamp(),
        })
      } catch {
        // Auth registration should still succeed if Firestore profile writes are not open yet.
      }

      user.value = await toAppUser(credential.user)
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const logout = async () => {
    await signOut(auth)
  }

  return { user, loading, authReady, isAuthenticated, init, login, register, resetPassword, logout }
})
