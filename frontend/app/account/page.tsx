"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    <div className="text-center space-y-4">
      <div className="text-green-600">
        <svg
          className="w-16 h-16 mx-auto mb-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          role="img"
          aria-label="ログイン成功アイコン"
        >
          <title>ログイン成功アイコン</title>
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <p className="text-green-600 font-bold text-lg">ログイン成功！</p>
      {player.current_icon && (
        <div className="flex flex-col items-center">
          <img
            src={`https://cdn.brawlify.com/profile-icons/regular/${player.current_icon}.png`}
            alt="現在のアイコン"
            width={64}
            height={64}
            className="mx-auto my-2 border rounded-lg"
          />
          <span className="text-xs text-gray-500">現在のアイコン</span>
        </div>
      )}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-semibold text-gray-800 mb-2">
          ログイン中のプレイヤー
        </h3>
        <div className="text-left space-y-1 text-sm">
          <p>
            <span className="font-medium">名前:</span> {player.name}
          </p>
          <p>
            <span className="font-medium">タグ:</span> #{player.tag}
          </p>
          {player.club_name && (
            <p>
              <span className="font-medium">クラブ:</span> {player.club_name}
            </p>
          )}
          <p>
            <span className="font-medium">トロフィー:</span>{" "}
            {player.trophies.toLocaleString()}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-500">5秒後に自動でリロードします</p>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          SafeBrawl ログイン
        </h1>

        {status === "loading" && (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-700">セッションを確認中...</p>
          </div>
        )}

        {status === "logged_in" && player && (
          <div className="text-center space-y-4">
            <div className="text-green-600">
              <svg
                className="w-16 h-16 mx-auto mb-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                role="img"
                aria-label="ログイン中アイコン"
              >
                <title>ログイン中アイコン</title>
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-green-600 font-bold text-lg">ログイン中</p>
            {player.current_icon && (
              <div className="flex flex-col items-center">
                <img
                  src={`https://cdn.brawlify.com/profile-icons/regular/${player.current_icon}.png`}
                  alt="現在のアイコン"
                  width={64}
                  height={64}
                  className="mx-auto my-2 border rounded-lg"
                />
                <span className="text-xs text-gray-500">現在のアイコン</span>
              </div>
            )}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-semibold text-gray-800 mb-2">
                現在のプレイヤー
              </h3>
              <div className="text-left space-y-1 text-sm">
                <p>
                  <span className="font-medium">名前:</span> {player.name}
                </p>
                <p>
                  <span className="font-medium">タグ:</span> {player.tag}
                </p>
                {player.club_name && (
                  <p>
                    <span className="font-medium">クラブ:</span>{" "}
                    {player.club_name}
                  </p>
                )}
                <p>
                  <span className="font-medium">トロフィー:</span>{" "}
                  {player.trophies.toLocaleString()}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              ログアウト
            </button>
          </div>
        )}

        {status === "idle" && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="tag"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                プレイヤータグ
              </label>
              <input
                id="tag"
                type="text"
                placeholder="#プレイヤータグを入力"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && handleLoginStart()}
              />
            </div>
            <button
              type="button"
              onClick={handleLoginStart}
              disabled={isLoading}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                isLoading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isLoading ? "ログイン中..." : "ログイン開始"}
            </button>
            {errorMessage && (
              <p className="text-red-600 text-sm text-center">{errorMessage}</p>
            )}
          </div>
        )}

        {status === "waiting" && player && requestedIcon && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {player.name}
              </h2>
              <p className="text-gray-600 text-sm">#{player.tag}</p>
              {player.club_name && (
                <p className="text-gray-600 text-sm">
                  クラブ: {player.club_name}
                </p>
              )}
              <p className="text-gray-600 text-sm">
                トロフィー: {player.trophies.toLocaleString()}
              </p>
            </div>

            <div className="text-center space-y-2">
              <p className="text-gray-700">このアイコンに変更してください:</p>
              <img
                src={`https://cdn.brawlify.com/profile-icons/regular/${requestedIcon}.png`}
                alt="ログイン用アイコン"
                width={96}
                height={96}
                className="mx-auto border-2 border-gray-300 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleVerify}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                アイコン変更完了
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {status === "verifying" && (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-700">アイコン変更を確認中です...</p>
            <div className="text-2xl font-bold text-blue-600">
              {Math.floor(countdown / 60)}:
              {(countdown % 60).toString().padStart(2, "0")}
            </div>
            <p className="text-sm text-gray-500">最大90秒間確認を行います</p>
          </div>
        )}

        {status === "success" && player && (
          <SuccessSection player={player} onReset={handleReset} />
        )}

        {status === "error" && (
          <div className="text-center space-y-4">
            <div className="text-red-600">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                role="img"
                aria-label="エラーアイコン"
              >
                <title>エラーアイコン</title>
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-red-600 font-bold">認証に失敗しました</p>
            <p className="text-red-600 text-sm">{errorMessage}</p>
            <button
              type="button"
              onClick={handleReset}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              再試行
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
