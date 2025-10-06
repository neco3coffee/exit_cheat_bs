export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const name = (await searchParams).name;
  const history = (await searchParams).history;
  const rank = (await searchParams).rank;

  if (!name || Array.isArray(name) || name.trim() === "") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-white">プレイヤー検索</h1>
        <div className="text-white">プレイヤー名を指定してください</div>
      </div>
    );
  }

  try {
    const response = await fetch(
      `http://app:3000/api/v1/players/search?name=${encodeURIComponent(
        name,
      )}&history=${history === "true"}&rank=${rank || "0"}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4 text-white">プレイヤー検索</h1>
          <div className="text-white">プレイヤー情報の取得に失敗しました</div>
        </div>
      );
    }

    const players = await response.json();

    if (!players || players.length === 0) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4 text-white">プレイヤー検索</h1>
          <div className="text-white">
            該当するプレイヤーが見つかりませんでした
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-6">プレイヤー検索結果</h1>

        {/* JSONデータをそのまま表示 */}
        <pre className="whitespace-pre-wrap text-white font-mono text-sm">
          {JSON.stringify(players, null, 2)}
        </pre>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-white">プレイヤー検索</h1>
        <div className="text-white">
          エラーが発生しました:{" "}
          {error instanceof Error ? error.message : "不明なエラー"}
        </div>
      </div>
    );
  }
}
