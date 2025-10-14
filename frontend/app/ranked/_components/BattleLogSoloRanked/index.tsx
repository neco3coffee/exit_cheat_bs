"use client";

import axios from "axios";
import { TriangleAlert } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { shortenMapName } from "@/app/_lib/common";
import { Duration, RelativeTime } from "@/app/_lib/time";
import { classifyModeByMapName } from "@/app/_lib/unknownMode";
import PlayerComponent from "@/app/ranked/_components/PlayerComponent";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import styles from "./index.module.scss";

export const ReportStatus = {
  reportNotClicked: "reportNotClicked",
  reportClicked: "reportClicked",
  reportedPlayerClicked: "reportedPlayerClicked",
  reportTypeSelected: "reportTypeSelected",
  videoSelected: "videoSelected",
  signedUrlGenerated: "signedUrlGenerated",
  videoUploading: "videoUploading",
  videoUploaded: "videoUploaded",
  reasonInputted: "reasonInputted",
  reportSubmitted: "reportSubmitted",
  error: "error",
};

const ReportType = {
  badRandom: "badRandom",
  griefPlay: "griefPlay",
  cheating: "cheating",
};

const BattleLogSoloRanked = ({ battleLog, ownTag }: any) => {
  // console.log("battleLog!: ", JSON.stringify(battleLog, null, 2));
  const tag = ownTag.trim().toUpperCase().replace(/O/g, "0");
  const ownTeam = battleLog?.battle?.teams.find((team: any) => {
    return team.some((player: any) => player.tag === `#${tag}`);
  });
  const enemyTeam = battleLog?.battle?.teams.find((team: any) => {
    return team.every((player: any) => player.tag !== `#${tag}`);
  });
  const starPlayerTag = battleLog?.battle?.starPlayer?.tag;
  const mode =
    battleLog?.event?.mode !== "unknown"
      ? battleLog?.event.mode
      : classifyModeByMapName(battleLog?.event?.map);
  const mythic1 = 12; // diamond1 = 9,mythic1 = 12, legendary1 = 15, master1 = 18, pro = 21
  const existAtLeastMythic1 = battleLog?.battle?.teams
    .flat()
    .some((player: any) => {
      return (
        player?.brawler?.trophies >= mythic1 && player?.brawler?.trophies <= 21
      ); // pro = 21
    });
  let result = null;
  if (existAtLeastMythic1) {
    result = getResult(battleLog?.rounds);
  } else {
    result = battleLog?.battle?.result;
  }

  const [status, setStatus] = useState(ReportStatus.reportNotClicked);
  const [reportedBattleLog, setReportedBattleLog] = useState<any | null>(null);
  const [reportedPlayerTag, setReportedPlayerTag] = useState<string | null>(
    null,
  );
  const [reportType, setReportType] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [cdnUrl, setCdnUrl] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  if (status !== ReportStatus.reportNotClicked) {
    console.log(
      "reportedBattleLog: ",
      JSON.stringify(reportedBattleLog, null, 2),
    );
    console.log("reportedPlayerTag: ", reportedPlayerTag);
    console.log("status: ", status);
    console.log("dialogOpen: ", dialogOpen);
    console.log("reportType: ", reportType);
    console.log("reportReason: ", reportReason);
  }

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
    setStatus(ReportStatus.videoSelected);
    (async () => {
      try {
        const res = await fetch("/api/v1/reports", {
          method: "POST",
          body: JSON.stringify({
            reporterTag: `#${tag}`,
            battleLog: reportedBattleLog,
            reportedPlayerTag: reportedPlayerTag,
            reportType: reportType,
            fileType: videoFile.type,
          }),
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          setStatus(ReportStatus.error);
          setDialogOpen(false);
          return;
        }
        const { reportId, signedUrl, cdnUrl } = await res.json();
        setReportId(reportId);
        setSignedUrl(signedUrl);
        setCdnUrl(cdnUrl);
        setStatus(ReportStatus.signedUrlGenerated);
      } catch (error) {
        console.error("Error generating signed URL:", error);
        setStatus(ReportStatus.error);
      }
    })();
  }, [videoFile]);
  // biome-ignore-end lint/correctness/useExhaustiveDependencies: 意図的にvideoFileだけで実行したい

  useEffect(() => {
    if (!signedUrl || !videoFile) return;
    setStatus(ReportStatus.videoUploading);
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
        setStatus(ReportStatus.error);
        setDialogOpen(false);
        return;
      }
      setStatus(ReportStatus.videoUploaded);
    })();
  }, [signedUrl, videoFile]);

  useEffect(() => {
    if (!dialogOpen) {
      setTimeout(() => {
        setStatus(ReportStatus.reportNotClicked);
        setReportedBattleLog(null);
        setReportedPlayerTag(null);
        setReportType(null);
        setReportReason("");
        setVideoFile(null);
        setSignedUrl(null);
        setCdnUrl(null);
        setReportId(null);
        setUploadProgress(0);
      }, 1000);
    }
  }, [dialogOpen]);

  return (
    <>
      <div className={styles.container} data-testid="battleLog">
        <div className={styles.topContainer}>
          <div className={styles.left}></div>
          <h5>
            {battleLog?.battle?.type === "friendly"
              ? battleLog?.battle?.type?.toUpperCase()
              : ""}
          </h5>
          {battleLog?.battleTime && (
            <div className={`${styles.right} notranslate`}>
              <RelativeTime target={battleLog?.battleTime} />
            </div>
          )}
        </div>
        <div className={styles.middleContainer}>
          <div className={styles.left}>
            <Image
              src={`/modes/${mode}.png`}
              alt={battleLog?.event?.mode || "mode"}
              width={30}
              height={30}
            />
            <div className={styles.modeAndMapContainer}>
              {/* TODO:DADGEBALLじゃなくてDOGDEBRAWLって表示できるようにする */}
              <h5 className="notranslate">
                {battleLog?.event?.mode === "unknown"
                  ? mode?.toUpperCase()
                  : battleLog?.event?.mode?.toUpperCase()}
              </h5>
              <h6
                className="notranslate"
                style={{ WebkitTouchCallout: "none" } as React.CSSProperties}
              >
                {shortenMapName(battleLog?.event?.map)}
              </h6>
            </div>
          </div>
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
            {result?.toUpperCase()}
          </h5>
          <div className={styles.right}>
            {battleLog?.battle.type === "ranked" &&
            battleLog?.battle?.trophyChange ? (
              <>
                {battleLog?.battle?.trophyChange > 0
                  ? `+${battleLog?.battle?.trophyChange}`
                  : battleLog?.battle?.trophyChange}
                <Image
                  src="/icon_trophy1.png"
                  alt="trophy icon"
                  width={15}
                  height={15}
                />
              </>
            ) : (
              <div></div>
            )}
          </div>
        </div>
        <div className={styles.bottomContainer}>
          <div className={styles.bottomContainerInner}>
            <div className={styles.teamContainer}>
              {ownTeam?.map((player: any) => {
                return (
                  <PlayerComponent
                    key={player?.tag}
                    player={player}
                    starPlayerTag={starPlayerTag}
                    battleType={battleLog?.battle?.type}
                    isMe={player?.tag === `#${tag}`}
                    status={status}
                    setStatus={setStatus}
                    setReportedPlayerTag={setReportedPlayerTag}
                    setDialogOpen={setDialogOpen}
                  />
                );
              })}
            </div>
            <div className={styles.vsContainer}>
              <strong className="notranslate">VS</strong>
            </div>
            <div className={styles.teamContainer}>
              {enemyTeam?.map((player: any) => {
                return (
                  <PlayerComponent
                    key={player?.tag}
                    player={player}
                    starPlayerTag={starPlayerTag}
                    battleType={battleLog?.battle?.type}
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
                    {round?.result?.toUpperCase()}
                  </h5>
                  <div className={styles.right}>
                    {index === 0 && (
                      <button
                        type="button"
                        className={`${styles.reportButton} ${status !== ReportStatus.reportNotClicked ? styles.reportButtonClicked : ""}`}
                        onClick={() => {
                          setStatus(ReportStatus.reportClicked);
                          setReportedBattleLog(battleLog);
                        }}
                        disabled={status !== ReportStatus.reportNotClicked}
                      >
                        REPORT <TriangleAlert className={styles.icon} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Dialog open={dialogOpen}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader className={styles.dialogHeader}>
            <DialogTitle>
              REPORT{" "}
              {reportedBattleLog &&
                reportedPlayerTag &&
                reportedBattleLog?.battle?.teams?.flat().find((player: any) => {
                  return player.tag === reportedPlayerTag;
                }).name}
              ?
            </DialogTitle>
          </DialogHeader>
          {status === ReportStatus.reportedPlayerClicked && (
            <div className={styles.reportTypeDialogBody}>
              <button
                className={styles.reportTypeContainer}
                onClick={() => {
                  setReportType(ReportType.badRandom);
                  setStatus(ReportStatus.reportTypeSelected);
                }}
                type="button"
              >
                <Image
                  src="/bad_random.png"
                  alt="bad random"
                  width={50}
                  height={50}
                  style={{ height: "50px", width: "auto" }}
                />
                <h5>BAD RANDOM</h5>
                <p>
                  No aim, <br />
                  no skill, <br />
                  no coordination
                </p>
              </button>
              <button
                className={styles.reportTypeContainer}
                onClick={() => {
                  setReportType(ReportType.griefPlay);
                  setStatus(ReportStatus.reportTypeSelected);
                }}
                type="button"
              >
                <Image
                  src="/grief_play.png"
                  alt="grief play"
                  width={50}
                  height={50}
                  style={{ height: "50px", width: "auto" }}
                />
                <h5>GRIEF PLAY</h5>
                <p>
                  Standing still, <br />
                  not attacking, <br />
                  team sabotage or giving up
                </p>
              </button>
              <button
                className={styles.reportTypeContainer}
                onClick={() => {
                  setReportType(ReportType.cheating);
                  setStatus(ReportStatus.reportTypeSelected);
                }}
                type="button"
              >
                <Image
                  src="/cheating.png"
                  alt="cheating"
                  width={50}
                  height={50}
                  style={{ height: "50px", width: "auto" }}
                />
                <h5>CHEATING</h5>
                <p>
                  Using hacks, <br />
                  bots, <br />
                  exploits, <br />
                  or takedown trading
                </p>
              </button>
            </div>
          )}
          {(status === ReportStatus.reportTypeSelected ||
            status === ReportStatus.videoSelected ||
            status === ReportStatus.signedUrlGenerated ||
            status === ReportStatus.videoUploading ||
            status === ReportStatus.videoUploaded ||
            status === ReportStatus.error ||
            status === ReportStatus.reasonInputted ||
            status === ReportStatus.reportSubmitted) && (
            <div className={styles.reportVideoDialogBody}>
              {cdnUrl &&
              status === ReportStatus.videoUploaded &&
              uploadProgress === 100 ? (
                <video
                  loop
                  autoPlay
                  src={cdnUrl}
                  style={{
                    backgroundColor: "var(--blue-black)",
                    aspectRatio: "16/9",
                  }}
                >
                  <track kind="captions" src={cdnUrl} label="No captions" />
                </video>
              ) : (
                <video
                  loop
                  autoPlay
                  src="#"
                  style={{
                    backgroundColor: "var(--blue-black)",
                    aspectRatio: "16/9",
                  }}
                >
                  <track kind="captions" src="#" label="No captions" />
                </video>
              )}
              {status === ReportStatus.videoUploading && (
                <Progress
                  value={uploadProgress}
                  max={100}
                  className={styles.progress}
                />
              )}
              <Label
                htmlFor="video"
                style={{
                  marginTop: "10px",
                  marginBottom: "5px",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {status === ReportStatus.videoUploaded &&
                uploadProgress === 100 ? (
                  <span style={{ color: "var(--green)" }}>
                    Video uploaded successfully!
                  </span>
                ) : (
                  <span style={{ color: "var(--red)" }}>
                    Please Upload Battle Replay Video
                  </span>
                )}
              </Label>
              <Input
                id="video"
                type="file"
                accept=".mov,.mp4"
                style={{ width: "250px", backgroundColor: "var(--blue-black)" }}
                onChange={handleFileChange}
                disabled={
                  status === ReportStatus.videoUploading ||
                  status === ReportStatus.videoUploaded
                }
              />
              <Label
                htmlFor="reason"
                style={{
                  marginTop: "16px",
                  marginBottom: "5px",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                report reason
              </Label>
              <Textarea
                rows={6}
                value={reportReason}
                onChange={handleReasonChange}
                placeholder="Type your reason here."
                id="reason"
                style={{
                  backgroundColor: "var(--blue-black)",
                  color: "var(--white)",
                  padding: "8px",
                }}
              />
              <div className={styles.buttonContainer}>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    setDialogOpen(false);
                  }}
                  type="button"
                >
                  CANCEL
                </button>
                <button
                  className={
                    status !== ReportStatus.videoUploaded
                      ? styles.reportButtonDisabled
                      : styles.reportButton
                  }
                  disabled={status !== ReportStatus.videoUploaded}
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/v1/reports/${reportId}`, {
                        method: "PUT",
                        body: JSON.stringify({
                          cdnUrl: cdnUrl,
                          reportReason: reportReason,
                        }),
                        headers: { "Content-Type": "application/json" },
                      });
                      if (!res.ok) {
                        setDialogOpen(false);
                        toast.error("Failed to report the player");
                        return;
                      }

                      if (res.ok) {
                        setDialogOpen(false);
                        toast.success("Player reported, thanks!");
                      }
                    } catch (error) {
                      console.error("Error submitting report:", error);
                      setDialogOpen(false);
                      toast.error("Failed to report the player");
                      return;
                    }
                  }}
                  type="button"
                >
                  REPORT
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BattleLogSoloRanked;

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
