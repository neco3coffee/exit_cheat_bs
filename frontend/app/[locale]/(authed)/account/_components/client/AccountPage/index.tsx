"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useCurrentPlayer } from "@/app/_providers/CurrentPlayerProvider";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import styles from "./index.module.scss";

// ログイン成功時のアイコン表示と5秒後自動遷移
function SuccessSection(props: {
  currentPlayer: Player;
  checkExistingSession: () => void;
}) {
  const { currentPlayer, checkExistingSession } = props;
  const t = useTranslations("account");
  useEffect(() => {
    const timer = setTimeout(() => {
      checkExistingSession();
    }, 5000);
    return () => clearTimeout(timer);
  }, [checkExistingSession]);
  return (
    <div className={styles.successContainer}>
      <h3>{t("loginSuccess")}</h3>
      <Image
        src={`https://cdn.brawlify.com/profile-icons/regular/${currentPlayer.current_icon}.png`}
        alt="login icon"
        width={96}
        height={96}
        sizes="96px"
      />
      <p>{currentPlayer.name}</p>
      <p>{currentPlayer.tag}</p>
      <p>
        <Image
          src="/icon_trophy1.png"
          alt="trophy icon"
          width={20}
          height={20}
          sizes="20px"
          className="inline-block mr-1"
        />
        {currentPlayer.trophies.toLocaleString()}
      </p>
      <p className={styles.totalPoints}>
        {t("totalPoints", {
          points: (currentPlayer.total_points ?? 0).toLocaleString(),
        })}
      </p>
      <p className={styles.info}>{t("autoReload")}</p>
    </div>
  );
}

interface Player {
  id?: number;
  tag: string;
  name: string;
  club_name?: string;
  trophies: number;
  current_icon?: string;
  total_points?: number;
}

interface LoginResponse {
  player: Player;
  requested_icon: string;
}

interface VerifyResponse {
  status: "success" | "error";
  player?: {
    id: number;
    tag: string;
    name: string;
    current_icon: string;
    total_points?: number;
  };
  session_token?: string;
  message?: string;
}

interface MeResponse {
  player: Player;
}

type Status =
  | "loading"
  | "idle"
  | "waiting"
  | "verifying"
  | "success"
  | "error"
  | "logged_in";

export default function AccountPage() {
  const { currentPlayer, setCurrentPlayer } = useCurrentPlayer();
  const t = useTranslations("account");

  const modalRef = useRef<{ open: () => void }>(null);

  // アイコン変更確認・認証
  const handleVerify = async () => {
    if (!requestedIcon) return;

    setStatus("verifying");
    setCountdown(90);
    setErrorMessage("");

    // カウントダウンタイマー（15秒間隔）
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const res = await fetch("/api/v1/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tag: tag.trim(),
          requested_icon: requestedIcon,
        }),
        cache: "no-store",
      });

      const data: VerifyResponse = await res.json();
      clearInterval(timer);

      if (data.status === "success" && data.player && data.session_token) {
        setCurrentPlayer({
          id: data.player.id,
          tag: data.player.tag,
          name: data.player.name,
          trophies: currentPlayer?.trophies || 0,
          current_icon: data.player?.current_icon,
          total_points: data.player?.total_points,
        });
        setStatus("success");
        // セッショントークンをローカルストレージに保存
      } else {
        setStatus("error");
        setErrorMessage(data.message || "認証に失敗しました");
      }
    } catch (error) {
      clearInterval(timer);
      console.error("Verify error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "認証中にエラーが発生しました",
      );
      setStatus("error");
    }
  };
  const [tag, setTag] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [requestedIcon, setRequestedIcon] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const checkExistingSession = async () => {
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
        // セッションが無効な場合は削除
        setStatus("idle");
        return;
      }

      const data: MeResponse = await res.json();
      setCurrentPlayer(data.player);
      setStatus("logged_in");
      modalRef.current?.open();
    } catch (error) {
      console.error("Session check error:", error);
      setStatus("idle");
    }
  };
  // コンポーネントマウント時にセッション確認
  // biome-ignore-start lint/correctness/useExhaustiveDependencies: レンダーのたびに実行されてほしくないため
  useEffect(() => {
    if (currentPlayer && currentPlayer.id) {
      setStatus("logged_in");
      return;
    }

    checkExistingSession();
  }, []);
  // biome-ignore-end lint/correctness/useExhaustiveDependencies: レンダーのたびに実行されてほしくないため

  const handleLoginStart = async () => {
    if (!tag.trim()) {
      setErrorMessage("プレイヤータグを入力してください");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    console.log("Starting login process for tag:", tag.trim());

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: tag.trim() }),
        cache: "no-store",
      });

      console.log("Login API response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Login API error:", errorData);
        throw new Error(errorData.error || "ログインに失敗しました");
      }

      const data: LoginResponse = await res.json();
      console.log("Login successful, data:", data);

      setCurrentPlayer(data.player);
      setRequestedIcon(data.requested_icon);
      setStatus("waiting");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "ログインに失敗しました",
      );
      setStatus("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setCurrentPlayer(null);
    setRequestedIcon(null);
    setErrorMessage("");
    setTag("");
    setCountdown(0);
  };

  const handleLogout = () => {
    fetch("/api/v1/auth/logout", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("ログアウトに失敗しました");
        }
      })
      .catch((error) => {
        console.error("Logout error:", error);
      })
      .finally(() => {
        handleReset();
      });
  };

  return (
    <div className={styles.container}>
      {status === "loading" && (
        <div className={styles.loadingContainer}>
          <Spinner className="size-12 text-blue-500" />
          <p>{t("checkLogin")}</p>
        </div>
      )}

      {status === "logged_in" && currentPlayer && (
        <div className={styles.loggedInContainer}>
          <h3>{t("loginStatus")}</h3>
          <Image
            src={`https://cdn.brawlify.com/profile-icons/regular/${currentPlayer.current_icon}.png`}
            alt="login icon"
            width={96}
            height={96}
            sizes="96px"
          />
          <p>{currentPlayer.name}</p>
          <p>{currentPlayer.tag}</p>
          <p>
            <Image
              src="/icon_trophy1.png"
              alt="trophy icon"
              width={20}
              height={20}
              sizes="20px"
              className="inline-block mr-1"
            />
            {currentPlayer.trophies.toLocaleString()}
          </p>
          <p className={styles.totalPoints}>
            {t("totalPoints", {
              points: (currentPlayer.total_points ?? 0).toLocaleString(),
            })}
          </p>

          <button type="button" onClick={handleLogout}>
            {t("logout")}
          </button>
        </div>
      )}

      {status === "idle" && (
        <div className={styles.idleContainer}>
          <InputGroup className={styles.inputGroup}>
            <InputGroupAddon>
              <InputGroupText className={styles.inputGroupText}>
                #
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              ref={tagInputRef}
              placeholder="Y2YPGCGC"
              type="search"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              enterKeyHint="search"
              className={styles.inputGroupInput}
              maxLength={10}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLoginStart();
                }
              }}
            />
            {!isLoading ? (
              <InputGroupAddon
                align="inline-end"
                className={styles.loginButton}
              >
                <InputGroupButton onClick={handleLoginStart}>
                  {t("login")}
                </InputGroupButton>
              </InputGroupAddon>
            ) : (
              <InputGroupAddon align="inline-end">
                <Spinner className={styles.spinner} />
              </InputGroupAddon>
            )}
          </InputGroup>

          {errorMessage && (
            <div className={styles.errorMessage}>
              <p>{errorMessage}</p>
            </div>
          )}
        </div>
      )}

      {status === "waiting" && currentPlayer && requestedIcon && (
        <div className={styles.waitingContainer}>
          <h3>{t("switchAccountDescription")}</h3>

          <Image
            src={`https://cdn.brawlify.com/profile-icons/regular/${requestedIcon}.png`}
            alt="login icon"
            width={96}
            height={96}
            sizes="96px"
          />

          <p>{currentPlayer.name}</p>
          <p>{currentPlayer.tag}</p>

          <p>
            <Image
              src="/icon_trophy1.png"
              alt="trophy icon"
              width={20}
              height={20}
              sizes="20px"
              className="inline-block mr-1"
            />
            {currentPlayer.trophies.toLocaleString()}
          </p>

          <button type="button" onClick={handleVerify}>
            {t("switchAccount")}
          </button>
        </div>
      )}

      {status === "verifying" && (
        <div className={styles.verifyingContainer}>
          <Spinner className="size-12 text-blue-500" />
          <h3>{t("checkIconChange")}</h3>
          <h4>
            {Math.floor(countdown / 60)}:
            {(countdown % 60).toString().padStart(2, "0")}
          </h4>
          <p className="text-sm text-gray-500">
            {t("checkIconChangeDescription")}
          </p>
        </div>
      )}

      {status === "success" && currentPlayer && (
        <SuccessSection
          currentPlayer={currentPlayer}
          checkExistingSession={checkExistingSession}
        />
      )}

      {status === "error" && (
        <div className={styles.errorContainer}>
          <h3>{t("loginFailed")}</h3>
          <p>{errorMessage}</p>
          <button type="button" onClick={handleReset}>
            {t("retry")}
          </button>
        </div>
      )}
    </div>
  );
}
