import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { translations } from '../i18n/translations';

export const useLocaleStore = defineStore('locale', () => {
  const currentLang = ref(localStorage.getItem('duc_lang') || 'en');

  function setLanguage(lang) {
    if (translations[lang]) {
      currentLang.value = lang;
      localStorage.setItem('duc_lang', lang);
      document.documentElement.setAttribute('lang', lang);
    }
  }

  function toggleLanguage() {
    const nextLang = currentLang.value === 'en' ? 'km' : 'en';
    setLanguage(nextLang);
  }

  function t(key) {
    const langData = translations[currentLang.value] || translations.en;
    return langData[key] || translations.en[key] || key;
  }

  const currentLocale = computed(() => currentLang.value);

  // Initialize lang on load
  document.documentElement.setAttribute('lang', currentLang.value);

  return {
    currentLang,
    currentLocale,
    setLanguage,
    toggleLanguage,
    t
  };
});
