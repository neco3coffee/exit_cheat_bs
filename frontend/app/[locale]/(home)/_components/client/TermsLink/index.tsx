"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/app/_messages/i18n/navigation";

export default function TermsLink() {
  const t = useTranslations("termsOfService");

  return (
    <div className="flex justify-center mt-8 mb-4">
      <Link
        href="/terms-of-service"
        className="text-sm text-gray-600 hover:text-gray-900 underline"
      >
        {t("linkText")}
      </Link>
    </div>
  );
}
