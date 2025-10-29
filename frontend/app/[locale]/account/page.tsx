import { Suspense } from "react";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import AccountPage from "@/app/[locale]/account/_components/client/AccountPage";

export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <ServerLocaleMessageProviderWrapper params={params}>
      <AccountPage />
    </ServerLocaleMessageProviderWrapper>
  );
}
