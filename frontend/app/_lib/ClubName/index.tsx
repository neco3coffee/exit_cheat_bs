"use client";
import { useTranslations } from "next-intl";

const clubNameRegex = /<c([0-9])>(.*?)<\/c>/;

const ClubName = ({ clubName }: { clubName?: string }) => {
  const t = useTranslations("players");

  if (!clubName) {
    return <span>{t("notInClub")}</span>;
  }

  // クラブに <c0>B • W</c> みたいな色コードが含まれている場合に除去しつつ、0-9の色コードに応じて色を変える
  const match = clubName.match(clubNameRegex);

  if (match) {
    const colorCode = match[1];
    const name = match[2];
    return (
      <span style={{ color: `var(--club-color-c${colorCode})` }}>{name}</span>
    );
  } else {
    return <span style={{ color: "var(--white)" }}>{clubName}</span>;
  }
};

export default ClubName;
