
# Social Media Management

Bu proje depo, sosyal medya içerik planlama, görev yönetimi, proje takibi, müşteri yönetimi ve temel raporlama ihtiyaçlarına yönelik bir yönetim paneli sağlar. Ayrıca AI destekli içerik öneri/düzenleme bileşeni içerir (`src/features/ai`).

## Özellikler

- Kullanıcı kimlik doğrulama (Firebase Auth entegrasyonu için hazır)
- İçerik planlama ve takvim görünümü
- Görev ve proje yönetimi
- Müşteri/hesap yönetimi
- Raporlama panosu
- AI destekli içerik asistanı (placeholder servis `src/services/aiService.ts`)

## Teknoloji yığını

- Vue 3 + TypeScript
- Vite
- Tailwind CSS
- Pinia (store management)
- Firebase (Auth, Firestore)

## Gereksinimler

- Node.js v16+ (LTS önerilir)
- npm veya yarn

## Kurulum

Projeyi klonlayın ve bağımlılıkları yükleyin:

```bash
git clone <repo-url>
cd social-media-management
npm install
```

Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

Tarayıcıda `http://localhost:5173` (Vite varsayılan) açın.

Üretim derlemesi ve önizleme:

```bash
npm run build
npm run preview
```

## Ortam Değişkenleri (örnek)

Projede Firebase yapılandırmasını doğrudan `src/firebase/config.ts` içinde de tutabilirsiniz, ancak daha güvenli ve taşınabilir olması için ortam değişkenleri kullanılması önerilir. Aşağıda örnek bir `.env.example` gösterimi:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=sender_id
VITE_FIREBASE_APP_ID=app_id
```

Bu değişkenleri `.env.local` içinde oluşturup gerçek değerlerle doldurun. Vite, `VITE_` ile başlayan değişkenleri ön uca enjekte eder.

## Kullanışlı npm script'leri

- `npm run dev` — geliştirme sunucusunu başlatır
- `npm run build` — üretim için derleme yapar
- `npm run preview` — üretim derlemesini yerel olarak önizler

(Projede linter/test script'leri varsa `package.json` içinde görebilirsiniz.)

## Proje Yapısı (anahtar klasörler)

- `src/app` — uygulama kökü ve ortak UI bileşenleri (`App.vue`, layout bileşenleri)
- `src/app/components/ui` — yeniden kullanılabilir UI parçaları (`PageHeader.vue`, `StatCard.vue`, `Toast.vue`)
- `src/features` — özellik bazlı view'lar ve alt bileşenler (ör. `dashboard`, `tasks`, `ai`)
- `src/services` — API/servis katmanı (`aiService.ts`, `crudService.ts`)
- `src/stores` — Pinia mağazaları (`authStore.ts`, `toastStore.ts`)
- `src/firebase` — Firebase yapılandırma ve yardımcıları
- `src/styles` — Tailwind ana dosyası

## İletişim

Sorularınız, geri bildirimleriniz veya iş birliği fırsatları için dilediğiniz zaman iletişime geçebilirsiniz.

🌐 **Website**  
https://www.yusuftan.com.tr

💼 **LinkedIn**  
https://www.linkedin.com/in/yusuftann/

📧 **Email**  
yusuftan41@hotmail.com