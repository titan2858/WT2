import { createContext, useContext, useState } from "react";
import translations from "../translations";

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(
    localStorage.getItem("cognicare_lang") || "en"
  );

  const switchLang = (l) => {
    localStorage.setItem("cognicare_lang", l);
    setLang(l);
  };

  const t = (key) => translations[lang]?.[key] ?? translations["en"][key] ?? key;

  return (
    <LangContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
