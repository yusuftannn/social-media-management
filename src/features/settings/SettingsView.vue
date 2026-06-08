<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Bell, Building2, Palette, RotateCcw, Save, Shield, UserRound } from '@lucide/vue'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import PageHeader from '@/components/ui/PageHeader.vue'
import { auth, db } from '@/firebase/config'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import type { AccountSettings, ContentPlatform } from '@/types'

type ProfileForm = {
  name: string
  email: string
  avatar: string
}

const defaultSettings = (): AccountSettings => ({
  companyName: '',
  website: '',
  phone: '',
  timezone: 'Europe/Istanbul',
  language: 'tr',
  defaultPlatform: 'Instagram',
  weeklyDigest: true,
  approvalNotifications: true,
  taskReminders: true,
  aiSuggestions: true,
})

const platforms: ContentPlatform[] = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'X']
const timezones = ['Europe/Istanbul', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'Asia/Dubai']

const authStore = useAuthStore()
const theme = useThemeStore()
const loading = ref(true)
const saving = ref(false)
const resetting = ref(false)
const message = ref('')
const error = ref('')

const profile = reactive<ProfileForm>({
  name: '',
  email: '',
  avatar: '',
})

const settings = reactive<AccountSettings>(defaultSettings())

const settingsRef = computed(() => {
  const userId = authStore.user?.id
  return userId ? doc(db, 'settings', userId) : null
})

const fillProfile = () => {
  profile.name = authStore.user?.name ?? ''
  profile.email = authStore.user?.email ?? ''
  profile.avatar = authStore.user?.avatar ?? ''
}

const loadSettings = async () => {
  loading.value = true
  error.value = ''
  fillProfile()

  try {
    if (!settingsRef.value) return

    const snapshot = await getDoc(settingsRef.value)
    Object.assign(settings, defaultSettings(), snapshot.exists() ? snapshot.data() : {})
  } catch {
    error.value = 'Ayarlar Firebase uzerinden yuklenemedi.'
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  if (!settingsRef.value) {
    error.value = 'Ayar kaydetmek icin oturum acmaniz gerekiyor.'
    return
  }

  saving.value = true
  message.value = ''
  error.value = ''

  try {
    await authStore.updateCurrentUserProfile({
      name: profile.name,
      avatar: profile.avatar,
    })

    await setDoc(
      settingsRef.value,
      {
        ...settings,
        companyName: settings.companyName.trim(),
        website: settings.website.trim(),
        phone: settings.phone.trim(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    fillProfile()
    message.value = 'Ayarlar kaydedildi.'
  } catch {
    error.value = 'Ayarlar kaydedilemedi. Firebase izinlerini ve baglantiyi kontrol edin.'
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  Object.assign(settings, defaultSettings())
  fillProfile()
  message.value = 'Form varsayılan ayarlara alindi. Kalici yapmak icin kaydedin.'
  error.value = ''
}

const sendPasswordReset = async () => {
  if (!profile.email) return

  resetting.value = true
  message.value = ''
  error.value = ''

  try {
    await authStore.resetPassword(profile.email)
    message.value = 'Parola sıfırlama e-postası gonderildi.'
  } catch {
    error.value = 'Parola sıfırlama e-postası gonderilemedi.'
  } finally {
    resetting.value = false
  }
}

const toggleDark = () => {
  theme.toggleDark()
}

onMounted(() => {
  void loadSettings()
})
</script>

<template>
  <PageHeader title="Ayarlar" description="Profil, sirket, tema ve bildirim tercihleri.">
    <button class="btn-primary" type="button" :disabled="saving || loading" @click="saveSettings">
      <Save class="h-4 w-4" />
      {{ saving ? 'Kaydediliyor...' : 'Kaydet' }}
    </button>
  </PageHeader>

  <div class="mb-4 flex flex-col gap-3">
    <p
      v-if="message"
      class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
    >
      {{ message }}
    </p>
    <p
      v-if="error"
      class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
    >
      {{ error }}
    </p>
  </div>

  <div v-if="loading" class="panel p-6 text-sm text-slate-500 dark:text-slate-400">Ayarlar yukleniyor...</div>

  <form v-else class="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]" @submit.prevent="saveSettings">
    <section class="panel p-5">
      <div class="mb-5 flex items-center gap-3">
        <UserRound class="h-5 w-5 text-brand" />
        <div>
          <h2 class="font-semibold">Profil</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Kullanici kimligi ve gorunen bilgiler.</p>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="space-y-1">
          <span class="text-sm font-medium">Ad soyad</span>
          <input v-model="profile.name" class="input w-full" required />
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">E-posta</span>
          <input v-model="profile.email" class="input w-full bg-slate-50 dark:bg-slate-900" disabled type="email" />
        </label>
        <label class="space-y-1 sm:col-span-2">
          <span class="text-sm font-medium">Avatar URL</span>
          <input v-model="profile.avatar" class="input w-full" placeholder="https://..." />
        </label>
      </div>
    </section>

    <section class="panel p-5">
      <div class="mb-5 flex items-center gap-3">
        <Building2 class="h-5 w-5 text-brand" />
        <div>
          <h2 class="font-semibold">Sirket</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Ajans bilgileri ve calisma bolgesi.</p>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="space-y-1">
          <span class="text-sm font-medium">Sirket adi</span>
          <input v-model="settings.companyName" class="input w-full" />
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Telefon</span>
          <input v-model="settings.phone" class="input w-full" />
        </label>
        <label class="space-y-1 sm:col-span-2">
          <span class="text-sm font-medium">Web sitesi</span>
          <input v-model="settings.website" class="input w-full" placeholder="https://..." />
        </label>
      </div>
    </section>

    <section class="panel p-5">
      <div class="mb-5 flex items-center gap-3">
        <Palette class="h-5 w-5 text-brand" />
        <div>
          <h2 class="font-semibold">Calisma Tercihleri</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Varsayılan dil, platform ve tema.</p>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="space-y-1">
          <span class="text-sm font-medium">Dil</span>
          <select v-model="settings.language" class="input w-full">
            <option value="tr">Turkce</option>
            <option value="en">English</option>
          </select>
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Saat dilimi</span>
          <select v-model="settings.timezone" class="input w-full">
            <option v-for="timezone in timezones" :key="timezone" :value="timezone">{{ timezone }}</option>
          </select>
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Varsayılan platform</span>
          <select v-model="settings.defaultPlatform" class="input w-full">
            <option v-for="platform in platforms" :key="platform" :value="platform">{{ platform }}</option>
          </select>
        </label>
        <label class="flex min-h-10 items-center justify-between gap-3 rounded-md border border-line px-3 dark:border-slate-700">
          <span class="text-sm font-medium">Dark mode</span>
          <input type="checkbox" :checked="theme.isDark" @change="toggleDark" />
        </label>
      </div>
    </section>

    <section class="panel p-5">
      <div class="mb-5 flex items-center gap-3">
        <Bell class="h-5 w-5 text-brand" />
        <div>
          <h2 class="font-semibold">Bildirimler</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Uygulama ici takip ve hatirlaticilar.</p>
        </div>
      </div>

      <div class="grid gap-3">
        <label class="flex min-h-12 items-center justify-between gap-3 rounded-md border border-line px-3 dark:border-slate-700">
          <span class="text-sm font-medium">Haftalik ozet</span>
          <input v-model="settings.weeklyDigest" type="checkbox" />
        </label>
        <label class="flex min-h-12 items-center justify-between gap-3 rounded-md border border-line px-3 dark:border-slate-700">
          <span class="text-sm font-medium">Onay bekleyen icerikler</span>
          <input v-model="settings.approvalNotifications" type="checkbox" />
        </label>
        <label class="flex min-h-12 items-center justify-between gap-3 rounded-md border border-line px-3 dark:border-slate-700">
          <span class="text-sm font-medium">Gorev hatirlaticilari</span>
          <input v-model="settings.taskReminders" type="checkbox" />
        </label>
        <label class="flex min-h-12 items-center justify-between gap-3 rounded-md border border-line px-3 dark:border-slate-700">
          <span class="text-sm font-medium">AI onerileri</span>
          <input v-model="settings.aiSuggestions" type="checkbox" />
        </label>
      </div>
    </section>

    <section class="panel p-5 xl:col-span-2">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <Shield class="h-5 w-5 text-brand" />
          <div>
            <h2 class="font-semibold">Guvenlik</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">Hesap erisimi ve form islemleri.</p>
          </div>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row">
          <button class="btn-muted" type="button" :disabled="resetting" @click="sendPasswordReset">
            {{ resetting ? 'Gonderiliyor...' : 'Parola sıfırlama e-postası' }}
          </button>
          <button class="btn-muted" type="button" @click="resetForm">
            <RotateCcw class="h-4 w-4" />
            Varsayılana al
          </button>
          <button class="btn-primary" type="submit" :disabled="saving">
            <Save class="h-4 w-4" />
            {{ saving ? 'Kaydediliyor...' : 'Kaydet' }}
          </button>
        </div>
      </div>
    </section>
  </form>
</template>
