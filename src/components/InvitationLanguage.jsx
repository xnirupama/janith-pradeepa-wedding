"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { translations } from "@/data/translations";

const LanguageContext = createContext(null);
const STORAGE_KEY = "invitation-language";
const EVENT = "invitation-language-change";
let fallbackLanguage = "en";
let storageBlocked = false;
let fallbackSelected = false;
function getCookieLanguage() {
  try {
    return document.cookie.match(/(?:^|;\s*)invitation-language=(en|si)(?:;|$)/)?.[1] || "";
  } catch { return ""; }
}
function saveLanguageCookie(language) {
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${STORAGE_KEY}=${language}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  } catch {
    // The in-memory preference still works when browser storage is blocked.
  }
}
function subscribe(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  // Migrate an existing localStorage preference for subsequent server renders.
  saveLanguageCookie(getLanguage());
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
function getLanguage() {
  if (!storageBlocked) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "si") return stored;
    } catch { storageBlocked = true; }
  }
  return fallbackSelected ? fallbackLanguage : getCookieLanguage() || fallbackLanguage;
}
export function InvitationLanguageProvider({ children, initialLanguage = "en" }) {
  const serverLanguage = initialLanguage === "si" ? "si" : "en";
  const language = useSyncExternalStore(subscribe, getLanguage, () => serverLanguage);
  const setLanguage = (next) => {
    fallbackLanguage = next === "si" ? "si" : "en";
    fallbackSelected = true;
    try { localStorage.setItem(STORAGE_KEY, fallbackLanguage); } catch { storageBlocked = true; }
    saveLanguageCookie(fallbackLanguage);
    window.dispatchEvent(new Event(EVENT));
  };
  const t = (key, values = {}) => {
    const value = translations[language]?.[key] ?? translations.en[key] ?? key;
    return Object.entries(values).reduce((result, [name, replacement]) => result.replaceAll(`{${name}}`, () => String(replacement)), value);
  };
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { return useContext(LanguageContext); }
export function LanguageToggle({ floating = false }) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className={`language-toggle ${floating ? "language-toggle--floating" : ""}`} role="group" aria-label={t("languageLabel")}>
      <button type="button" lang="si" aria-pressed={language === "si"} onClick={() => setLanguage("si")}>සිං</button>
      <button type="button" lang="en" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
    </div>
  );
}
