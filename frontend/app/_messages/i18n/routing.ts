import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ja", "en", "zh", "cs", "fr", "sq", "pt", "fr-ca", "hr"],
  defaultLocale: "ja",
  localePrefix: "always",
});
