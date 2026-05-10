import { proxifyHtmlMediaUrls } from "@/lib/wp/media";

const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;

type LegalPageResponse = {
  title?: string | null;
  slug?: string | null;
  content?: string | null;
};

export type LegalPageContent = {
  title: string;
  slug: string;
  content: string;
};

export async function getLegalPageContent(slug: string): Promise<LegalPageContent | null> {
  if (!WP_BASE_URL) {
    return null;
  }

  const response = await fetch(`${WP_BASE_URL}/wp-json/headless/v1/legal-page?slug=${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch legal page content: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as LegalPageResponse;

  return {
    title: payload.title ?? "",
    slug: payload.slug ?? slug,
    content: proxifyHtmlMediaUrls(payload.content ?? ""),
  };
}
