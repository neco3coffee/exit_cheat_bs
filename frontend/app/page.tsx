"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Searching from "@/app/_components/Searching";
import { Input } from "@/components/ui/input";
import styles from "./page.module.scss";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Searching loading={loading} />
      <Input
        ref={inputRef}
        placeholder="#Y2YPGCGC"
        style={{ textTransform: "uppercase" }}
        type="search"
        enterKeyHint="search"
        className={styles.input}
        maxLength={10}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            setLoading(true);
            if (inputRef.current) {
              inputRef.current.blur();
            }
            let inputTag = (e.target as HTMLInputElement).value.trim();

            if (!inputTag) {
              setTimeout(() => {
                alert("タグを入力してください");
              }, 500);
              setLoading(false);
              return;
            }

            if (inputTag.startsWith("#")) {
              inputTag = inputTag.substring(1);
            }
            // 英数字で構成されているかチェック
            const regex = /^[A-Za-z0-9]+$/;
            if (!regex.test(inputTag)) {
              setTimeout(() => {
                alert("タグは英数字で構成されている必要があります");
              }, 500);
              setLoading(false);
              return;
            }

            // tagの長さが6~10文字であるかチェック
            if (inputTag.length < 6 || inputTag.length > 10) {
              setTimeout(() => {
                alert("タグの長さは6〜10文字である必要があります");
              }, 500);
              setLoading(false);
              return;
            }

            router.push(`/players/${inputTag.toUpperCase()}`);
          }
        }}
      />
    </>
  );
}
