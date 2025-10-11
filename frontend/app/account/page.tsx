"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import styles from "./page.module.scss";

// ログイン成功時のアイコン表示と5秒後自動遷移
function SuccessSection(props: { player: Player; onReset: () => void }) {
  const { player, onReset } = props;
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className={styles.successContainer}>
      <h3>You’re logged in!</h3>
      <Image
        src={`https://cdn.brawlify.com/profile-icons/regular/${player.current_icon}.png`}
        alt="login icon"
        width={96}
        height={96}
      />
      <p className="notranslate">{player.name}</p>
      <p>{player.tag}</p>
      <p>
        <Image
          src="/icon_trophy1.png"
          alt="trophy icon"
          width={20}
          height={20}
          className="inline-block mr-1"
        />
        {player.trophies.toLocaleString()}
      </p>
      <p className={styles.info}>
        This page will automatically refresh in 5 seconds.
      </p>
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
  };
  session_token?: string;
  message?: string;
}

interface MeResponse {
  player: Player;
  session_expires_at: string;
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
      });

      const data: VerifyResponse = await res.json();
      clearInterval(timer);

      if (data.status === "success" && data.player && data.session_token) {
        setPlayer({
          id: data.player.id,
          tag: data.player.tag,
          name: data.player.name,
          trophies: player?.trophies || 0,
          club_name: player?.club_name,
          current_icon: player?.current_icon,
        });
        setStatus("success");
        // セッショントークンをローカルストレージに保存
        localStorage.setItem("session_token", data.session_token);
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
  const [player, setPlayer] = useState<Player | null>(null);
  const [requestedIcon, setRequestedIcon] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  console.log(
    "Current status:",
    status,
    "Player:",
    player,
    "RequestedIcon:",
    requestedIcon,
  );

  const checkExistingSession = async () => {
    const sessionToken = localStorage.getItem("session_token");

    if (!sessionToken) {
      setStatus("idle");
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        // セッションが無効な場合は削除
        localStorage.removeItem("session_token");
        setStatus("idle");
        return;
      }

      const data: MeResponse = await res.json();
      setPlayer(data.player);
      setStatus("logged_in");
    } catch (error) {
      console.error("Session check error:", error);
      localStorage.removeItem("session_token");
      setStatus("idle");
    }
  };
  // コンポーネントマウント時にセッション確認
  // biome-ignore-start lint/correctness/useExhaustiveDependencies: レンダーのたびに実行されてほしくないため
  useEffect(() => {
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
      });

      console.log("Login API response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Login API error:", errorData);
        throw new Error(errorData.error || "ログインに失敗しました");
      }

      const data: LoginResponse = await res.json();
      console.log("Login successful, data:", data);

      setPlayer(data.player);
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
    setPlayer(null);
    setRequestedIcon(null);
    setErrorMessage("");
    setTag("");
    setCountdown(0);
  };

  const handleLogout = () => {
    localStorage.removeItem("session_token");
    handleReset();
  };

  return (
    <div className={styles.container}>
      {status === "loading" && (
        <div className={styles.loadingContainer}>
          <Spinner className="size-12 text-blue-500" />
          <p>Confirming your login...</p>
        </div>
      )}

      {status === "logged_in" && player && (
        <div className={styles.loggedInContainer}>
          <h3>Currently logged in as</h3>
          <Image
            src={`https://cdn.brawlify.com/profile-icons/regular/${player.current_icon}.png`}
            alt="login icon"
            width={96}
            height={96}
          />
          <p className="notranslate">{player.name}</p>
          <p>{player.tag}</p>
          <p>
            <Image
              src="/icon_trophy1.png"
              alt="trophy icon"
              width={20}
              height={20}
              className="inline-block mr-1"
            />
            {player.trophies.toLocaleString()}
          </p>

          <button type="button" onClick={handleLogout}>
            logout
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
                  login
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

      {status === "waiting" && player && requestedIcon && (
        <div className={styles.waitingContainer}>
          <h3>Please switch your profile icon to this one</h3>

          <Image
            src={`https://cdn.brawlify.com/profile-icons/regular/${requestedIcon}.png`}
            alt="login icon"
            width={96}
            height={96}
          />

          <p className="notranslate">{player.name}</p>
          <p>{player.tag}</p>

          <p>
            <Image
              src="/icon_trophy1.png"
              alt="trophy icon"
              width={20}
              height={20}
              className="inline-block mr-1"
            />
            {player.trophies.toLocaleString()}
          </p>

          <button type="button" onClick={handleVerify}>
            I’ve Changed My Icon
          </button>
        </div>
      )}

      {status === "verifying" && (
        <div className={styles.verifyingContainer}>
          <Spinner className="size-12 text-blue-500" />
          <h3>Confirming your icon change...</h3>
          <h4 className="notranslate">
            {Math.floor(countdown / 60)}:
            {(countdown % 60).toString().padStart(2, "0")}
          </h4>
          <p className="text-sm text-gray-500">
            This may take up to 90 seconds.
          </p>
        </div>
      )}

      {status === "success" && player && (
        <SuccessSection player={player} onReset={handleReset} />
      )}

      {status === "error" && (
        <div className={styles.errorContainer}>
          <h3>Login failed.</h3>
          <p>{errorMessage}</p>
          <button type="button" onClick={handleReset}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
