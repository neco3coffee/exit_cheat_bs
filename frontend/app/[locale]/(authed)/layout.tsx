import { Suspense } from "react";
import Loading from "@/app/_components/Loading";
import PointModalComponent from "@/app/_components/PointModal";
import PointsWatcher from "@/app/_components/PointsWatcher";
import { CurrentPlayerProviderWrapper } from "@/app/_providers/CurrentPlayerProviderWrapper";

const apiUrl = "http://app:3000";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <CurrentPlayerProviderWrapper>
        {children}
        <PointModalComponent />
        <PointsWatcher />
      </CurrentPlayerProviderWrapper>
    </Suspense>
  );
}
