"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const t = useTranslations("faq");

  const faqItems = [
    "whatIsSafeBrawl",
    "isFree",
    "mobileSupport",
    "cannotSearchByName",
    "updateFrequency",
    "wrongNameDisplayed",
    "reportFeature",
    "videoStorage",
    "videoNotDisplayed",
    "dataSource",
    "adsDisplayed",
    "deletePlayerData",
    "contact",
    "siteNotLoading",
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">{t("title")}</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqItems.map((item, index) => (
          <AccordionItem key={item} value={`item-${index}`}>
            <AccordionTrigger>{t(`items.${item}.question`)}</AccordionTrigger>
            <AccordionContent>{t(`items.${item}.answer`)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
