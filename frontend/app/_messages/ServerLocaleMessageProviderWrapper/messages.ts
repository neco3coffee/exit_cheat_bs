const messagesCache: Record<string, any> = {};

export async function loadMessages(locale: string) {
  if (!messagesCache[locale]) {
    messagesCache[locale] = (
      await import(`@/app/_messages/${locale}.json`)
    ).default;
  }
  return messagesCache[locale];
}
