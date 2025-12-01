import { Suspense } from "react";
import Loading from "@/app/_components/Loading";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import AccountPage from "@/app/[locale]/(authed)/account/_components/client/AccountPage";

export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <ServerLocaleMessageProviderWrapper params={params}>
      <Suspense fallback={<Loading />}>
        <AccountPage />
      </Suspense>
    </ServerLocaleMessageProviderWrapper>
  );
}
