import { Suspense } from "react";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import RankedPage from "@/app/[locale]/ranked/_components/client/RankedPage";

export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ServerLocaleMessageProviderWrapper params={params}>
        <RankedPage />
      </ServerLocaleMessageProviderWrapper>
    </Suspense>
  );
}
