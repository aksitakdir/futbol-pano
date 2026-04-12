"use client";

import { useEffect } from "react";

/**
 * `/en/*` rotalarında <html lang> değerini "en" yapar; böylece CSS text-transform
 * ve font özellikleri İngilizce büyük harf kurallarını kullanır (COMING SOON, LISTELER vb.).
 */
export default function EnDocumentLang() {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.lang;
    root.lang = "en";
    return () => {
      root.lang = previous || "tr";
    };
  }, []);
  return null;
}
