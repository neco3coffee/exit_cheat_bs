import { Suspense } from "react";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import SearchPage from "@/app/[locale]/players/search/_components/client/SearchPage";

export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ServerLocaleMessageProviderWrapper params={params}>
        <SearchPage />
      </ServerLocaleMessageProviderWrapper>
    </Suspense>
  );
}
