import { Suspense } from "react";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import ReportPage from "./_components/ReportPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <ServerLocaleMessageProviderWrapper params={params}>
          <ReportPage params={params} />
        </ServerLocaleMessageProviderWrapper>
      </Suspense>
    </>
  );
}
