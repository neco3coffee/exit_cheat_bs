import { CircleUserRound, House } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import styles from "./index.module.scss";

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
