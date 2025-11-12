"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import styles from "./index.module.scss";

export default function ReportButton({
  locale,
  tag,
  battleLog,
  isReported,
}: {
  locale: string;
  tag: string;
  battleLog: any;
  isReported: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("ranked");

  return (
    <button
      type="button"
      className={`${styles.reportButton} ${isReported ? styles.reportButtonClicked : ""}`}
      onClick={() => {
        if (isReported) return;
        async function createReport() {
          try {
            const res = await fetch("/api/v1/reports", {
              method: "POST",
              body: JSON.stringify({
                reporterTag: `#${tag}`,
                battleLog: battleLog,
              }),
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });
            if (!res.ok) {
              toast.error(t("failedCreateReport"));
              return;
            }
            const { reportId } = await res.json();
            toast.success(t("successCreateReport"));
            await fetch("/api/v1/revalidate?tag=reports");
            router.push(`/${locale}/reports/${reportId}`);
          } catch (error) {
            console.error("Error creating report:", error);
            toast.error(t("failedCreateReport"));
          }
        }
        createReport();
      }}
      disabled={isReported}
    >
      {isReported ? (
        t("reported")
      ) : (
        <>
          {t("report")}{" "}
          <Image
            src="/reported_player.png"
            alt="reported player"
            width={18}
            height={18}
            sizes="18px"
            style={{ marginLeft: "4px" }}
          />
        </>
      )}
    </button>
  );
}
