"use client";

import axios from "axios";
import { Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  appendToEightDigits,
  shortenMapName,
  shortenPlayerName,
} from "@/app/_lib/common";
import { Duration, RelativeTime } from "@/app/_lib/time";
import { classifyModeByMapName } from "@/app/_lib/unknownMode";
import { defineStepper } from "@/components/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import styles from "./index.module.scss";

// const apiUrl = "http://app:3000";

const { Stepper } = defineStepper(
  { id: "step-1", title: "selectPlayer" },
  { id: "step-2", title: "selectReportType" },
  { id: "step-3", title: "replayVideo" },
  { id: "step-4", title: "reportComplete" },
);

const ReportType = {
  badRandom: "badRandom",
  griefPlay: "griefPlay",
  cheating: "cheating",
};

export default function ReportCreateView({
  report,
  locale,
}: {
  report: any;
  locale: string;
}) {
  const t = useTranslations("ranked");
  const {
    reporter_tag,
    reported_tag,
    report_type,
    video_url,
    reason,
    battle_data,
  } = report;
  const [reportedTag, setReportedTag] = useState<string | null>(
    reported_tag || null,
  );
  const [reportType, setReportType] = useState<string | null>(
    report_type || null,
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [cdnUrl, setCdnUrl] = useState<string | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [reportReason, setReportReason] = useState<string>(reason || "");

  console.log("reportedTag:", reportedTag);
  console.log("reportType:", reportType);
  console.log("videoFile:", videoFile);
  console.log("signedUrl:", signedUrl);
  console.log("cdnUrl:", cdnUrl);
  console.log("uploadProgress:", uploadProgress);
  console.log("reportReason:", reportReason);

  const debounce = (func: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const lines = value.split("\n").length;
    if (lines <= 6) {
      setReportReason(value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  // biome-ignore-start lint/correctness/useExhaustiveDependencies: 意図的にvideoFileだけで実行したい
  useEffect(() => {
    if (!videoFile) return;
    (async () => {
      try {
        const res = await fetch(`/api/v1/reports/${report.id}/signed_url`, {
          method: "POST",
          body: JSON.stringify({
            id: report.id,
            reportedPlayerTag: reportedTag,
            reportType: reportType,
            fileType: videoFile.type,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!res.ok) {
          toast.error(t("failedGenerateSignedUrl"));
          return;
        }
        const { reportId, signedUrl, cdnUrl } = await res.json();
        setSignedUrl(signedUrl);
        setCdnUrl(cdnUrl);
      } catch (error) {
        console.error("Error generating signed URL:", error);
        toast.error(t("failedGenerateSignedUrl"));
      }
    })();
  }, [videoFile]);
  // biome-ignore-end lint/correctness/useExhaustiveDependencies: 意図的にvideoFileだけで実行したい

  useEffect(() => {
    if (!signedUrl || !videoFile) return;
    (async () => {
      try {
        await axios.put(signedUrl, videoFile, {
          headers: {
            "Content-Type": videoFile.type,
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadProgress(progress);
          },
        });
      } catch (error) {
        console.error("Error uploading video:", error);
        toast.error(t("failedUploadVideo"));
        return;
      }
    })();
  }, [signedUrl, videoFile, t]);

  return (
    <Stepper.Provider
      className="mt-8!"
      initialStep={
        !reported_tag
          ? "step-1"
          : !report_type
            ? "step-2"
            : !video_url
              ? "step-3"
              : "step-4"
      }
    >
      {({ methods }) => (
        <>
          <Stepper.Navigation className="p-4!">
            {methods.all.map((step: any) => (
              <Stepper.Step of={step.id} key={step.id}>
                <Stepper.Title>{t(step.title)}</Stepper.Title>
              </Stepper.Step>
            ))}
          </Stepper.Navigation>
          {methods.switch({
            "step-1": (step: any) => (
              <Content
                id={step.id}
                locale={locale}
                reportId={report.id}
                reporterTag={reporter_tag}
                battleLog={battle_data}
                setReportedTag={setReportedTag}
                setReportType={setReportType}
                handleFileChange={handleFileChange}
                uploadProgress={uploadProgress}
                cdnUrl={cdnUrl}
                handleReasonChange={handleReasonChange}
                reportReason={reportReason}
                goToNext={methods.next}
              />
            ),
            "step-2": (step: any) => (
              <Content
                id={step.id}
                reporterTag={reporter_tag}
                locale={locale}
                reportId={report.id}
                battleLog={battle_data}
                setReportedTag={setReportedTag}
                setReportType={setReportType}
                handleFileChange={handleFileChange}
                uploadProgress={uploadProgress}
                cdnUrl={cdnUrl}
                handleReasonChange={handleReasonChange}
                reportReason={reportReason}
                goToNext={methods.next}
              />
            ),
            "step-3": (step: any) => (
              <Content
                id={step.id}
                reporterTag={reporter_tag}
                locale={locale}
                reportId={report.id}
                battleLog={battle_data}
                setReportedTag={setReportedTag}
                setReportType={setReportType}
                handleFileChange={handleFileChange}
                uploadProgress={uploadProgress}
                cdnUrl={cdnUrl}
                handleReasonChange={handleReasonChange}
                reportReason={reportReason}
                goToNext={methods.next}
              />
            ),
            "step-4": (step: any) => (
              <Content
                id={step.id}
                reporterTag={reporter_tag}
                locale={locale}
                reportId={report.id}
                battleLog={battle_data}
                setReportedTag={setReportedTag}
                setReportType={setReportType}
                handleFileChange={handleFileChange}
                uploadProgress={uploadProgress}
                cdnUrl={cdnUrl}
                handleReasonChange={handleReasonChange}
                reportReason={reportReason}
                goToNext={methods.next}
              />
            ),
          })}
        </>
      )}
    </Stepper.Provider>
  );
}

const Content = ({
  id,
  locale,
  reportId,
  reporterTag,
  reportedTag,
  battleLog,
  setReportedTag,
  setReportType,
  handleFileChange,
  uploadProgress,
  cdnUrl,
  handleReasonChange,
  reportReason,
  goToNext,
}: {
  id: string;
  locale?: string;
  reportId: string;
  reporterTag?: string;
  reportedTag?: string;
  battleLog?: any;
  setReportedTag: (tag: string) => void;
  setReportType: (type: string) => void;
  handleFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadProgress?: number;
  cdnUrl?: string;
  handleReasonChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  reportReason?: string;
  goToNext: () => void;
}) => {
  const router = useRouter();
  const tag = reporterTag?.trim().toUpperCase().replace(/O/g, "0");
  const ownTeam = battleLog?.battle?.teams.find((team: any) => {
    return team.some((player: any) => player.tag === `${tag}`);
  });
  const enemyTeam = battleLog?.battle?.teams.find((team: any) => {
    return team.every((player: any) => player.tag !== `${tag}`);
  });
  const starPlayerTag = battleLog?.battle?.starPlayer?.tag;
  const mode =
    battleLog?.event?.mode !== "unknown"
      ? battleLog?.event.mode
      : classifyModeByMapName(battleLog?.event?.map);
  const mapId = battleLog?.event?.id;
  const mythic1 = 12; // diamond1 = 9,mythic1 = 12, legendary1 = 15, master1 = 18, pro = 21
  const existAtLeastMythic1 = battleLog?.battle?.teams
    .flat()
    .some((player: any) => {
      return (
        player?.brawler?.trophies - 1 >= mythic1 &&
        player?.brawler?.trophies <= 21
      ); // pro = 21
    });
  let result = null;
  if (existAtLeastMythic1) {
    result = getResult(battleLog?.rounds);
  } else {
    result = battleLog?.battle?.result;
  }

  const t = useTranslations("ranked");

  useEffect(() => {
    if (id !== "step-4") return;
    const timer = setTimeout(() => {
      router.replace(`/${locale}/ranked`);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, router, locale]);

  if (id === "step-1") {
    return (
      <Stepper.Panel className="h-[400px] content-center p-5!">
        <div className={styles.container} data-testid="battleLog">
          <div className={styles.topContainer}>
            <div className={styles.left}></div>
            <h5>
              {battleLog?.battle?.type === "friendly"
                ? battleLog?.battle?.type?.toUpperCase()
                : ""}
            </h5>
            {battleLog?.battleTime && (
              <div className={`${styles.right}  `}>
                <RelativeTime target={battleLog?.battleTime} />
              </div>
            )}
          </div>
          <div className={styles.middleContainer}>
            <Link className={styles.left} href={`/${locale}/maps/${mapId}`}>
              <Image
                src={`/modes/${mode}.png`}
                alt={battleLog?.event?.mode || "mode"}
                width={30}
                height={30}
                sizes="30px"
                style={{ height: "30px", width: "auto" }}
              />
              <div className={styles.modeAndMapContainer}>
                {/* TODO:DADGEBALLじゃなくてDOGDEBRAWLって表示できるようにする */}
                <h5>
                  {battleLog?.event?.mode === "unknown"
                    ? mode?.toUpperCase()
                    : battleLog?.event?.mode?.toUpperCase()}
                </h5>
                <h6
                  style={{ WebkitTouchCallout: "none" } as React.CSSProperties}
                >
                  {shortenMapName(battleLog?.event?.map)}
                </h6>
              </div>
            </Link>
            <h5
              className={
                result === "victory"
                  ? styles.victory
                  : result === "defeat"
                    ? styles.defeat
                    : result === "ongoing"
                      ? styles.ongoing
                      : styles.draw
              }
            >
              {t(result)}
            </h5>
            <div className={styles.right}></div>
          </div>
          <div className={styles.bottomContainer}>
            <div className={styles.bottomContainerInner}>
              <div className={styles.teamContainer}>
                {ownTeam?.map((player: any) => {
                  return (
                    <PlayerComponent
                      locale={locale}
                      key={player?.tag}
                      player={player}
                      starPlayerTag={starPlayerTag}
                      battleType={battleLog?.battle?.type}
                      isMe={player?.tag === `${tag}`}
                      setReportedPlayerTag={setReportedTag}
                      reportedPlayerTag={reportedTag}
                      goToNext={goToNext}
                    />
                  );
                })}
              </div>
              <div className={styles.vsContainer}>
                <strong>VS</strong>
              </div>
              <div className={styles.teamContainer}>
                {enemyTeam?.map((player: any) => {
                  return (
                    <PlayerComponent
                      locale={locale}
                      key={player?.tag}
                      player={player}
                      starPlayerTag={starPlayerTag}
                      battleType={battleLog?.battle?.type}
                      isMe={player?.tag === `${tag}`}
                      setReportedPlayerTag={setReportedTag}
                      reportedPlayerTag={reportedTag}
                      goToNext={goToNext}
                    />
                  );
                })}
              </div>
            </div>
            <div className={styles.roundsContainer}>
              {battleLog?.rounds?.map((round: any, index: number) => {
                return (
                  <div
                    key={`${index}-${round.duration}`}
                    className={styles.roundContainer}
                  >
                    <div className={styles.left}>
                      <h6>ROUND {index + 1}</h6>
                      <Duration seconds={round?.duration} />
                    </div>
                    <h5
                      className={
                        round.result === "victory"
                          ? styles.victory
                          : round.result === "defeat"
                            ? styles.defeat
                            : styles.draw
                      }
                    >
                      {t(round?.result)}
                    </h5>
                    <div className={styles.right}></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ backgroundColor: "var(--black)" }}></div>
        </div>
      </Stepper.Panel>
    );
  }

  if (id === "step-2") {
    return (
      <Stepper.Panel
        className={`h-[400px] content-center p-5! ${styles.dialogContent}`}
      >
        <div className={styles.reportTypeDialogBody}>
          <button
            className={styles.reportTypeContainer}
            onClick={() => {
              setReportType(ReportType.badRandom);
              goToNext();
            }}
            type="button"
          >
            <Image
              src="/bad_random.png"
              alt="bad random"
              width={50}
              height={50}
              sizes="50px"
              style={{ height: "50px", width: "auto" }}
            />
            <h5>{t("reportType.badRandom")}</h5>
            <p>{t("reportReason.badRandom")}</p>
          </button>
          <button
            className={styles.reportTypeContainer}
            onClick={() => {
              setReportType(ReportType.griefPlay);
              goToNext();
            }}
            type="button"
          >
            <Image
              src="/grief_play.png"
              alt="grief play"
              width={50}
              height={50}
              sizes="50px"
              style={{ height: "50px", width: "auto" }}
            />
            <h5>{t("reportType.griefPlay")}</h5>
            <p>{t("reportReason.griefPlay")}</p>
          </button>
          <button
            className={styles.reportTypeContainer}
            onClick={() => {
              setReportType(ReportType.cheating);
              goToNext();
            }}
            type="button"
          >
            <Image
              src="/cheating.png"
              alt="cheating"
              width={50}
              height={50}
              sizes="50px"
              style={{ height: "50px", width: "auto" }}
            />
            <h5>{t("reportType.cheating")}</h5>
            <p>{t("reportReason.cheating")}</p>
          </button>
        </div>
      </Stepper.Panel>
    );
  }

  if (id === "step-3") {
    return (
      <Stepper.Panel
        className={`h-[400px] content-center p-5! ${styles.dialogContent}`}
      >
        <div className={styles.reportVideoDialogBody}>
          {cdnUrl && uploadProgress === 100 ? (
            <video
              loop
              autoPlay
              playsInline
              muted
              src={cdnUrl}
              style={{
                backgroundColor: "var(--blue-black)",
                aspectRatio: "16/9",
              }}
            >
              <track kind="captions" src={cdnUrl} label="No captions" />
            </video>
          ) : (
            <div className={styles.videoUploadContainer}>
              <Input
                id="video"
                type="file"
                accept=".mov,.mp4"
                className={styles.fileInput}
                onChange={handleFileChange}
                disabled={uploadProgress === 100}
              />
              <div className={styles.videoUploadIcon}>
                <Video className="w-12 h-12 text-white" />
              </div>
            </div>
          )}
          <Progress
            value={uploadProgress}
            max={100}
            className={styles.progress}
          />
          <Label
            htmlFor="video"
            style={{
              marginTop: "10px",
              marginBottom: "5px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {uploadProgress === 100 ? (
              <span style={{ textAlign: "center", color: "var(--white)" }}>
                {t("successUploadVideo")}
              </span>
            ) : (
              <span style={{ textAlign: "center", color: "var(--white)" }}>
                {t("pleaseUploadVideo")}
              </span>
            )}
          </Label>
          {cdnUrl && uploadProgress === 100 && (
            <button
              className={styles.reportButton}
              onClick={async () => {
                try {
                  const res = await fetch(`/api/v1/reports/${reportId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                      cdnUrl: cdnUrl,
                      reportReason: reportReason,
                    }),
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                  });
                  if (!res.ok) {
                    toast.error(t("failedReport"));
                    return;
                  }

                  if (res.ok) {
                    await fetch("/api/v1/revalidate?tag=reports");
                    toast.success(t("successReport"));
                    goToNext();
                    return;
                  }
                } catch (error) {
                  console.error("Error submitting report:", error);
                  toast.error(t("failedReport"));
                  return;
                }
              }}
              type="button"
            >
              {t("reportButton")}
            </button>
          )}
        </div>
      </Stepper.Panel>
    );
  }

  if (id === "step-4") {
    return (
      <Stepper.Panel className="h-[400px] content-center p-5! flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-center">
          {t("reportCompleteDescription")}
        </p>
      </Stepper.Panel>
    );
  }

  return <></>;
};

const getResult = (rounds: any[]) => {
  const victoryCount = rounds.filter(
    (round) => round.result === "victory",
  ).length;
  const defeatCount = rounds.filter(
    (round) => round.result === "defeat",
  ).length;

  if (victoryCount >= 2) return "victory";
  if (defeatCount >= 2) return "defeat";
  if (rounds.length < 3) return "ongoing";
  return "draw";
};

function PlayerComponent({
  locale,
  player,
  starPlayerTag,
  isDuel,
  isMe,
  setReportedPlayerTag,
  reportedPlayerTag,
  goToNext,
}: any) {
  const shortenedName = shortenPlayerName(player?.name);
  const isStarPlayer = player?.tag === starPlayerTag;

  const t = useTranslations("ranked");

  return (
    <button
      key={player?.tag}
      className={styles.playerContainer}
      data-testid="playerComponent"
      onClick={() => {
        if (isMe) return;
        setReportedPlayerTag(player?.tag);
        goToNext();
      }}
      type="button"
    >
      {reportedPlayerTag === player?.tag && (
        <Image
          src="/reported_player.png"
          alt="reported player"
          width={24}
          height={24}
          sizes="24px"
          className={styles.reportedIcon}
        />
      )}
      {isStarPlayer && (
        <div className={`${styles.mvpContainer}  `}>STAR PLAYER</div>
      )}
      <div className={styles.brawlerContainer}>
        <Image
          src={`https://cdn.brawlify.com/brawlers/borderless/${isDuel ? player?.brawlers[0].id : player?.brawler?.id}.png`}
          alt={
            isDuel
              ? player?.brawlers[0].name
              : player?.brawler?.name || "brawler"
          }
          fill={true}
          sizes="42px"
        />
        <div className={styles.rank}>
          <Image
            src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, player?.brawler?.trophies > 0 ? player?.brawler?.trophies - 1 : 0)}.png`}
            alt="rank"
            height={20}
            width={20}
            sizes="20px"
            style={{ height: "20px", width: "auto" }}
          />
        </div>
        <div className={styles.levelContainer}>
          <strong>LVL</strong>
          <h6>{player?.brawler?.power}</h6>
        </div>
      </div>
      {!isMe && (
        <>
          <button
            className={styles.reportButton}
            onClick={(e) => {
              e.preventDefault();
              setReportedPlayerTag(player?.tag);
              goToNext();
            }}
            type="button"
          >
            {t("report")}
          </button>
          <Image
            src="/reported_player.png"
            alt="reported player"
            width={16}
            height={16}
            sizes="16px"
            className={styles.reportIcon}
          />
        </>
      )}
      <span>{shortenedName}</span>
    </button>
  );
}
