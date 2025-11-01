"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/app/_messages/i18n/navigation";

export default function TermsLink() {
  const tTerms = useTranslations("termsOfService");
  const tPrivacy = useTranslations("privacyPolicy");

  return (
    <div className="flex justify-center mt-8 mb-4 gap-4">
      <Link
        href="/terms-of-service"
        className="text-sm text-gray-600 hover:text-gray-900 underline"
      >
        {tTerms("linkText")}
      </Link>
      <Link
        href="/privacy-policy"
        className="text-sm text-gray-600 hover:text-gray-900 underline"
      >
        {tPrivacy("linkText")}
      </Link>
    </div>
  );
}
