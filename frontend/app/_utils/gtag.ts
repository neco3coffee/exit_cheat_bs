// utils/gtag.ts
export const event = (action: string, params: Record<string, any>) => {
  if (process.env.NEXT_PUBLIC_ENABLE_GA !== "true") return
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, params);
  }
};
