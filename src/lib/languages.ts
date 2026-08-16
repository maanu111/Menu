/**
 * Languages a menu can be offered in.
 *
 * English is the original the owner types, so it is not in this list — it is
 * always available and never translated.
 */
export const LANGUAGES = [
  { code: "hi", label: "हिन्दी", english: "Hindi" },
  { code: "kn", label: "ಕನ್ನಡ", english: "Kannada" },
  { code: "ta", label: "தமிழ்", english: "Tamil" },
  { code: "te", label: "తెలుగు", english: "Telugu" },
  { code: "ml", label: "മലയാളം", english: "Malayalam" },
  { code: "mr", label: "मराठी", english: "Marathi" },
  { code: "bn", label: "বাংলা", english: "Bengali" },
  { code: "gu", label: "ગુજરાતી", english: "Gujarati" },
  { code: "pa", label: "ਪੰਜਾਬੀ", english: "Punjabi" },
  { code: "ur", label: "اردو", english: "Urdu" },
  { code: "ar", label: "العربية", english: "Arabic" },
  { code: "fr", label: "Français", english: "French" },
  { code: "de", label: "Deutsch", english: "German" },
  { code: "es", label: "Español", english: "Spanish" },
  { code: "zh", label: "中文", english: "Chinese" },
  { code: "ja", label: "日本語", english: "Japanese" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

const BY_CODE = new Map(LANGUAGES.map((l) => [l.code, l]));

export function languageLabel(code: string) {
  return BY_CODE.get(code as LanguageCode)?.label ?? code;
}

export function languageEnglish(code: string) {
  return BY_CODE.get(code as LanguageCode)?.english ?? code;
}

export function isLanguage(code: string) {
  return BY_CODE.has(code as LanguageCode);
}

/** Whatever is stored on the restaurant, cleaned to codes we recognise. */
export function readLanguages(stored: unknown): LanguageCode[] {
  if (!Array.isArray(stored)) return [];
  return stored.filter((c): c is LanguageCode => typeof c === "string" && isLanguage(c));
}
