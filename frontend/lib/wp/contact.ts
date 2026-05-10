const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;

type ContactSeoImage = {
  id?: number | null;
  url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

type ContactHeroGroup = {
  enabled?: boolean | null;
  contact_hero_eyebrow?: string | null;
  contact_hero_title?: string | null;
  contact_hero_description?: string | null;
};

type ContactDetailsGroup = {
  enabled?: boolean | null;
  contact_address_label?: string | null;
  contact_address_value?: string | null;
  contact_email_label?: string | null;
  contact_email_value?: string | null;
  contact_phone_label?: string | null;
  contact_phone_value?: string | null;
  contact_support_block_1_title?: string | null;
  contact_support_block_1_text?: string | null;
  contact_support_block_2_title?: string | null;
  contact_support_block_2_text?: string | null;
  contact_support_block_3_title?: string | null;
  contact_support_block_3_text?: string | null;
};

type ContactFormGroup = {
  enabled?: boolean | null;
  contact_form_title?: string | null;
  contact_form_description?: string | null;
  contact_form_shortcode?: string | null;
  contact_form_html?: string | null;
};

type ContactMapGroup = {
  enabled?: boolean | null;
  contact_map_embed?: string | null;
  contact_location_title?: string | null;
  contact_location_description?: string | null;
};

type ContactSupportBlock = {
  title: string;
  text: string;
};

type ContactSeo = {
  metaTitle: string;
  metaDescription: string;
  ogImage: ContactSeoImage | null;
};

export type ContactPageContent = {
  hero: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    description: string;
  };
  details: {
    enabled: boolean;
    addressLabel: string;
    addressValue: string;
    emailLabel: string;
    emailValue: string;
    phoneLabel: string;
    phoneValue: string;
    supportBlocks: ContactSupportBlock[];
  };
  form: {
    enabled: boolean;
    title: string;
    description: string;
    shortcode: string;
    html: string;
  };
  map: {
    enabled: boolean;
    embed: string;
    locationTitle: string;
    locationDescription: string;
  };
  seo: ContactSeo;
};

type ContactResponse = {
  hero?: ContactHeroGroup | null;
  details?: ContactDetailsGroup | null;
  form?: ContactFormGroup | null;
  map?: ContactMapGroup | null;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    ogImage?: ContactSeoImage | null;
  } | null;
};

function normalizeImage(image?: ContactSeoImage | null): ContactSeoImage | null {
  if (!image?.url) {
    return null;
  }

  return {
    id: image.id ?? null,
    url: image.url,
    alt: image.alt ?? "",
    width: image.width ?? null,
    height: image.height ?? null,
  };
}

function buildSupportBlocks(details?: ContactDetailsGroup | null): ContactSupportBlock[] {
  const blocks = [
    {
      title: details?.contact_support_block_1_title ?? "",
      text: details?.contact_support_block_1_text ?? "",
    },
    {
      title: details?.contact_support_block_2_title ?? "",
      text: details?.contact_support_block_2_text ?? "",
    },
    {
      title: details?.contact_support_block_3_title ?? "",
      text: details?.contact_support_block_3_text ?? "",
    },
  ];

  return blocks.filter((block) => block.title || block.text);
}

export async function getContactPageContent(): Promise<ContactPageContent | null> {
  if (!WP_BASE_URL) {
    return null;
  }

  const response = await fetch(`${WP_BASE_URL}/wp-json/headless/v1/contact-page`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch contact page content: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as ContactResponse;

  return {
    hero: {
      enabled: payload.hero?.enabled ?? true,
      eyebrow: payload.hero?.contact_hero_eyebrow ?? "",
      title: payload.hero?.contact_hero_title ?? "",
      description: payload.hero?.contact_hero_description ?? "",
    },
    details: {
      enabled: payload.details?.enabled ?? true,
      addressLabel: payload.details?.contact_address_label ?? "Διεύθυνση",
      addressValue: payload.details?.contact_address_value ?? "",
      emailLabel: payload.details?.contact_email_label ?? "Email",
      emailValue: payload.details?.contact_email_value ?? "",
      phoneLabel: payload.details?.contact_phone_label ?? "Τηλέφωνο",
      phoneValue: payload.details?.contact_phone_value ?? "",
      supportBlocks: buildSupportBlocks(payload.details),
    },
    form: {
      enabled: payload.form?.enabled ?? true,
      title: payload.form?.contact_form_title ?? "",
      description: payload.form?.contact_form_description ?? "",
      shortcode: payload.form?.contact_form_shortcode ?? "",
      html: payload.form?.contact_form_html ?? "",
    },
    map: {
      enabled: payload.map?.enabled ?? true,
      embed: payload.map?.contact_map_embed ?? "",
      locationTitle: payload.map?.contact_location_title ?? "",
      locationDescription: payload.map?.contact_location_description ?? "",
    },
    seo: {
      metaTitle: payload.seo?.metaTitle ?? "",
      metaDescription: payload.seo?.metaDescription ?? "",
      ogImage: normalizeImage(payload.seo?.ogImage),
    },
  };
}
