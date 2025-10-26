"use client";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

export default function ClientLocaleMessageProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: any;
  children: ReactNode;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
