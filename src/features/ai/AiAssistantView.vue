<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { aiService } from '@/services/aiService'

const topic = ref('Yeni sezon lansmanı')
const output = ref('')

const run = async (type: 'caption' | 'hashtags' | 'blog' | 'ideas') => {
  if (type === 'caption') output.value = await aiService.generateCaption(topic.value)
  if (type === 'hashtags') output.value = (await aiService.generateHashtags(topic.value)).join(' ')
  if (type === 'blog') output.value = await aiService.generateBlogPost(topic.value)
  if (type === 'ideas') output.value = (await aiService.generateIdeas(topic.value)).join('\n')
}
</script>

<template>
  <PageHeader title="AI İçerik Asistanı" description="OpenAI entegrasyonuna hazır mock servis katmanı." />
  <section class="panel p-4">
    <input v-model="topic" class="input w-full max-w-xl" placeholder="Konu" />
    <div class="mt-4 flex flex-wrap gap-2">
      <button class="btn-muted" @click="run('caption')">Caption</button>
      <button class="btn-muted" @click="run('hashtags')">Hashtag</button>
      <button class="btn-muted" @click="run('blog')">SEO Blog</button>
      <button class="btn-muted" @click="run('ideas')">Fikirler</button>
    </div>
    <pre class="mt-4 min-h-40 whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm text-slate-100">{{ output }}</pre>
  </section>
</template>
