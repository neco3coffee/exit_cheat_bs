"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { History } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/app/_messages/i18n/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import styles from "./index.module.scss";

export default function TagInput() {
  const router = useRouter();
  const tagInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const searchLogList: { tag: string; name: string }[] =
    typeof window !== "undefined"
      ? (JSON.parse(localStorage.getItem("searchLogList") || "[]") as {
          tag: string;
          name: string;
        }[])
      : [];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

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
    <div className={styles.historyDropdown} ref={dropdownRef}>
      <InputGroup className={styles.inputGroup}>
        <InputGroupAddon>
          <InputGroupText className={styles.inputGroupText}>#</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          ref={tagInputRef}
          placeholder="Y2YPGCGC"
          type="search"
          enterKeyHint="search"
          className={styles.inputGroupInput}
          maxLength={10}
          onKeyDown={handleTagSearch}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            variant="ghost"
            style={{ marginRight: "15px" }}
            aria-label="Search history"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <History
              style={{ width: "20px", height: "20px", fontSize: "20px" }}
            />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {isOpen && (
        <div className={styles.dropdownPanel} role="menu">
          <div className={styles.dropdownScroll}>
            {searchLogList.length === 0 && (
              <button
                type="button"
                className={styles.dropdownMenuItem}
                disabled
              >
                No History
              </button>
            )}
            {searchLogList.map((item) => (
              <button
                key={item.tag}
                type="button"
                className={styles.dropdownMenuItem}
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/players/${item.tag}`);
                }}
              >
                #{item.tag}
                {item.name && ` ${item.name}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
