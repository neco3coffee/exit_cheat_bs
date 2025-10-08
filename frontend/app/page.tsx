"use client";
import { sendGAEvent } from "@next/third-parties/google";
import { ChevronDownIcon, History, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Searching from "@/app/_components/Searching";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { appendToEightDigits } from "./_lib/common";
import styles from "./page.module.scss";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const tagInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [searchWitHistory, setSearchWithHistory] = useState(false);
  const [searchWithRank, setSearchWithRank] = useState(0);

  return (
    <>
      <div className={styles.searchWrapper}>
        <Searching loading={loading} />
      </div>
      <InputGroup className={styles.inputGroup}>
        <InputGroupInput
          ref={tagInputRef}
          placeholder="Y2YPGCGC"
          type="search"
          enterKeyHint="search"
          className={styles.inputGroupInput}
          maxLength={10}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setLoading(true);
              if (tagInputRef.current) {
                tagInputRef.current.blur();
              }
              let inputTag = e.currentTarget.value.trim();

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

              sendGAEvent("event", "tag_lookup_start", {
                source: "home_screen",
              });
              if (typeof window !== "undefined") {
                sessionStorage.setItem("last_source", "home_screen");
              }
              router.push(`/players/${inputTag.toUpperCase()}`);
            }
          }}
        />
        <InputGroupAddon>
          <InputGroupText className={styles.inputGroupText}>#</InputGroupText>
        </InputGroupAddon>
      </InputGroup>

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
          placeholder="Player Name"
          className={styles.inputGroupNameInput}
          ref={nameInputRef}
          type="search"
          enterKeyHint="search"
          maxLength={15}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setLoading(true);
              if (nameInputRef.current) {
                nameInputRef.current.blur();
              }
              const inputName = e.currentTarget.value.trim();

              if (!inputName) {
                setTimeout(() => {
                  alert("プレイヤー名を入力してください");
                }, 500);
                setLoading(false);
                return;
              }

              // 絵文字の場合もあるのだが、改名時の制限だと英数字だと15文字まで、絵文字だと６文字
              if (inputName.length < 1 || inputName.length > 15) {
                setTimeout(() => {
                  alert("プレイヤー名の長さは1〜15文字である必要があります");
                }, 500);
                setLoading(false);
                return;
              }

              sendGAEvent("event", "name_lookup_start", {
                source: "home_screen",
              });
              if (typeof window !== "undefined") {
                sessionStorage.setItem("last_source", "home_screen");
              }
              router.push(
                `/players/search?name=${encodeURIComponent(inputName)}&history=${searchWitHistory}&rank=${searchWithRank}`,
              );
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
                      onClick={() => setSearchWithRank(rank)}
                      className={styles.dropDownMenuItem}
                    >
                      <Image
                        src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, i)}.png`}
                        alt="rank"
                        height={40}
                        width={40}
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
    </>
  );
}
