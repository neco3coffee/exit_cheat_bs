"use client";
import { CircleUserRound, House } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Link } from "@/app/_messages/i18n/navigation";
import styles from "./index.module.scss";

export function HomeIcon() {
  const pathname = usePathname();

  return (
    <Link
      href="/"
      className={pathname === "/ja" || pathname === "/en" ? styles.active : ""}
    >
      <House />
    </Link>
  );
}

export function RankedIcon() {
  const pathname = usePathname();

  return (
    <Link
      href="/ranked"
      className={pathname.includes("/ranked") ? styles.active : ""}
    >
      <Image
        src="/icon_ranked_front 1.png"
        alt="Logo"
        width={34}
        height={26}
        priority
        sizes="34px"
      />
    </Link>
  );
}

export function AccountIcon() {
  const pathname = usePathname();

  return (
    <Link
      href="/account"
      className={pathname.includes("/account") ? styles.active : ""}
    >
      <CircleUserRound />
    </Link>
  );
}
