import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: [
    "fi",
    "ja",
    "en",
    "zh",
    "ko",
    "cs",
    "fr",
    "sq",
    "pt",
    "fr-ca",
    "hr",
  ],
  defaultLocale: "ja",
  localePrefix: "always",
});
