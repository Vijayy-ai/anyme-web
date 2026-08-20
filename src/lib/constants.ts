export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "https://anyme.publicvm.com";

export const APP_LINKS = {
  android:
    process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
    "https://play.google.com/store/apps/details?id=com.snoozeit.anymeapp",
  ios:
    process.env.NEXT_PUBLIC_APP_STORE_URL ??
    "https://apps.apple.com/in/app/anyme-anime-in-microdrama/id6760490198",
};

export const COMMUNITY_LINK =
  "https://chat.whatsapp.com/Lobu9nuBpJfCCtEEBegajl";

export const CONTACT = {
  phones: ["+91 62615 52846", "+91 79882 02631"],
  email: "info@anyme.in",
  location: "Jaipur, Rajasthan, India",
};

export function seriesDeepLink(seriesId: string) {
  return `anyme://series/${seriesId}`;
}

export function episodeDeepLink(seriesId: string, episodeId: string) {
  return `anyme://series/${seriesId}/episode/${episodeId}`;
}
