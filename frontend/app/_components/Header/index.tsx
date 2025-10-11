"use client";
import { useEffect } from "react";
import styles from "./index.module.scss";

const Header = () => {
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages:
            "ja,en,es,pt,fr,de,ru,ar,zh-CN,zh-TW,ko,tr,it,id,th,vi,pl,nl,sv,cs,hi",
          autoDisplay: true,
        },
        "google_translate_element",
      );
      // 自動でユーザーの言語を適用
      setTimeout(() => {
        const userLang = navigator.language.split("-")[0]; // 例: "ja"
        const select = document.querySelector(
          "select.goog-te-combo",
        ) as HTMLSelectElement | null;
        if (select && userLang && select.value !== userLang) {
          // 対応言語のみ自動選択
          const supported = [
            "ja",
            "en",
            "es",
            "pt",
            "fr",
            "de",
            "ru",
            "ar",
            "zh-CN",
            "zh-TW",
            "ko",
            "tr",
            "it",
            "id",
            "th",
            "vi",
            "pl",
            "nl",
            "sv",
            "cs",
            "hi",
          ];
          if (supported.includes(userLang)) {
            select.value = userLang;
            select.dispatchEvent(new Event("change"));
          }
        }
      }, 1000);
    };

    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);

    // 翻訳バーをCSSで非表示
    const style = document.createElement("style");
    style.innerHTML = `
      .goog-te-banner-frame.skiptranslate { display: none !important; }
      body { top: 0px !important; }
      iframe.skiptranslate { visibility: hidden !important; }
      #goog-gt-tt { display: none !important; }
      .VIpgJd-suEOdc { display: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(style);
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
    <>
      <header className={`${styles.header} notranslate`}>SafeBrawl</header>
      <div id="google_translate_element" style={{ display: "none" }} />
    </>
  );
};

export default Header;
