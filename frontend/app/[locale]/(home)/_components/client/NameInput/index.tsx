"use client";
import { sendGAEvent } from "@next/third-parties/google";
import { ChevronDownIcon, History } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { appendToEightDigits } from "@/app/_lib/common";
import { useRouter } from "@/app/_messages/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import styles from "./index.module.scss";

export default function NameInput() {
  const router = useRouter();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [searchWitHistory, setSearchWithHistory] = useState(false);
  const [searchWithRank, setSearchWithRank] = useState(0);
  const t = useTranslations("home");

  const setDefaultRank = async () => {
    try {
      const res = await fetch("/api/v1/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        console.error("Failed to fetch user data");
        return;
      }
      const data = await res.json();
      if (data && data.player?.rank !== undefined) {
        setSearchWithRank(data.player.rank);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return;
    }
  };

  // biome-ignore-start lint/correctness/useExhaustiveDependencies: レンダーのたびに実行されてほしくないため
  useEffect(() => {
    setDefaultRank();
  }, []);
  // biome-ignore-end lint/correctness/useExhaustiveDependencies: レンダーのたびに実行されてほしくないため

  const handleNameSearch = (inputValue?: string) => {
    if (nameInputRef.current) {
      nameInputRef.current.blur();
    }
    const inputName = (inputValue ?? nameInputRef.current?.value ?? "").trim();

    if (!inputName) {
      setTimeout(() => {
        alert("プレイヤー名を入力してください");
      }, 500);
      return;
    }

    // 絵文字の場合もあるのだが、改名時の制限だと英数字だと15文字まで、絵文字だと６文字
    if (inputName.length < 1 || inputName.length > 15) {
      setTimeout(() => {
        alert("プレイヤー名の長さは1〜15文字である必要があります");
      }, 500);
      return;
    }

    sendGAEvent("event", "name_lookup_start", {
      name: inputName,
      searchWithHistroy: searchWitHistory,
      rank: searchWithRank,
    });
    router.push(
      `/players/search?name=${encodeURIComponent(inputName)}&history=${searchWitHistory}&rank=${searchWithRank}`,
    );
  };

  return (
    <InputGroup className={styles.inputGroup}>
      <InputGroupAddon align="inline-start">
        <InputGroupButton
          onClick={() => setSearchWithHistory(!searchWitHistory)}
          className={
            searchWitHistory
              ? styles.inputGroupHistoryButtonActive
              : styles.inputGroupHistoryButton
          }
          size="icon-xs"
        >
          <History />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        placeholder={t("placeholder")}
        className={styles.inputGroupNameInput}
        ref={nameInputRef}
        type="search"
        enterKeyHint="search"
        maxLength={15}
        onKeyUp={(e) => {
          e.preventDefault();
          if (e.key === "Enter") {
            handleNameSearch(e.currentTarget.value);
          }
        }}
      />
      <InputGroupAddon align="inline-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild className={styles.DropdownMenuTrigger}>
            <InputGroupButton variant="ghost" className="!pr-1.5 text-xs">
              <Image
                src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, searchWithRank)}.png`}
                alt="rank"
                height={30}
                width={30}
                sizes="30px"
                style={{ height: "30px", width: "auto" }}
              />
              <ChevronDownIcon className="size-3" />
            </InputGroupButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={styles.dropdownMenuContent}
          >
            <ScrollArea className="max-h-[140px] w-[4rem]">
              {Array.from({ length: 22 }, (_, index) => index).map(
                (rank, i) => (
                  <DropdownMenuItem
                    key={rank}
                    onClick={() => {
                      setSearchWithRank(rank);
                    }}
                    className={styles.dropDownMenuItem}
                  >
                    <Image
                      src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, i)}.png`}
                      alt="rank"
                      height={40}
                      width={40}
                      sizes="40px"
                      style={{ height: "40px", width: "auto" }}
                    />
                  </DropdownMenuItem>
                ),
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </InputGroupAddon>
    </InputGroup>
  );
}
