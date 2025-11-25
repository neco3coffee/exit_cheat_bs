"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";

export default function LocaleBoxContent() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const locale = pathname.split("/")[1] as
    | "fi"
    | "en"
    | "ja"
    | "zh"
    | "ko"
    | "cs"
    | "fr"
    | "sq"
    | "pt"
    | "fr-ca"
    | "hr";
  const leftPath = pathname.split("/").slice(2).join("/");

  const nationalFlags: Record<
    | "fi"
    | "en"
    | "ja"
    | "zh"
    | "ko"
    | "cs"
    | "fr"
    | "sq"
    | "pt"
    | "fr-ca"
    | "hr",
    string
  > = {
    fi: "🇫🇮",
    en: "🇺🇸",
    ja: "🇯🇵",
    zh: "🇨🇳",
    ko: "🇰🇷",
    cs: "🇨🇿",
    fr: "🇫🇷",
    sq: "🇦🇱",
    pt: "🇧🇷",
    "fr-ca": "🇨🇦",
    hr: "🇭🇷",
  };
  const locales: Array<
    | "fi"
    | "en"
    | "ja"
    | "zh"
    | "ko"
    | "cs"
    | "fr"
    | "sq"
    | "pt"
    | "fr-ca"
    | "hr"
  > = ["fi", "en", "ja", "zh", "ko", "cs", "fr", "sq", "pt", "fr-ca", "hr"];

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      style={{ display: "inline-block", position: "relative" }}
      role="menu"
    >
      <button
        className={styles.locale}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={() => setIsOpen(!isOpen)}
        type="button"
      >
        {nationalFlags[locale]}
      </button>
      {isOpen && (
        <button
          className={styles.container}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          {locales.map((loc) => (
            <Link
              href={`/${loc}/${leftPath}`}
              className={`${styles.locale} ${styles.item} ${
                loc === locale ? styles.selected : ""
              }`}
              key={loc}
            >
              {nationalFlags[loc]}
            </Link>
          ))}
        </button>
      )}
    </div>
  );
}
