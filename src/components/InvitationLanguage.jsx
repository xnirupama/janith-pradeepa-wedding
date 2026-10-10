"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { translations } from "@/data/translations";

const LanguageContext = createContext(null);
const STORAGE_KEY = "invitation-language";
const EVENT = "invitation-language-change";
let fallbackLanguage = "en";
let storageBlocked = false;
function subscribe(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
function getLanguage() {
  if (storageBlocked) return fallbackLanguage;
  try { return localStorage.getItem(STORAGE_KEY) === "si" ? "si" : "en"; }
  catch { storageBlocked = true; return fallbackLanguage; }
}
export function InvitationLanguageProvider({ children }) {
  const language = useSyncExternalStore(subscribe, getLanguage, () => "en");
  const setLanguage = (next) => {
    fallbackLanguage = next === "si" ? "si" : "en";
    try { localStorage.setItem(STORAGE_KEY, fallbackLanguage); } catch { storageBlocked = true; }
    window.dispatchEvent(new Event(EVENT));
  };
  const t = (key, values = {}) => {
    const value = translations[language]?.[key] ?? translations.en[key] ?? key;
    return Object.entries(values).reduce((result, [name, replacement]) => result.replaceAll(`{${name}}`, replacement), value);
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
