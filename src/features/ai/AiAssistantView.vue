<script setup lang="ts">
import { Clipboard } from '@lucide/vue'
import { ref } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { aiService } from '@/services/aiService'
import { useToast } from '@/composables/useToast'

const topic = ref('Yeni sezon lansmanı')
const output = ref('')
const running = ref(false)
const error = ref('')
const toast = useToast()

const run = async (type: 'caption' | 'hashtags' | 'blog' | 'ideas') => {
  if (!topic.value.trim()) {
    error.value = 'Önce bir konu girin.'
    return
  }

  running.value = true
  error.value = ''

  try {
    if (type === 'caption') output.value = await aiService.generateCaption(topic.value)
    if (type === 'hashtags') output.value = (await aiService.generateHashtags(topic.value)).join(' ')
    if (type === 'blog') output.value = await aiService.generateBlogPost(topic.value)
    if (type === 'ideas') output.value = (await aiService.generateIdeas(topic.value)).join('\n')
  } catch {
    error.value = 'İçerik üretilemedi. Lütfen tekrar deneyin.'
  } finally {
    running.value = false
  }
}

const copyOutput = async () => {
  if (!output.value) return

  try {
    await navigator.clipboard.writeText(output.value)
    toast.success('AI çıktısı panoya kopyalandı.')
  } catch {
    toast.error('AI çıktısı panoya kopyalanamadı.')
  }
}
</script>

<template>
  <PageHeader title="AI İçerik Asistanı" description="OpenAI entegrasyonuna hazır mock servis katmanı." />
  <section class="panel p-4">
    <input v-model="topic" class="input w-full max-w-xl" placeholder="Konu" />
    <div class="mt-4 flex flex-wrap gap-2">
      <button class="btn-muted" :disabled="running" @click="run('caption')">Caption</button>
      <button class="btn-muted" :disabled="running" @click="run('hashtags')">Hashtag</button>
      <button class="btn-muted" :disabled="running" @click="run('blog')">SEO Blog</button>
      <button class="btn-muted" :disabled="running" @click="run('ideas')">Fikirler</button>
    </div>
    <p v-if="error" class="mt-4 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    <div class="mt-4 flex items-center justify-between gap-3">
      <span class="text-sm text-slate-500 dark:text-slate-400">
        {{ running ? 'İçerik hazırlanıyor...' : output ? 'Hazır çıktı' : 'Henüz çıktı yok' }}
      </span>
      <button
        v-if="output"
        class="btn-muted"
        type="button"
        :disabled="running"
        @click="copyOutput"
      >
        <Clipboard class="h-4 w-4" />
        Kopyala
      </button>
    </div>
    <pre class="mt-2 min-h-40 whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm text-slate-100">{{ running ? 'Üretiliyor...' : output }}</pre>
  </section>
</template>
