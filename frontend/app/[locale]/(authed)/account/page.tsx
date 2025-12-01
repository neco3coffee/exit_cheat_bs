import { Suspense } from "react";
import Loading from "@/app/_components/Loading";
import AccountPage from "@/app/[locale]/(authed)/account/_components/client/AccountPage";

export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <AccountPage />
    </Suspense>
  );
}
