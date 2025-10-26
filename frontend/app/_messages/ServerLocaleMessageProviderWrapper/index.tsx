import { Suspense, use } from "react";
import ClientLocaleMessageProvider from "@/app/_messages/ClientLocaleMessageProvider";
import { loadMessages } from "./messages";

export default function ServerLocaleMessageProviderWrapper({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const locale = use(params).locale;
  const messages = use(loadMessages(locale));

  return (
    <Suspense fallback={null}>
      <ClientLocaleMessageProvider locale={locale} messages={messages}>
        {children}
      </ClientLocaleMessageProvider>
    </Suspense>
  );
}
