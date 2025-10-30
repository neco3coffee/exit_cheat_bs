"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./page.module.scss";

// biome-ignore-start lint/suspicious/useIterableCallbackReturn: disable biome
export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // bodyスクロールを止める
    // document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      try {
        // すでに open の場合は二重呼び出しエラーになるので無視
        if (dialog && dialog.isConnected && !dialog.open) dialog.showModal();
      } catch (e) {
        console.warn("Dialog already open:", e);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      // document.body.style.overflow = "";
      try {
        if (dialog && dialog.open) dialog.close();
      } catch {}
      // 手動canvas除去もそのまま
      document
        .querySelectorAll('canvas[popover="manual"]')
        .forEach((el) => el.remove());
    };
  }, []);

  const onDismiss = () => {
    try {
      dialogRef.current?.close();
    } catch {}
    router.back();
    // document.body.style.overflow = "";
    document
      .querySelectorAll('canvas[popover="manual"]')
      .forEach((el) => el.remove());
  };

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  return createPortal(
    <dialog ref={dialogRef} className={styles.modal} key="map-modal">
      {children}
      <button
        className={styles.closeBackground}
        onClick={onDismiss}
        type="button"
      ></button>
    </dialog>,
    modalRoot,
  );
}
// biome-ignore-end lint/suspicious/useIterableCallbackReturn: disable biome
