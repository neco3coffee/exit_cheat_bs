"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "@/app/_messages/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import styles from "./index.module.scss";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1];
  const locales = ["en", "ja"];
  const nationalFlags: { [key: string]: string } = {
    en: "🇺🇸",
    ja: "🇯🇵",
  };

  const leftPath = pathname.split("/").slice(2).join("/");

  // biome-ignore-start lint/correctness/useExhaustiveDependencies: we only want to run this effect once on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem("locale");
    if (
      savedLocale &&
      savedLocale !== locale &&
      locales.includes(savedLocale)
    ) {
      const newPath = leftPath
        ? `/${savedLocale}/${leftPath}`
        : `/${savedLocale}`;
      router.push(newPath);
    }
  }, []);
  // biome-ignore-end lint/correctness/useExhaustiveDependencies: we only want to run this effect once on mount

  return (
    <>
      <header className={`${styles.header}  `}>
        <div className={styles.logoContainer}></div>
        <h1>SafeBrawl</h1>
        <div className={styles.localeContainer}>
          <DropdownMenu>
            <DropdownMenuTrigger className={styles.locale}>
              <span role="img" aria-label={locale}>
                {nationalFlags[locale]}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={styles.dropdownContent} align="end">
              {locales.map((loc) => (
                <DropdownMenuItem className={styles.item} key={loc} asChild>
                  <Link
                    href={`/${loc}/${leftPath}`}
                    className={`${styles.locale} ${
                      loc === locale ? styles.selected : ""
                    }`}
                    onClick={() => {
                      localStorage.setItem("locale", loc);
                    }}
                  >
                    <span role="img" aria-label={loc}>
                      {nationalFlags[loc]}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
};

export default Header;
