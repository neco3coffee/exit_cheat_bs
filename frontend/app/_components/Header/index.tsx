"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  if (pathname === "/") {
    return null;
  }
  const locale = pathname.split("/")[1];
  const locales = ["en", "ja"];
  const nationalFlags: { [key: string]: string } = {
    en: "🇺🇸",
    ja: "🇯🇵",
  };
  if (!locales.includes(locale)) {
    return null;
  }
  const leftPath = pathname.split("/").slice(2).join("/");

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
