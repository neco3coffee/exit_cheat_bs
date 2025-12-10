import { cacheLife } from "next/cache";
import { Spinner } from "@/components/ui/spinner";
import styles from "./index.module.scss";

export default function Loading() {
  return (
    <div className={`${styles.container} justify-center`}>
      <Spinner className="size-12 text-blue-500" />
    </div>
  );
}
