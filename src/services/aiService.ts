export const aiService = {
  async generateCaption(topic: string) {
    return `${topic} için net fayda, güçlü görsel fikir ve aksiyona çağrı içeren modern Instagram caption taslağı.`
  },
  async generateHashtags(topic: string) {
    return [`#${topic.replace(/\s+/g, '')}`, '#sosyalmedya', '#dijitalajans', '#icerikstratejisi']
  },
  async generateBlogPost(topic: string) {
    return `${topic} başlıklı SEO blog taslağı: giriş, hedef kitle problemi, çözüm önerileri ve ölçülebilir sonuçlar.`
  },
  async generateIdeas(topic: string) {
    return [
      `${topic} için müşteri hikayesi`,
      `${topic} hakkında kısa eğitim serisi`,
      `${topic} performans sonuçları paylaşımı`,
    ]
  },
  async generateContentSuggestions(topic: string, platform = 'Instagram', contentType = 'Post') {
    const baseTopic = topic.trim() || 'marka büyümesi'
    const normalizedTopic = baseTopic.replace(/\s+/g, ' ').trim()
    const platformLabel = platform.toLowerCase()
    const typeLabel = contentType.toLowerCase()

    return {
      title: `${normalizedTopic} için ${typeLabel} fikri`,
      description: `${normalizedTopic} konusunu ${platformLabel} için kısa, dikkat çekici ve etkileşimi artıran bir dille anlatan ${typeLabel} metni. Kullanıcıların ilgisini çeken bir fayda vurgusu ve net bir çağrı ekleyin.`,
      hashtags: [
        `#${normalizedTopic.replace(/\s+/g, '').toLowerCase()}`,
        '#sosyalmedya',
        '#icerikstratejisi',
        '#dijitalajans',
      ],
    }
  },
}
