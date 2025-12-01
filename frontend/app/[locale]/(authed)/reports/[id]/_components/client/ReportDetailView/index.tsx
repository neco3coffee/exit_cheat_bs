"use client";
import {
  Bot,
  Circle,
  CircleCheck,
  CircleX,
  Clock,
  FileSearch,
  Video,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import VideoPlayer from "@/app/_components/VideoPlayer.tsx";
import styles from "./index.module.scss";

const StatusType = {
  info_and_video_updated: "info_and_video_updated",
  video_optimized: "video_optimized",
  waiting_review: "waiting_review",
  approved: "approved",
  rejected: "rejected",
};

const StatusIcon = {
  info_and_video_updated: <Bot className={styles.statusIconPending} />,
  video_optimized: <FileSearch className={styles.statusIconPending} />,
  waiting_review: <FileSearch className={styles.statusIconReview} />,
  approved: <CircleCheck className={styles.statusIconApproved} />,
  rejected: <CircleX className={styles.statusIconRejected} />,
};

export default function ReportDetailView({
  report,
  locale,
}: {
  report: any;
  locale: string;
}) {
  const t = useTranslations("reportDetail");

  return (
    <div className={styles.container}>
      <div
        className={
          styles.statusContainer + " flex gap-0 justify-center items-center"
        }
      >
        {/* 1つ目 */}
        <div className="flex flex-col items-center">
          <span
            className={
              "rounded-full w-10 h-10 flex items-center justify-center " +
              (report.status === StatusType.info_and_video_updated
                ? "bg-blue-500 text-white"
                : report.status === StatusType.video_optimized ||
                    report.status === StatusType.waiting_review ||
                    report.status === StatusType.approved ||
                    report.status === StatusType.rejected
                  ? "bg-green-500 text-white"
                  : "bg-gray-400 text-white")
            }
          >
            <Bot className="w-6 h-6" />
          </span>
          <span className="mt-1 text-xs text-white">{t("aiCheck")}</span>
        </div>
        {/* バー1 */}
        <div
          className={
            "h-2 w-12 mx-2 rounded " +
            (report.status === StatusType.video_optimized ||
            report.status === StatusType.waiting_review ||
            report.status === StatusType.approved ||
            report.status === StatusType.rejected
              ? "bg-green-500"
              : "bg-white")
          }
        />
        {/* 2つ目 */}
        <div className="flex flex-col items-center">
          <span
            className={
              "rounded-full w-10 h-10 flex items-center justify-center " +
              (report.status === StatusType.video_optimized ||
              report.status === StatusType.waiting_review
                ? "bg-blue-500 text-white"
                : report.status === StatusType.approved ||
                    report.status === StatusType.rejected
                  ? "bg-green-500 text-white"
                  : "bg-gray-400 text-white")
            }
          >
            <FileSearch className="w-6 h-6" />
          </span>
          <span className="mt-1 text-xs text-white">{t("waitingReview")}</span>
        </div>
        {/* バー2 */}
        <div
          className={
            "h-2 w-12 mx-2 rounded " +
            (report.status === StatusType.approved ||
            report.status === StatusType.rejected
              ? "bg-green-500"
              : "bg-white")
          }
        />
        {/* 3つ目 */}
        <div className="flex flex-col items-center">
          <span
            className={
              "rounded-full w-10 h-10 flex items-center justify-center " +
              (report.status === StatusType.approved
                ? "bg-green-500 text-white"
                : report.status === StatusType.rejected
                  ? "bg-red-500 text-white"
                  : "bg-gray-400 text-white")
            }
          >
            {report.status === StatusType.approved ? (
              <CircleCheck className="w-6 h-6" />
            ) : report.status === StatusType.rejected ? (
              <CircleX className="w-6 h-6" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </span>
          <span className="mt-1 text-xs text-white">{t("reviewed")}</span>
        </div>
      </div>
      <div className={styles.reportVideoContainer}>
        <div className={styles.mainVideoDescription}>
          {t("videoDescription")}
        </div>
        <VideoPlayer src={report.video_url} />
        {/* <video
          id="mainVideo"
          key={report.video_url}
          autoPlay
          loop
          muted
          playsInline
          src={report.video_url}
          preload="none"
        >
          <track kind="captions" src={report.video_url} label="No captions" />
        </video> */}
        <div className={styles.reportInfo}>
          <div className={styles.reportedPlayerIconContainer}>
            <Image
              src={`https://cdn.brawlify.com/brawlers/borderless/${report.battle_data.battle.teams.flat().find((p: any) => p.tag === report.reported_tag).brawler.id}.png`}
              alt="reported brawler"
              width={50}
              height={50}
              sizes="50px"
              style={{ height: "50px", width: "auto" }}
            />
            <Image
              src="/reported_player.png"
              alt="reported player"
              width={24}
              height={24}
              sizes="24px"
              className={styles.reportedIcon}
            />
          </div>
          <p>
            {
              report.battle_data.battle.teams
                .flat()
                .find((p: any) => p.tag === report.reported_tag).name
            }
          </p>
        </div>
      </div>
      <div className={styles.reviewCommentContainer}>
        <h2 className={styles.reviewCommentTitle}>{t("reviewComment")}</h2>
        {report.review_comment ? (
          <p className={styles.reviewCommentText}>{report.review_comment}</p>
        ) : (
          <p className={styles.noReviewCommentText}>{t("noComments")}</p>
        )}
      </div>
    </div>
  );
}
