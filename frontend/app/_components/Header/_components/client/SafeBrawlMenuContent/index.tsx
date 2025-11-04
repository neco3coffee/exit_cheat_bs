"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/app/_messages/i18n/navigation";
import styles from "./index.module.scss";

export default function SafeBrawlMenuContent() {
  const [isOpen, setIsOpen] = useState(false);
  const tTerms = useTranslations("termsOfService");
  const tPrivacy = useTranslations("privacyPolicy");
  const tCredits = useTranslations("credits");
  const tHome = useTranslations("home");

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
        className={styles.title}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={() => setIsOpen(!isOpen)}
        type="button"
      >
        SafeBrawl
      </button>
      {isOpen && (
        <div className={styles.container}>
          <Link
            href="https://safebrawl.com/"
            className={styles.item}
            onClick={() => setIsOpen(false)}
          >
            {tHome("linkText")}
          </Link>
          <Link
            href="/terms-of-service"
            className={styles.item}
            onClick={() => setIsOpen(false)}
          >
            {tTerms("linkText")}
          </Link>
          <Link
            href="/privacy-policy"
            className={styles.item}
            onClick={() => setIsOpen(false)}
          >
            {tPrivacy("linkText")}
          </Link>
          <Link
            href="/credits"
            className={styles.item}
            onClick={() => setIsOpen(false)}
          >
            {tCredits("linkText")}
          </Link>
          <Link
            href="https://neco3coffee.me"
            className={styles.item}
            onClick={() => setIsOpen(false)}
          >
            {`© ${new Date().getFullYear()} SafeBrawl ${tHome("operator")}`}
          </Link>
        </div>
      )}
    </div>
  );
}
