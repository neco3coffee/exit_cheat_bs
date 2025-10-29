import { cacheLife } from "next/cache";
import { Spinner } from "@/components/ui/spinner";
import styles from "./page.module.scss";

export default async function Loading() {
  "use cache";
  cacheLife("max");

  return (
    <div className={`${styles.container} justify-center`}>
      <Spinner className="size-12 text-blue-500" />
    </div>
  );
}
