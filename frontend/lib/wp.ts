export type Slide = {
  id: number;
  title: string;
  excerpt: string;
  imageUrl: string | null;
};

type WpSlideItem = {
  id: number;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url?: string }>;
  };
};

const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;

if (!WP_BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_WP_BASE_URL in .env.local");
}

export async function getSlides(): Promise<Slide[]> {
  const url = `${WP_BASE_URL}/wp-json/wp/v2/slide?per_page=20&orderby=menu_order&order=asc&_embed=1`;

  const res = await fetch(url, {
    // In dev, we don't want Next caching to confuse us
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch slides: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as WpSlideItem[];

  return data.map((item) => {
    const title = item?.title?.rendered ?? "";
    const excerpt = item?.excerpt?.rendered ?? "";
    const imageUrl =
      item?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;

    return {
      id: item.id,
      title,
      excerpt,
      imageUrl,
    };
  });
}
