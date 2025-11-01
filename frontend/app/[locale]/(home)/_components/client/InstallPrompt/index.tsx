"use client";

import { SquarePlus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream,
    );

    setIsAndroid(/Android/.test(navigator.userAgent));

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    // Android PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    setDeferredPrompt(null);
  };

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <>
      {isIOS && (
        <Sheet>
          <SheetTrigger>
            <SquarePlus size={24} aria-label="plus icon" className="" />
          </SheetTrigger>
          <SheetContent
            side="top"
            className="h-[80%] w-full border-none flex justify-center items-center"
            style={{ paddingTop: "100px" }}
          >
            <SheetTitle className="text-2xl mb-4">Install SafeBrawl</SheetTitle>
            <video
              src="/add_to_home.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{ width: "auto", height: "100%", borderRadius: "16px" }}
            />
          </SheetContent>
        </Sheet>
      )}
      {isAndroid && deferredPrompt && (
        <button
          onClick={handleInstallClick}
          className=""
          aria-label="Install app"
          type="button"
        >
          <SquarePlus size={24} />
        </button>
      )}
    </>
  );
}
