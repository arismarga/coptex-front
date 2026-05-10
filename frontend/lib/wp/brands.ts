import { toProxiedMediaUrl } from "@/lib/wp/media";

const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;

if (!WP_BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_WP_BASE_URL in .env.local");
}

export type BrandItem = {
  id: number;
  name: string;
  slug: string;
  image?: {
    url?: string | null;
    alt?: string | null;
  } | null;
};

export async function getBrands(): Promise<BrandItem[]> {
  const response = await fetch(`${WP_BASE_URL}/wp-json/headless/v1/brands`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch brands: ${response.status} ${response.statusText}`);
  }

  const brands = (await response.json()) as BrandItem[];

  return brands
    .filter((brand) => brand.name)
    .map((brand) => ({
      ...brand,
      image: brand.image?.url
        ? {
            url: toProxiedMediaUrl(brand.image.url),
            alt: brand.image.alt ?? brand.name,
          }
        : null,
    }));
}
