"use client";
import { CircleUserRound, House } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./index.module.scss";

const Footer = () => {
  const pathname = usePathname();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Link href="/" className={pathname === "/" ? styles.active : ""}>
          <House />
        </Link>
        <Link
          href="/ranked"
          className={pathname === "/ranked" ? styles.active : ""}
        >
          <Image
            src="/icon_ranked_front 1.png"
            alt="Logo"
            width={34}
            height={26}
          />
        </Link>
        <Link
          href="/account"
          className={pathname === "/account" ? styles.active : ""}
        >
          <CircleUserRound />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
