import { proxifyHtmlMediaUrls, toProxiedMediaUrl } from "@/lib/wp/media";

const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;

type AboutImage = {
  id?: number | null;
  url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

type AboutStatItem = {
  number?: string | null;
  suffix?: string | null;
  label?: string | null;
  description?: string | null;
};

type AboutExpertiseItem = {
  title?: string | null;
  description?: string | null;
  iconName?: string | null;
};

type AboutSectionBase = {
  enabled?: boolean | null;
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
};

type AboutHeroSection = AboutSectionBase & {
  highlight?: string | null;
  primaryButtonLabel?: string | null;
  primaryButtonUrl?: string | null;
  secondaryButtonLabel?: string | null;
  secondaryButtonUrl?: string | null;
  badge?: string | null;
  image?: AboutImage | null;
};

type AboutStorySection = {
  enabled?: boolean | null;
  eyebrow?: string | null;
  title?: string | null;
  content?: string | null;
  imageLeft?: AboutImage | null;
  imageRight?: AboutImage | null;
};

type AboutStatsSection = AboutSectionBase & {
  items?: AboutStatItem[] | null;
};

type AboutExpertiseSection = AboutSectionBase & {
  items?: AboutExpertiseItem[] | null;
};

type AboutShowcaseSection = AboutSectionBase & {
  images?: AboutImage[] | null;
};

type AboutContactSection = AboutSectionBase & {
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  workingHours?: string | null;
  mapEmbedUrl?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
};

export type AboutPageContent = {
  title: string;
  slug: string;
  hero: AboutHeroSection;
  story: AboutStorySection;
  stats: AboutStatsSection;
  expertise: AboutExpertiseSection;
  showcase: AboutShowcaseSection;
  contact: AboutContactSection;
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: AboutImage | null;
  };
};

type AboutPageResponse = {
  title?: string | null;
  slug?: string | null;
  hero?: AboutHeroSection | null;
  story?: AboutStorySection | null;
  stats?: AboutStatsSection | null;
  expertise?: AboutExpertiseSection | null;
  showcase?: AboutShowcaseSection | null;
  contact?: AboutContactSection | null;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    ogImage?: AboutImage | null;
  } | null;
};

function normalizeImage(image?: AboutImage | null): AboutImage | null {
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

function compactStats(items?: AboutStatItem[] | null) {
  return (items ?? []).filter((item) => item?.number || item?.label || item?.description);
}

function compactExpertise(items?: AboutExpertiseItem[] | null) {
  return (items ?? []).filter((item) => item?.title || item?.description);
}

function compactImages(images?: AboutImage[] | null) {
  return (images ?? []).map(normalizeImage).filter(Boolean) as AboutImage[];
}

export async function getAboutPageContent(): Promise<AboutPageContent | null> {
  if (!WP_BASE_URL) {
    return null;
  }

  const response = await fetch(`${WP_BASE_URL}/wp-json/headless/v1/about-page`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch about page content: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as AboutPageResponse;

  return {
    title: payload.title ?? "Σχετικά με εμάς",
    slug: payload.slug ?? "sxetika-me-emas",
    hero: {
      enabled: payload.hero?.enabled ?? true,
      eyebrow: payload.hero?.eyebrow ?? "",
      title: payload.hero?.title ?? "",
      highlight: payload.hero?.highlight ?? "",
      description: payload.hero?.description ?? "",
      primaryButtonLabel: payload.hero?.primaryButtonLabel ?? "",
      primaryButtonUrl: payload.hero?.primaryButtonUrl ?? "",
      secondaryButtonLabel: payload.hero?.secondaryButtonLabel ?? "",
      secondaryButtonUrl: payload.hero?.secondaryButtonUrl ?? "",
      badge: payload.hero?.badge ?? "",
      image: normalizeImage(payload.hero?.image),
    },
    story: {
      enabled: payload.story?.enabled ?? true,
      eyebrow: payload.story?.eyebrow ?? "",
      title: payload.story?.title ?? "",
      content: proxifyHtmlMediaUrls(payload.story?.content ?? ""),
      imageLeft: normalizeImage(payload.story?.imageLeft),
      imageRight: normalizeImage(payload.story?.imageRight),
    },
    stats: {
      enabled: payload.stats?.enabled ?? true,
      eyebrow: payload.stats?.eyebrow ?? "",
      title: payload.stats?.title ?? "",
      description: payload.stats?.description ?? "",
      items: compactStats(payload.stats?.items),
    },
    expertise: {
      enabled: payload.expertise?.enabled ?? true,
      eyebrow: payload.expertise?.eyebrow ?? "",
      title: payload.expertise?.title ?? "",
      description: payload.expertise?.description ?? "",
      items: compactExpertise(payload.expertise?.items),
    },
    showcase: {
      enabled: payload.showcase?.enabled ?? true,
      eyebrow: payload.showcase?.eyebrow ?? "",
      title: payload.showcase?.title ?? "",
      description: payload.showcase?.description ?? "",
      images: compactImages(payload.showcase?.images),
    },
    contact: {
      enabled: payload.contact?.enabled ?? true,
      eyebrow: payload.contact?.eyebrow ?? "",
      title: payload.contact?.title ?? "",
      description: payload.contact?.description ?? "",
      phone: payload.contact?.phone ?? "",
      email: payload.contact?.email ?? "",
      address: payload.contact?.address ?? "",
      workingHours: payload.contact?.workingHours ?? "",
      mapEmbedUrl: payload.contact?.mapEmbedUrl ?? "",
      buttonLabel: payload.contact?.buttonLabel ?? "",
      buttonUrl: payload.contact?.buttonUrl ?? "",
    },
    seo: {
      metaTitle: payload.seo?.metaTitle ?? "",
      metaDescription: payload.seo?.metaDescription ?? "",
      ogImage: normalizeImage(payload.seo?.ogImage),
    },
  };
}
