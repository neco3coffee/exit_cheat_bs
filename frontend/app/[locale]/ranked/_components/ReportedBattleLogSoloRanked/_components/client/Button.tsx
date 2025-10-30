"use client";
import { Tv } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import styles from "./Button.module.scss";

export const RejectButton = ({
  reportId,
  reportIdMissing,
  reportRejected,
  failedReject,
  errorReject,
  reject,
}: {
  reportId?: string;
  reportIdMissing: string;
  reportRejected: string;
  failedReject: string;
  errorReject: string;
  reject: string;
}) => {
  const router = useRouter();

  return (
    <button
      className={styles.reject}
      onClick={() => {
        (async () => {
          if (!reportId) {
            toast.error(reportIdMissing);
            return;
          }
          try {
            const res = await fetch(`/api/v1/reports/${reportId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status: "rejected" }),
            });
            if (res.ok) {
              toast.success(reportRejected);
              await fetch("/api/v1/revalidate?tag=reports");
              router.refresh();
              return;
            } else {
              toast.error(failedReject);
            }
          } catch (error) {
            toast.error(errorReject);
          }
        })();
      }}
      type="button"
    >
      {reject}
    </button>
  );
};

export const ApproveButton = ({
  reportId,
  reportIdMissing,
  reportApproved,
  failedApprove,
  errorApprove,
  approve,
}: {
  reportId?: string;
  reportIdMissing: string;
  reportApproved: string;
  failedApprove: string;
  errorApprove: string;
  approve: string;
}) => {
  const router = useRouter();

  return (
    <button
      className={styles.approve}
      onClick={() => {
        (async () => {
          if (!reportId) {
            toast.error(reportIdMissing);
            return;
          }
          try {
            const res = await fetch(`/api/v1/reports/${reportId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status: "approved" }),
            });
            if (res.ok) {
              toast.success(reportApproved);
              await fetch("/api/v1/revalidate?tag=reports");
              router.refresh();
              return;
            } else {
              toast.error(failedApprove);
            }
          } catch (error) {
            toast.error(errorApprove);
          }
        })();
      }}
      type="button"
    >
      {approve}
    </button>
  );
};

export const ReplayButton = ({
  video_url,
  replay,
}: {
  video_url: string | null;
  replay: string;
}) => {
  return (
    <button
      className={
        video_url ? styles.replayContainer : styles.replayContainerDisabled
      }
      onClick={() => {
        // TODO: 報告モーダルに遷移してそこで動画再生するようにする
      }}
      type="button"
      disabled={!video_url}
    >
      {replay}
      <Tv className={styles.tv} />
    </button>
  );
};
