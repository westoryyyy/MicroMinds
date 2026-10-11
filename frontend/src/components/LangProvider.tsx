"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Lang = "en" | "id";

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (en: string, id: string) => string;
}>({
  lang: "en",
  setLang: () => {},
  t: (en, id) => en,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("mm_lang") as Lang;
    if (saved === "id" || saved === "en") {
      setLangState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = "en";
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("mm_lang", l);
    document.documentElement.lang = l;
  };

  const t = (en: string, id: string) => (lang === "en" ? en : id);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
