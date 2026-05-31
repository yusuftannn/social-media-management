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
}
