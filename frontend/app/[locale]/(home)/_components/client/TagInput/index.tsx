"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { useRef } from "react";
import { useRouter } from "@/app/_messages/i18n/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import styles from "./index.module.scss";

export default function TagInput() {
  const router = useRouter();
  const tagInputRef = useRef<HTMLInputElement>(null);

  const handleTagSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (tagInputRef.current) {
        tagInputRef.current.blur();
      }
      let inputTag = e.currentTarget.value.trim();

      if (!inputTag) {
        setTimeout(() => {
          alert("タグを入力してください");
        }, 500);
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
        return;
      }

      // tagの長さが6~10文字であるかチェック
      if (inputTag.length < 6 || inputTag.length > 10) {
        setTimeout(() => {
          alert("タグの長さは6〜10文字である必要があります");
        }, 500);
        return;
      }

      sendGAEvent("event", "tag_lookup_start", {
        source: "home_screen",
      });
      if (typeof window !== "undefined") {
        sessionStorage.setItem("last_source", "home_screen");
      }
      router.push(`/players/${inputTag.toUpperCase()}`);
    }
  };

  return (
    <>
      <InputGroup className={styles.inputGroup}>
        <InputGroupInput
          ref={tagInputRef}
          placeholder="Y2YPGCGC"
          type="search"
          enterKeyHint="search"
          className={styles.inputGroupInput}
          maxLength={10}
          onKeyDown={handleTagSearch}
        />
        <InputGroupAddon>
          <InputGroupText className={styles.inputGroupText}>#</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </>
  );
}
