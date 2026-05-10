import { toProxiedMediaUrl } from "@/lib/wp/media";

const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;
const WP_SITE_SETTINGS_ENDPOINT =
  process.env.NEXT_PUBLIC_WP_SITE_SETTINGS_ENDPOINT ?? "/wp-json/headless/v1/site-settings";

export type SiteLogo = {
  id?: number | null;
  url?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
};

export type SiteIcon = {
  id?: number | null;
  url?: string | null;
  url32?: string | null;
  url192?: string | null;
  url512?: string | null;
};

export type SiteSettings = {
  name?: string | null;
  logo?: SiteLogo | null;
  siteIcon?: SiteIcon | null;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!WP_BASE_URL) {
    return null;
  }

  const response = await fetch(new URL(WP_SITE_SETTINGS_ENDPOINT, WP_BASE_URL), {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as SiteSettings;

  return {
    name: payload.name ?? "Coptex Hellas",
    logo: payload.logo
      ? {
          id: payload.logo.id ?? null,
          url: toProxiedMediaUrl(payload.logo.url ?? null),
          width: payload.logo.width ?? null,
          height: payload.logo.height ?? null,
          alt: payload.logo.alt ?? "",
        }
      : null,
    siteIcon: payload.siteIcon
      ? {
          id: payload.siteIcon.id ?? null,
          url: toProxiedMediaUrl(payload.siteIcon.url ?? null),
          url32: toProxiedMediaUrl(payload.siteIcon.url32 ?? null),
          url192: toProxiedMediaUrl(payload.siteIcon.url192 ?? null),
          url512: toProxiedMediaUrl(payload.siteIcon.url512 ?? null),
        }
      : null,
  };
}
