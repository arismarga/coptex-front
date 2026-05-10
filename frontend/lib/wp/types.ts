export type Slide = {
  id: number;
  title: string;
  excerptHtml: string;
  imageUrl: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  ctaNewTab?: boolean | null;
}

export type WpSlideResponse = {
  id: number;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url?: string }>;
  };

  // ✅ NEW fields from register_rest_field
  cta_label?: string | null;
  cta_url?: string | null;
  cta_new_tab?: boolean | number | string | null;
};