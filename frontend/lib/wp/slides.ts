import type { Slide, WpSlideResponse } from "./types";
import { toProxiedMediaUrl } from "./media";

const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;

if (!WP_BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_WP_BASE_URL in .env.local");
}

export async function getSlides(): Promise<Slide[]> {
  const url =
    `${WP_BASE_URL}/wp-json/wp/v2/slide` +
    `?per_page=20&orderby=menu_order&order=asc&_embed=1`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch slides: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  return (data as WpSlideResponse[]).map((item): Slide => {
    const title = item?.title?.rendered ?? "";
    const excerptHtml = item?.excerpt?.rendered ?? "";

    const rawImageUrl =
      item?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;

    const imageUrl = rawImageUrl
      ? rawImageUrl
          .replace(/^http:\//, "http://")
          .replace(/^https:\//, "https://")
      : null;

    // ✅ NEW: CTA fields coming from REST top-level fields
    const ctaLabel = item?.cta_label ?? null;
    const ctaUrl = item?.cta_url ?? null;

    // handle boolean or 0/1 or "0"/"1"
    const ctaNewTab = Boolean(item.cta_new_tab);

    return {
      id: item.id,
      title,
      excerptHtml,
      imageUrl: toProxiedMediaUrl(imageUrl),
      ctaLabel,
      ctaUrl,
      ctaNewTab,
    };
  });
}
