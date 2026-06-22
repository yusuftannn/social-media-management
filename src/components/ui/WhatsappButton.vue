<template>
  <div class="whatsapp-wrapper">
    <div class="tooltip">
      <span class="status-dot"></span>
      WhatsApp Destek
    </div>

    <a
      :href="whatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="whatsapp-button"
      aria-label="WhatsApp Destek"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="currentColor"
      >
        <path
          d="M16.003 2.004c-7.739 0-14 6.27-14 14 0 2.47.64 4.888 1.846 7.22L2 30l6.27-1.79A13.94 13.94 0 0 0 16.003 30c7.73 0 14-6.27 14-14s-6.27-13.996-14-13.996zm8.16 19.94c-.34.96-1.98 1.79-2.74 1.84-.7.05-1.59.07-2.57-.24-.59-.19-1.35-.44-2.33-.87-4.1-1.77-6.78-5.9-6.99-6.18-.2-.28-1.67-2.22-1.67-4.23 0-2.1 1.1-3.14 1.49-3.57.39-.42.85-.53 1.13-.53.28 0 .57 0 .82.01.27.01.64-.1 1 .78.38.92 1.3 3.18 1.41 3.41.11.23.19.5.04.79-.15.3-.22.49-.44.75-.22.26-.47.58-.67.78-.22.22-.44.46-.19.9.25.43 1.12 1.84 2.4 2.98 1.65 1.47 3.04 1.92 3.47 2.13.43.21.68.18.93-.11.25-.3 1.08-1.26 1.37-1.7.29-.43.58-.36.98-.22.4.14 2.55 1.2 2.99 1.42.44.22.73.33.84.52.11.18.11 1.04-.23 2z"
        />
      </svg>
    </a>
  </div>
</template>

<script setup lang="ts">
const phone = '905555555555'

const message = encodeURIComponent(
  'Merhaba, bilgi almak istiyorum.'
)

const whatsappUrl =
  `https://wa.me/${phone}?text=${message}`
</script>

<style scoped>
.whatsapp-wrapper {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9999;
}

.whatsapp-button {
  width: 50px;
  height: 50px;

  border-radius: 999px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: white;
  background: #25d366;

  box-shadow:
    0 12px 32px rgba(37, 211, 102, 0.35),
    0 4px 12px rgba(0, 0, 0, 0.2);

  transition: all 0.25s ease;
}

.whatsapp-button:hover {
  transform: translateY(-4px) scale(1.05);
}

.whatsapp-button svg {
  width: 24px;
  height: 24px;
}

.tooltip {
  position: absolute;

  right: 74px;
  top: 50%;

  transform: translateY(-50%);

  background: white;
  color: #0f172a;

  border-radius: 12px;

  padding: 10px 14px;

  display: flex;
  align-items: center;
  gap: 8px;

  font-size: 14px;
  font-weight: 500;

  white-space: nowrap;

  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.12);

  opacity: 0;
  pointer-events: none;

  transition: all 0.25s ease;
}

.whatsapp-wrapper:hover .tooltip {
  opacity: 1;
}

.status-dot {
  width: 8px;
  height: 8px;

  border-radius: 999px;

  background: #22c55e;
}

:global(.dark) .tooltip {
  background: #0f172a;
  color: white;
}

@media (max-width: 768px) {
  .whatsapp-wrapper {
    right: 16px;
    bottom: 16px;
  }

  .whatsapp-button {
    width: 56px;
    height: 56px;
  }

  .whatsapp-button svg {
    width: 30px;
    height: 30px;
  }

  .tooltip {
    display: none;
  }
}
</style>