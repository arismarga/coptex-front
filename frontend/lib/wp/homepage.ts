import {
  getAllStoreProducts,
  getStoreProducts,
  type WooProduct,
} from "@/lib/wp/store";
import { toProxiedMediaUrl } from "@/lib/wp/media";

const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;

if (!WP_BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_WP_BASE_URL in .env.local");
}

type HomepageImage = {
  id?: number | null;
  url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

type HomepageFeaturedSection = {
  enabled?: boolean | null;
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  sourceType?: "category" | "manual" | "random" | null;
  categoryId?: number | null;
  productsCount?: number | null;
  manualIds?: number[] | null;
  manualSkus?: string[] | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
};

type HomepageAboutSection = {
  enabled?: boolean | null;
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  leftImage?: HomepageImage | null;
  rightImage?: HomepageImage | null;
};

type HomepageProductSliderSection = {
  enabled?: boolean | null;
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  sourceType?: "category" | "manual" | "random" | null;
  categoryId?: number | null;
  productsCount?: number | null;
  manualIds?: number[] | null;
  manualSkus?: string[] | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
};

type HomepageCtaSection = {
  enabled?: boolean | null;
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  backgroundImage?: HomepageImage | null;
};

type HomepageSeoSection = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: HomepageImage | null;
};

export type HomepageContent = {
  showSlider?: boolean | null;
  featured?: HomepageFeaturedSection | null;
  about?: HomepageAboutSection | null;
  machines?: HomepageProductSliderSection | null;
  tools?: HomepageProductSliderSection | null;
  cta?: HomepageCtaSection | null;
  seo?: HomepageSeoSection | null;
};

function sanitizeCount(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 8;
  }

  return Math.min(Math.max(Math.floor(value), 4), 24);
}

function normalizeImage(image?: HomepageImage | null): HomepageImage | null {
  if (!image?.url) {
    return null;
  }

  return {
    id: image.id ?? null,
    url: toProxiedMediaUrl(image.url),
    alt: image.alt ?? "",
    width: image.width ?? null,
    height: image.height ?? null,
  };
}

function shuffleProducts(products: WooProduct[]) {
  const nextProducts = [...products];

  for (let index = nextProducts.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextProducts[index], nextProducts[swapIndex]] = [nextProducts[swapIndex], nextProducts[index]];
  }

  return nextProducts;
}

export async function getHomepageContent(): Promise<HomepageContent | null> {
  const response = await fetch(`${WP_BASE_URL}/wp-json/headless/v1/homepage`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch homepage content: ${response.status} ${response.statusText}`);
  }

  const raw = (await response.json()) as HomepageContent;

  return {
    showSlider: raw.showSlider ?? true,
    featured: raw.featured
      ? {
          enabled: raw.featured.enabled ?? false,
          eyebrow: raw.featured.eyebrow ?? "",
          title: raw.featured.title ?? "",
          description: raw.featured.description ?? "",
          sourceType: raw.featured.sourceType ?? "random",
          categoryId: raw.featured.categoryId ?? null,
          productsCount: sanitizeCount(raw.featured.productsCount),
          manualIds: raw.featured.manualIds ?? [],
          manualSkus: raw.featured.manualSkus ?? [],
          buttonLabel: raw.featured.buttonLabel ?? "",
          buttonUrl: raw.featured.buttonUrl ?? "",
        }
      : null,
    about: raw.about
      ? {
          enabled: raw.about.enabled ?? false,
          eyebrow: raw.about.eyebrow ?? "",
          title: raw.about.title ?? "",
          description: raw.about.description ?? "",
          buttonLabel: raw.about.buttonLabel ?? "",
          buttonUrl: raw.about.buttonUrl ?? "",
          leftImage: normalizeImage(raw.about.leftImage),
          rightImage: normalizeImage(raw.about.rightImage),
        }
      : null,
    machines: raw.machines
      ? {
          enabled: raw.machines.enabled ?? false,
          eyebrow: raw.machines.eyebrow ?? "",
          title: raw.machines.title ?? "",
          description: raw.machines.description ?? "",
          sourceType: raw.machines.sourceType ?? "category",
          categoryId: raw.machines.categoryId ?? null,
          productsCount: sanitizeCount(raw.machines.productsCount),
          manualIds: raw.machines.manualIds ?? [],
          manualSkus: raw.machines.manualSkus ?? [],
          buttonLabel: raw.machines.buttonLabel ?? "",
          buttonUrl: raw.machines.buttonUrl ?? "",
        }
      : null,
    tools: raw.tools
      ? {
          enabled: raw.tools.enabled ?? false,
          eyebrow: raw.tools.eyebrow ?? "",
          title: raw.tools.title ?? "",
          description: raw.tools.description ?? "",
          sourceType: raw.tools.sourceType ?? "category",
          categoryId: raw.tools.categoryId ?? null,
          productsCount: sanitizeCount(raw.tools.productsCount),
          manualIds: raw.tools.manualIds ?? [],
          manualSkus: raw.tools.manualSkus ?? [],
          buttonLabel: raw.tools.buttonLabel ?? "",
          buttonUrl: raw.tools.buttonUrl ?? "",
        }
      : null,
    cta: raw.cta
      ? {
          enabled: raw.cta.enabled ?? false,
          eyebrow: raw.cta.eyebrow ?? "",
          title: raw.cta.title ?? "",
          description: raw.cta.description ?? "",
          buttonLabel: raw.cta.buttonLabel ?? "",
          buttonUrl: raw.cta.buttonUrl ?? "",
          backgroundImage: normalizeImage(raw.cta.backgroundImage),
        }
      : null,
    seo: raw.seo
      ? {
          metaTitle: raw.seo.metaTitle ?? "",
          metaDescription: raw.seo.metaDescription ?? "",
          ogImage: normalizeImage(raw.seo.ogImage),
        }
      : null,
  };
}

export async function getHomepageFeaturedProducts(
  featured: HomepageFeaturedSection | null | undefined,
): Promise<WooProduct[]> {
  if (!featured?.enabled) {
    return [];
  }

  const productsCount = sanitizeCount(featured.productsCount);

  if (featured.sourceType === "category" && featured.categoryId) {
    const products = await getStoreProducts({
      category: String(featured.categoryId),
      per_page: String(Math.max(productsCount, 12)),
    });

    return products.slice(0, productsCount);
  }

  const allProducts = await getAllStoreProducts();

  if (featured.sourceType === "manual") {
    const ids = new Set((featured.manualIds ?? []).filter((value) => Number.isInteger(value)));
    const skus = new Set(
      (featured.manualSkus ?? [])
        .map((sku) => sku.trim())
        .filter(Boolean)
        .map((sku) => sku.toLowerCase()),
    );

    const products = allProducts.filter((product) => {
      if (ids.size && ids.has(product.id)) {
        return true;
      }

      return Boolean(product.sku && skus.has(product.sku.toLowerCase()));
    });

    return products.slice(0, productsCount);
  }

  return shuffleProducts(allProducts).slice(0, productsCount);
}

async function getHomepageSliderProducts(
  section: HomepageProductSliderSection | null | undefined,
): Promise<WooProduct[]> {
  if (!section?.enabled) {
    return [];
  }

  const productsCount = sanitizeCount(section.productsCount);

  if (section.sourceType === "category" && section.categoryId) {
    const products = await getStoreProducts({
      category: String(section.categoryId),
      per_page: String(Math.max(productsCount, 12)),
    });

    return products.slice(0, productsCount);
  }

  const allProducts = await getAllStoreProducts();

  if (section.sourceType === "manual") {
    const ids = new Set((section.manualIds ?? []).filter((value) => Number.isInteger(value)));
    const skus = new Set(
      (section.manualSkus ?? [])
        .map((sku) => sku.trim())
        .filter(Boolean)
        .map((sku) => sku.toLowerCase()),
    );

    const products = allProducts.filter((product) => {
      if (ids.size && ids.has(product.id)) {
        return true;
      }

      return Boolean(product.sku && skus.has(product.sku.toLowerCase()));
    });

    return products.slice(0, productsCount);
  }

  return shuffleProducts(allProducts).slice(0, productsCount);
}

export async function getHomepageMachinesProducts(
  machines: HomepageProductSliderSection | null | undefined,
): Promise<WooProduct[]> {
  return getHomepageSliderProducts(machines);
}

export async function getHomepageToolsProducts(
  tools: HomepageProductSliderSection | null | undefined,
): Promise<WooProduct[]> {
  return getHomepageSliderProducts(tools);
}
