import { Suspense } from "react";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import Loading from "../../ranked/loading";
import ReportPage from "./_components/ReportPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <ServerLocaleMessageProviderWrapper params={params}>
          <ReportPage params={params} />
        </ServerLocaleMessageProviderWrapper>
      </Suspense>
    </>
  );
}
