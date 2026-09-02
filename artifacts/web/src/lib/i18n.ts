import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@/locales/en.json";
import he from "@/locales/he.json";
import fr from "@/locales/fr.json";
import de from "@/locales/de.json";
import vi from "@/locales/vi.json";
import ar from "@/locales/ar.json";

export const LANGUAGES = [
  { code: "en", label: "English", flag: "\uD83C\uDDFA\uD83C\uDDF8", dir: "ltr" as const },
  { code: "he", label: "\u05E2\u05D1\u05E8\u05D9\u05EA", flag: "\uD83C\uDDEE\uD83C\uDDF1", dir: "rtl" as const },
  { code: "fr", label: "Fran\u00E7ais", flag: "\uD83C\uDDEB\uD83C\uDDF7", dir: "ltr" as const },
  { code: "de", label: "Deutsch", flag: "\uD83C\uDDE9\uD83C\uDDEA", dir: "ltr" as const },
  { code: "vi", label: "Ti\u1EBFng Vi\u1EC7t", flag: "\uD83C\uDDFB\uD83C\uDDF3", dir: "ltr" as const },
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", flag: "\uD83C\uDDF8\uD83C\uDDE6", dir: "rtl" as const },
];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      he: { translation: he },
      fr: { translation: fr },
      de: { translation: de },
      vi: { translation: vi },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    supportedLngs: LANGUAGES.map((l) => l.code),
    interpolation: { escapeValue: false },
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "aica.lang",
      lookupQuerystring: "lang",
    },
  });

function applyDir(lng: string) {
  const entry = LANGUAGES.find((l) => l.code === lng) ?? LANGUAGES[0];
  if (typeof document !== "undefined") {
    document.documentElement.lang = entry.code;
    document.documentElement.dir = entry.dir;
  }
}

applyDir(i18n.language || "en");
i18n.on("languageChanged", applyDir);

export default i18n;
