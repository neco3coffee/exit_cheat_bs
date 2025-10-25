"use client";
import { sendGAEvent } from "@next/third-parties/google";
import { ChevronDownIcon, History, SquarePlus } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import Searching from "@/app/_components/Searching";
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
  InputGroupText,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import styles from "./page.module.scss";

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream,
    );

    setIsAndroid(/Android/.test(navigator.userAgent));

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    // Android PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    setDeferredPrompt(null);
  };

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <div className="w-full h-full relative">
      {isIOS && (
        <Sheet>
          <SheetTrigger>
            <SquarePlus
              size={50}
              aria-label="plus icon"
              className="absolute bottom-[10px] right-[10px]"
            />
          </SheetTrigger>
          <SheetContent
            side="top"
            className="h-[80%] w-full border-none flex justify-center items-center"
            style={{ paddingTop: "100px" }}
          >
            <SheetTitle className="text-2xl mb-4">Install SafeBrawl</SheetTitle>
            <video
              src="/add_to_home.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{ width: "auto", height: "100%", borderRadius: "16px" }}
            />
          </SheetContent>
        </Sheet>
      )}
      {isAndroid && deferredPrompt && (
        <button
          onClick={handleInstallClick}
          className="absolute bottom-[10px] right-[10px] bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors"
          aria-label="Install app"
          type="button"
        >
          <SquarePlus size={50} />
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const tagInputRef = useRef<HTMLInputElement>(null);
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
    setLoading(true);
    if (nameInputRef.current) {
      nameInputRef.current.blur();
    }
    const inputName = (inputValue ?? nameInputRef.current?.value ?? "").trim();

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
      name: inputName,
      searchWithHistroy: searchWitHistory,
      rank: searchWithRank,
    });
    router.push(
      `/players/search?name=${encodeURIComponent(inputName)}&history=${searchWitHistory}&rank=${searchWithRank}`,
    );
  };

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

      <InstallPrompt />
    </>
  );
}
