import styles from "./index.module.scss";
import Image from "next/image";
import { House, CircleUserRound } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Link href="/">
          <House />
        </Link>
        <Link href="/battle">
          <Image
            src="/icon_ranked_front 1.png"
            alt="Logo"
            width={34}
            height={26}
          />
        </Link>
        <Link href="/account">
          <CircleUserRound />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
