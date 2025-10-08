"use client";
import { ChevronDownIcon, History, Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Record from "@/app/_components/Record";
import Searching from "@/app/_components/Searching";
import { brawlerBgColor } from "@/app/_lib/brawlerRarity";
import ClubName from "@/app/_lib/ClubName";
import { appendToEightDigits } from "@/app/_lib/common";
import { formatBattleLog } from "@/app/_lib/formatBattleLog";
import { Button } from "@/components/ui/button";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import BattleLog3vs3 from "../[tag]/_components/BattleLog3vs3";
import BattleLog5vs5 from "../[tag]/_components/BattleLog5vs5";
import BattleLogDuel from "../[tag]/_components/BattleLogDuel";
import BattleLogDuo from "../[tag]/_components/BattleLogDuo";
import BattleLogSolo from "../[tag]/_components/BattleLogSolo";
import BattleLogSoloRanked from "../[tag]/_components/BattleLogSoloRanked";
import BattleLogTrio from "../[tag]/_components/BattleLogTrio";
import styles from "./page.module.scss";

type Player = {
  tag: string;
  iconId: number;
  name: string;
  nameColor?: string;
  currentRank?: number;
  trophies: number;
  highestTrophies: number;
  vs3Victories: number;
  soloVictories: number;
  club?: {
    badgeId?: number;
    name?: string;
  };
  brawlers: any[];
  battlelog?: {
    items: any[];
  };
  approved_reports_count: number;
};

function SearchPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const history = searchParams.get("history");
  const rank = searchParams.get("rank");
  const [tag, setTag] = useState("");
  const [player, setPlayer] = useState<Player | null>(null);
  const [battleLogs, setBattleLogs] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoadingPlayer(true);
        const res = await fetch(`/api/v1/players/${encodeURIComponent(tag)}`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setPlayer(data);
        setBattleLogs(formatBattleLog(data.battlelog?.items || []));
      } catch (error) {
        console.error("Failed to fetch player:", error);
        // エラー処理を追加（オプション）
        setPlayer(null);
        setBattleLogs([]);
      } finally {
        setLoadingPlayer(false);
      }
    };

    if (tag) {
      fetchPlayer();
    }
  }, [tag]);

  // プレイヤー検索機能
  useEffect(() => {
    const searchPlayers = async () => {
      if (!name || name.trim() === "") {
        return;
      }
      setLoadingPlayers(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/v1/players/search?name=${encodeURIComponent(
            name,
          )}&history=${history === "true"}&rank=${rank || "0"}`,
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const playersData = await res.json();
        setPlayers(playersData || []);
      } catch (error) {
        console.error("Failed to search players:", error);
        setError(error instanceof Error ? error.message : "不明なエラー");
        setPlayers([]);
      } finally {
        setLoadingPlayers(false);
      }
    };

    searchPlayers();
  }, [name, history, rank]);

  // プレイヤーリストの最初のプレイヤーのタグを設定
  useEffect(() => {
    if (players && players.length > 0) {
      const firstPlayerTag = players[0].tag.replace("#", ""); // #を削除
      setTag(firstPlayerTag);
    }
  }, [players]);

  // return (
  //   // プレイヤー基本情報をjson形式で表示
  //   <>
  //     <p>{`Player Data: ${JSON.stringify(player, null, 2)}`}</p>
  //     {/* <p>{`Battle Logs: ${JSON.stringify(battleLogs, null, 2)}`}</p> */}
  //     {/* <p>{`Search Params - name: ${name}, history: ${history}, rank: ${rank}`}</p> */}
  //     <p>{`Current Tag: ${tag}`}</p>
  //   </>
  // )

  return (
    <div className={styles.container}>
      {/* プレイヤー基本情報 */}
      {!loadingPlayers && loadingPlayer ? (
        <div className={styles.searchContainer}>
          <Searching loading={loadingPlayer} />
        </div>
      ) : player ? (
        <>
          <div className={styles.basicInfoContainer}>
            <div className={styles.iconContainer}>
              <Image
                src={`https://cdn.brawlify.com/profile-icons/regular/${player.iconId}.png`}
                alt="icon"
                width={80}
                height={80}
              />
              <h3>{player.tag}</h3>
            </div>
            <div className={styles.nameAndRankContainer}>
              <h1
                style={{
                  color: `#${player?.nameColor?.replace(/^0x/, "").slice(2)}`,
                }}
              >
                {player.name}
              </h1>
              {player?.currentRank! >= 0 && (
                <div className={styles.rankContainer}>
                  {player.currentRank! > 0 && (
                    <>
                      <Image
                        src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, player.currentRank! - 1)}.png`}
                        alt="rank"
                        height={60}
                        width={60}
                        style={{ height: "60px", width: "auto" }}
                      />
                      <Rocket className={styles.icon} />
                    </>
                  )}
                  <Image
                    src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, player.currentRank!)}.png`}
                    alt="rank"
                    height={60}
                    width={60}
                    style={{ height: "60px", width: "auto" }}
                  />
                </div>
              )}
            </div>
            <div className={styles.reportsAndBrawlersContainer}>
              <div className={styles.reportsContainer}>
                {player.approved_reports_count > 0 && (
                  <Image
                    src={"/reported_player.png"}
                    alt="icon"
                    width={55}
                    height={55}
                    style={{
                      width: "55px",
                      height: "auto",
                      marginLeft: "3px",
                    }}
                  />
                )}
                {player.approved_reports_count === 0 && (
                  <Image
                    src={"/clean_player.png"}
                    alt="icon"
                    width={55}
                    height={55}
                    style={{
                      width: "55px",
                      height: "auto",
                      marginLeft: "3px",
                    }}
                  />
                )}
              </div>
              <div className={styles.brawlersContainer}>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <Image
                        src={"/brawler.png"}
                        alt="icon"
                        width={55}
                        height={55}
                        style={{
                          width: "55px",
                          height: "auto",
                          marginLeft: "3px",
                        }}
                      />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className={styles.brawlerSheetContent}
                  >
                    <div className={styles.brawlSheetInner}>
                      <SheetHeader className={styles.brawlerSheetHeader}>
                        <SheetTitle>{`${player?.brawlers?.filter((brawler) => brawler.power === 11).length} brawlers`}</SheetTitle>
                        <SheetDescription>
                          Brawlers with Power 11
                        </SheetDescription>
                      </SheetHeader>
                      <div className={styles.brawlerListContainer}>
                        {player?.brawlers
                          ?.filter((brawler) => brawler.power === 11)
                          .map((brawler) => {
                            return (
                              <div
                                key={brawler.id}
                                className={
                                  brawler.name === "KAZE"
                                    ? styles.kaze
                                    : styles.brawlerItemContainer
                                }
                                style={{
                                  backgroundColor: brawlerBgColor(brawler.name),
                                }}
                              >
                                <Image
                                  src={`https://cdn.brawlify.com/brawlers/portraits/${brawler.id}.png`}
                                  alt={brawler.name}
                                  width={137}
                                  height={114}
                                  style={{
                                    height: "100%",
                                    width: "auto",
                                    paddingBottom: "30px",
                                  }}
                                />
                                <div className={styles.gadgetContainer}>
                                  {brawler.gadgets &&
                                    brawler.gadgets.length > 0 &&
                                    brawler.gadgets.map(
                                      (gadget: any, index: number) => (
                                        <div
                                          className={
                                            styles.gadgetImageContainer
                                          }
                                          key={gadget.id}
                                        >
                                          <Image
                                            src={`https://cdn.brawlify.com/gadgets/borderless/${gadget.id}.png`}
                                            alt={gadget.name}
                                            width={18}
                                            height={18}
                                            style={{
                                              width: "18px",
                                              height: "18px",
                                              position: "absolute",
                                              top: "11px",
                                              left: "11px",
                                            }}
                                          />
                                          <Image
                                            src={`/gadgetBg.png`}
                                            alt={gadget.name}
                                            width={40}
                                            height={40}
                                            style={{
                                              width: "40px",
                                              height: "40px",
                                            }}
                                          />
                                        </div>
                                      ),
                                    )}
                                </div>
                                <div className={styles.starPowerContainer}>
                                  {brawler.starPowers &&
                                    brawler.starPowers.length > 0 &&
                                    brawler.starPowers.map(
                                      (starPower: any, index: number) => (
                                        <div
                                          className={
                                            styles.starPowerImageContainer
                                          }
                                          key={starPower.id}
                                        >
                                          <Image
                                            src={`https://cdn.brawlify.com/star-powers/borderless/${starPower.id}.png`}
                                            alt={starPower.name}
                                            width={18}
                                            height={18}
                                            style={{
                                              width: "18px",
                                              height: "18px",
                                            }}
                                            className={styles.starPower}
                                          />
                                          <Image
                                            src={`/starPowerBadge.png`}
                                            alt={starPower.name}
                                            width={40}
                                            height={40}
                                            style={{
                                              width: "40px",
                                              height: "40px",
                                            }}
                                          />
                                        </div>
                                      ),
                                    )}
                                </div>
                                <div className={styles.gearContainer}>
                                  {brawler.gears &&
                                    brawler.gears.length > 0 &&
                                    brawler.gears.map(
                                      (gear: any, index: number) => (
                                        <Image
                                          key={gear.id}
                                          src={`https://cdn.brawlify.com/gears/regular/${gear.id}.png`}
                                          alt={gear.name}
                                          width={24}
                                          height={24}
                                          style={{
                                            width: "24px",
                                            height: "24px",
                                            marginLeft:
                                              index === 0
                                                ? "0"
                                                : `-${index * 16}px`,
                                          }}
                                        />
                                      ),
                                    )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {/* バトル履歴 */}
          <div className={styles.battlelogContainer}>
            {/* <h2>BATTLE LOG</h2> */}
            {battleLogs.map((battleLog, index) => {
              if (battleLog.rounds) {
                return (
                  <BattleLogSoloRanked
                    key={`${battleLog?.battleTime}-${index}`}
                    battleLog={battleLog}
                    ownTag={tag}
                  />
                );
              } else if (
                battleLog.battle.teams &&
                battleLog.battle.teams.length === 2 &&
                battleLog.battle.teams[0].length === 3
              ) {
                return (
                  <BattleLog3vs3
                    key={`${battleLog?.battleTime}-${index}`}
                    battleLog={battleLog}
                    ownTag={tag}
                  />
                );
              } else if (
                battleLog.battle.teams &&
                battleLog.battle.teams.length === 2 &&
                battleLog.battle.teams[0].length === 5
              ) {
                return (
                  <BattleLog5vs5
                    key={`${battleLog?.battleTime}-${index}`}
                    battleLog={battleLog}
                    ownTag={tag}
                  />
                );
              } else if (
                battleLog.battle.teams &&
                battleLog.battle.teams.length === 4
              ) {
                return (
                  <BattleLogTrio
                    key={`${battleLog?.battleTime}-${index}`}
                    battleLog={battleLog}
                    ownTag={tag}
                  />
                );
              } else if (
                battleLog.battle.teams &&
                battleLog.battle.teams.length === 5
              ) {
                return (
                  <BattleLogDuo
                    key={`${battleLog?.battleTime}-${index}`}
                    battleLog={battleLog}
                    ownTag={tag}
                  />
                );
              } else if (
                battleLog.battle.players &&
                battleLog.battle.players.length > 2
              ) {
                return (
                  <BattleLogSolo
                    key={`${battleLog?.battleTime}-${index}`}
                    battleLog={battleLog}
                    ownTag={tag}
                  />
                );
              } else if (
                battleLog.battle.players &&
                battleLog.battle.players.length === 2
              ) {
                return (
                  <BattleLogDuel
                    key={`${battleLog?.battleTime}-${index}`}
                    battleLog={battleLog}
                    ownTag={tag}
                  />
                );
              } else {
                return (
                  <div key={`${battleLog?.battleTime}-${index}`}>
                    不明なバトル形式
                  </div>
                );
              }
            })}
          </div>
        </>
      ) : (
        <></>
      )}
      <div className={styles.bottomContainer}>
        <div className={styles.playerListContainer}>
          <div className={styles.playerListInner}>
            {error && <p className="text-red-500">Error: {error}</p>}
            {loadingPlayers && (
              <div className={styles.searchContainer}>
                <Searching loading={loadingPlayers} />
              </div>
            )}
            {initialized && !loadingPlayers && players?.length < 1 && (
              <div className={styles.notFoundContainer}>No players found.</div>
            )}
            {players &&
              players.map((player) => {
                return (
                  <button
                    type="button"
                    key={player.tag}
                    className={
                      player.tag.includes(tag)
                        ? styles.playerItemContainerActive
                        : styles.playerItemContainer
                    }
                    onClick={() => {
                      setLoadingPlayer(true);
                      setTag(player.tag.replace(/^#/, ""));
                    }}
                    onKeyUp={() => {}}
                  >
                    <div className={styles.leftBox}>
                      {player.approved_reports_count > 0 && (
                        <Image
                          src={"/reported_player.png"}
                          alt="icon"
                          width={29}
                          height={29}
                          style={{
                            width: "auto",
                            height: "29px",
                            marginLeft: "3px",
                          }}
                        />
                      )}
                      {player.approved_reports_count === 0 && (
                        <Image
                          src={"/clean_player.png"}
                          alt="icon"
                          width={29}
                          height={29}
                          style={{
                            width: "auto",
                            height: "29px",
                            marginLeft: "3px",
                          }}
                        />
                      )}
                      <div className={styles.nameAndClubContainer}>
                        <h4>{player.name}</h4>
                        <h5>{player.club_name}</h5>
                      </div>
                    </div>
                    <div className={styles.rightBox}>
                      <div className={styles.trophyContainer}>
                        <Image
                          src={"/icon_trophy1.png"}
                          alt="trophy"
                          width={12}
                          height={12}
                          style={{
                            width: "auto",
                            height: "17px",
                            marginRight: "3px",
                            paddingTop: "5px",
                          }}
                        />
                        <span className={styles.trophyText}>
                          {player.trophies}
                        </span>
                      </div>
                      <Image
                        src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, player.rank)}.png`}
                        alt="rank"
                        height={33}
                        width={33}
                        style={{ height: "33px", width: "auto" }}
                      />
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
        <div className={styles.searchConditionContainer}>
          <InputGroup className={styles.inputGroup}>
            <InputGroupAddon align="inline-start">
              <InputGroupButton
                className={
                  history === "true"
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
              value={name || ""}
              type="search"
              enterKeyHint="search"
              maxLength={15}
              disabled
            />
            <InputGroupAddon align="inline-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled
                  asChild
                  className={styles.DropdownMenuTrigger}
                >
                  <InputGroupButton variant="ghost" className="!pr-1.5 text-xs">
                    <Image
                      src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, Number(rank))}.png`}
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
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPage />
    </Suspense>
  );
}
