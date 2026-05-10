import { proxifyHtmlMediaUrls } from "@/lib/wp/media";

const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;
const WP_FOOTER_ENDPOINT =
  process.env.NEXT_PUBLIC_WP_FOOTER_ENDPOINT ?? "/wp-json/sidebars/v1/footer";

export type FooterSidebar = {
  id: string;
  html: string;
};

type FooterPayload =
  | FooterSidebar[]
  | {
      sidebars?: FooterSidebar[];
      items?: FooterSidebar[];
      [key: string]: unknown;
    };

function normalizeFooterPayload(payload: FooterPayload | null): FooterSidebar[] {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload.map((sidebar) => ({
      ...sidebar,
      html: proxifyHtmlMediaUrls(sidebar.html),
    }));
  }

  if (Array.isArray(payload.sidebars)) {
    return payload.sidebars.map((sidebar) => ({
      ...sidebar,
      html: proxifyHtmlMediaUrls(sidebar.html),
    }));
  }

  if (Array.isArray(payload.items)) {
    return payload.items.map((sidebar) => ({
      ...sidebar,
      html: proxifyHtmlMediaUrls(sidebar.html),
    }));
  }

  const mapped = Object.entries(payload)
    .filter(([key, value]) => key.startsWith("footer-") && typeof value === "string")
    .map(([id, html]) => ({
      id,
      html: proxifyHtmlMediaUrls(html),
    }));

  return mapped;
}

export async function getFooterSidebars(): Promise<FooterSidebar[]> {
  if (!WP_BASE_URL) {
    return [];
  }

  const response = await fetch(new URL(WP_FOOTER_ENDPOINT, WP_BASE_URL), {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as FooterPayload;
  return normalizeFooterPayload(payload);
}
