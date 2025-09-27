"use client";
import Image from "next/image";
import styles from "./page.module.scss";
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Input
        placeholder="#Y2YPGCGC"
        className={styles.input}
        maxLength={9}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            let inputTag = e.currentTarget.value.trim().toUpperCase();
            if (!inputTag) {
              alert("タグを入力してください");
              return;
            }

            if (inputTag.startsWith("#")) {
              inputTag = inputTag.substring(1);
            }
            // 英数字で構成されているかチェック
            const regex = /^[A-Za-z0-9]+$/;
            if (!regex.test(inputTag)) {
              alert("タグは英数字で構成されている必要があります");
              return;
            }

            // tagの長さが6~8文字であるかチェック
            if (inputTag.length < 6 || inputTag.length > 8) {
              alert("タグの長さは6〜8文字である必要があります");
              return;
            }

            router.push(`/players/${inputTag}`);
          }
        }}
      />
    </>
  );
}
