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
  async generateContentSuggestions(
    topic: string,
    platform = 'Instagram',
    contentType = 'Post',
    tone = 'Profesyonel',
    goal = 'Farkındalık',
  ) {
    const baseTopic = topic.trim() || 'marka büyümesi'
    const normalizedTopic = baseTopic.replace(/\s+/g, ' ').trim()
    const platformLabel = platform.toLowerCase()
    const typeLabel = contentType.toLowerCase()
    const toneLabel = tone.toLowerCase()
    const goalLabel = goal.toLowerCase()

    return {
      title: `${normalizedTopic} için ${typeLabel} fikri`,
      description: `${normalizedTopic} konusunu ${platformLabel} için ${toneLabel} bir dille anlatan ${typeLabel} metni. ${goalLabel} hedefiyle hazırlanır; başlık, fayda odaklı anlatım ve güven oluşturan CTA kullanılır.`,
      hook: `${normalizedTopic} için izleyicinin ilk 3 saniyesinde ilgisini çeken güçlü açılış cümlesi.`,
      cta: 'Yorumlara “Bu çözümü denemek ister misiniz?” yazarak etkileşimi artırın.',
      hashtags: [
        `#${normalizedTopic.replace(/\s+/g, '').toLowerCase()}`,
        '#sosyalmedya',
        '#icerikstratejisi',
        '#dijitalajans',
        `#${platformLabel}`,
      ],
      postingPlan: `1) Kısa teaser paylaşımı, 2) ${typeLabel} sürümüne geçiş, 3) yorumlara cevap ve performans izleme.`,
      audience: `Markasını ${goalLabel} hedefiyle büyütmek isteyen hedef kitle.`,
    }
  },
}
