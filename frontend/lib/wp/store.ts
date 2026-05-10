import { toProxiedMediaUrl } from "@/lib/wp/media";

const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;

export type WooCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
  permalink: string;
  image: {
    src?: string;
    thumbnail?: string;
    alt?: string;
  } | null;
};

export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  type?: string;
  sku?: string;
  product_pdfs?: Array<{
    url: string;
    title?: string;
    filename?: string;
  }>;
  product_may_also_have?: {
    specs_table_title?: string;
    specs_table?: {
      headings: string[];
      rows: string[][];
    };
  };
  global_unique_id?: string;
  gtin?: string;
  upc?: string;
  ean?: string;
  isbn?: string;
  permalink: string;
  short_description: string;
  description: string;
  images: Array<{
    id: number;
    src: string;
    thumbnail?: string;
    alt?: string;
  }>;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit?: number;
    price_range?: {
      min_amount?: string;
      max_amount?: string;
    } | null;
  };
  price_html: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    link: string;
  }>;
  brands?: Array<{
    id: number;
    name: string;
    slug: string;
    link: string;
  }>;
  attributes?: Array<{
    id: number;
    name: string;
    taxonomy: string;
    has_variations: boolean;
    terms: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
  }>;
  variations?: Array<{
    id: number;
    sku?: string;
    price_html?: string;
    image?: {
      id?: number;
      src?: string;
      thumbnail?: string;
      alt?: string;
    } | null;
    prices?: {
      price: string;
      regular_price: string;
      sale_price: string;
      currency_code: string;
      currency_symbol: string;
      currency_minor_unit?: number;
      price_range?: {
        min_amount?: string;
        max_amount?: string;
      } | null;
    };
    stock_availability?: {
      text?: string;
      class?: string;
    };
    attributes: Array<{
      taxonomy?: string;
      name: string;
      value: string;
      valueLabel?: string;
    }>;
  }>;
  tags?: Array<{
    id: number;
    name: string;
    slug: string;
    link: string;
  }>;
  add_to_cart?: {
    text?: string;
    description?: string;
    url?: string;
    single_text?: string;
    minimum?: number;
    maximum?: number;
    multiple_of?: number;
  };
  stock_availability?: {
    text?: string;
    class?: string;
  };
  has_options?: boolean;
};

export type WooAttribute = {
  id: number;
  name: string;
  taxonomy: string;
  type: string;
  order: string;
  has_archives: boolean;
  count: number;
};

export type WooAttributeTerm = {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
};

function ensureBaseUrl() {
  if (!WP_BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_WP_BASE_URL in .env.local");
  }

  return WP_BASE_URL;
}

type StoreFetchOptions = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

type WpProductSearchFields = {
  id: number;
  slug: string;
  sku?: string;
  headless?: {
    product_pdfs?:
      | Array<{
          url?: string | null;
          title?: string | null;
          filename?: string | null;
        }>
      | null;
    product_may_also_have?: {
      specs_table_title?: string | null;
      specs_table?: {
        headings?: Array<string | null> | null;
        rows?: Array<Array<string | null> | null> | null;
      } | null;
    } | null;
  };
  global_unique_id?: string;
  gtin?: string;
  upc?: string;
  ean?: string;
  isbn?: string;
};

type WpProductHeadlessFields = {
  id: number;
  sku?: string;
  global_unique_id?: string;
  gtin?: string;
  upc?: string;
  ean?: string;
  isbn?: string;
  headless?: {
    product_pdfs?:
      | Array<{
          url?: string | null;
          title?: string | null;
          filename?: string | null;
        }>
      | null;
    product_may_also_have?: {
      specs_table_title?: string | null;
      specs_table?: {
        headings?: Array<string | null> | null;
        rows?: Array<Array<string | null> | null> | null;
      } | null;
    } | null;
    product_variations?: WooProduct["variations"];
  };
};

function buildStoreUrl(path: string, params?: Record<string, string>) {
  const baseUrl = ensureBaseUrl();
  const url = new URL(path, baseUrl);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

async function fetchStoreJson<T>(
  path: string,
  params?: Record<string, string>,
  options?: StoreFetchOptions,
): Promise<T> {
  const res = await fetch(buildStoreUrl(path, params), {
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch store data: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as T;
}

function normalizeCategory(category: WooCategory): WooCategory {
  return {
    ...category,
    image: category.image
      ? {
          ...category.image,
          src: toProxiedMediaUrl(category.image.src) ?? undefined,
          thumbnail: toProxiedMediaUrl(category.image.thumbnail) ?? undefined,
        }
      : null,
  };
}

function normalizeProduct(product: WooProduct): WooProduct {
  return {
    ...product,
    product_pdfs: product.product_pdfs
      ?.map((file) => ({
        ...file,
        url: toProxiedMediaUrl(file.url) ?? file.url,
      }))
      .filter((file) => !!file.url),
    product_may_also_have: product.product_may_also_have
      ? {
          specs_table_title: product.product_may_also_have.specs_table_title ?? "",
          specs_table: product.product_may_also_have.specs_table
            ? {
                headings: product.product_may_also_have.specs_table.headings ?? [],
                rows: product.product_may_also_have.specs_table.rows ?? [],
              }
            : undefined,
        }
      : undefined,
    images: product.images.map((image) => ({
      ...image,
      src: toProxiedMediaUrl(image.src) ?? image.src,
      thumbnail: toProxiedMediaUrl(image.thumbnail) ?? image.thumbnail,
    })),
    variations: product.variations?.map((variation) => ({
      ...variation,
      image: variation.image
        ? {
            ...variation.image,
            src: toProxiedMediaUrl(variation.image.src) ?? variation.image.src,
            thumbnail:
              toProxiedMediaUrl(variation.image.thumbnail) ?? variation.image.thumbnail,
          }
        : variation.image,
    })),
  };
}

export function getWpRelativePath(url: string) {
  const baseUrl = ensureBaseUrl();
  const pathname = new URL(url, baseUrl).pathname;
  return pathname.replace(/\/+$/, "") || "/";
}

export function getFrontendProductPath(product: Pick<WooProduct, "permalink" | "slug">) {
  const wpPath = getWpRelativePath(product.permalink);

  if (wpPath.startsWith("/product/")) {
    return wpPath;
  }

  return `/product/${product.slug}`;
}

function parseMinorUnitAmount(value: string | undefined, minorUnit: number) {
  if (!value) {
    return null;
  }

  const normalized = Number(value);
  if (Number.isNaN(normalized)) {
    return null;
  }

  return normalized / 10 ** minorUnit;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function formatAmount(amount: number, currencyCode: string, currencySymbol: string, minorUnit: number) {
  try {
    return new Intl.NumberFormat("el-GR", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: minorUnit,
      maximumFractionDigits: minorUnit,
    }).format(amount);
  } catch {
    return `${amount.toFixed(minorUnit)} ${currencySymbol}`;
  }
}

export function getProductDisplayPrice(product: Pick<WooProduct, "prices" | "price_html">) {
  const minorUnit = product.prices.currency_minor_unit ?? 2;
  const currencyCode = product.prices.currency_code || "EUR";
  const currencySymbol = product.prices.currency_symbol || "EUR";
  const minRangeAmount = parseMinorUnitAmount(product.prices.price_range?.min_amount, minorUnit);
  const maxRangeAmount = parseMinorUnitAmount(product.prices.price_range?.max_amount, minorUnit);

  if (
    minRangeAmount !== null &&
    maxRangeAmount !== null &&
    Math.abs(minRangeAmount - maxRangeAmount) > Number.EPSILON
  ) {
    return {
      amount: formatAmount(minRangeAmount, currencyCode, currencySymbol, minorUnit),
      isRange: true,
    };
  }

  const singleAmount = parseMinorUnitAmount(product.prices.price, minorUnit);
  if (singleAmount !== null) {
    return {
      amount: formatAmount(singleAmount, currencyCode, currencySymbol, minorUnit),
      isRange: false,
    };
  }

  return {
    amount: stripHtml(product.price_html),
    isRange: /through|range/i.test(product.price_html),
  };
}

export async function getStoreCategories(): Promise<WooCategory[]> {
  const categories = await fetchStoreJson<WooCategory[]>(
    "/wp-json/wc/store/v1/products/categories",
    {
      per_page: "100",
    },
  );

  return categories.map(normalizeCategory);
}

export async function getStoreProducts(
  params?: Record<string, string>,
  options?: StoreFetchOptions,
): Promise<WooProduct[]> {
  const products = await fetchStoreJson<WooProduct[]>(
    "/wp-json/wc/store/v1/products",
    {
      per_page: "100",
      ...params,
    },
    options,
  );

  return products.map(normalizeProduct);
}

export async function getStoreProductsByCategory(categoryId: number): Promise<WooProduct[]> {
  return getStoreProducts({
    category: String(categoryId),
  });
}

function normalizeDecodedValue(value: string) {
  try {
    return decodeURIComponent(value).replace(/\/+$/, "");
  } catch {
    return value.replace(/\/+$/, "");
  }
}

async function getWpProductSearchFields(): Promise<WpProductSearchFields[]> {
  const perPage = 100;
  const allProducts: WpProductSearchFields[] = [];

  for (let page = 1; page < 100; page += 1) {
    const batch = await fetchStoreJson<WpProductSearchFields[]>(
      "/wp-json/wp/v2/product",
      {
        per_page: String(perPage),
        page: String(page),
        _fields: "id,slug,sku,global_unique_id,gtin,upc,ean,isbn,headless",
      },
      {
        next: { revalidate: 300 },
      },
    );

    allProducts.push(...batch);

    if (batch.length < perPage) {
      break;
    }
  }

  return allProducts;
}

async function getWpProductHeadlessFieldsById(productId: number): Promise<WpProductHeadlessFields | null> {
  try {
    return await fetchStoreJson<WpProductHeadlessFields>(
      `/wp-json/wp/v2/product/${productId}`,
      {
        _fields: "id,sku,global_unique_id,gtin,upc,ean,isbn,headless",
      },
      {
        next: { revalidate: 300 },
      },
    );
  } catch {
    return null;
  }
}

function mergeWpFieldsIntoProduct(
  product: WooProduct,
  wpProduct: Pick<
    WpProductHeadlessFields,
    "sku" | "global_unique_id" | "gtin" | "upc" | "ean" | "isbn" | "headless"
  >,
): WooProduct {
  const normalizedPdfFiles =
    wpProduct.headless?.product_pdfs
      ?.map((file) => {
        const url = typeof file.url === "string" ? file.url.trim() : "";

        if (!url) {
          return null;
        }

        return {
          url,
          title: typeof file.title === "string" ? file.title.trim() : "",
          filename: typeof file.filename === "string" ? file.filename.trim() : "",
        };
      })
      .filter((file): file is NonNullable<typeof file> => file !== null) ?? [];

  const normalizedSpecsTableTitle =
    typeof wpProduct.headless?.product_may_also_have?.specs_table_title === "string"
      ? wpProduct.headless.product_may_also_have.specs_table_title.trim()
      : "";

  const normalizedSpecsTableHeadings =
    wpProduct.headless?.product_may_also_have?.specs_table?.headings
      ?.map((heading) => (typeof heading === "string" ? heading.trim() : ""))
      ?? [];

  const normalizedSpecsTableRows =
    wpProduct.headless?.product_may_also_have?.specs_table?.rows
      ?.map((row) =>
        Array.isArray(row)
          ? row.map((cell) => (typeof cell === "string" ? cell.trim() : ""))
          : [],
      )
      .filter((row) => row.some((cell) => cell !== "")) ?? [];

  return normalizeProduct({
    ...product,
    sku: wpProduct.sku || product.sku,
    product_pdfs:
      normalizedPdfFiles.length > 0
        ? normalizedPdfFiles
        : product.product_pdfs,
    product_may_also_have:
      normalizedSpecsTableTitle || normalizedSpecsTableHeadings.length || normalizedSpecsTableRows.length
        ? {
            specs_table_title: normalizedSpecsTableTitle,
            specs_table: {
              headings: normalizedSpecsTableHeadings,
              rows: normalizedSpecsTableRows,
            },
          }
        : product.product_may_also_have,
    global_unique_id: wpProduct.global_unique_id || product.global_unique_id,
    gtin: wpProduct.gtin || product.gtin,
    upc: wpProduct.upc || product.upc,
    ean: wpProduct.ean || product.ean,
    isbn: wpProduct.isbn || product.isbn,
    variations:
      wpProduct.headless?.product_variations && wpProduct.headless.product_variations.length
        ? wpProduct.headless.product_variations
        : product.variations,
  });
}

let cachedAllProducts:
  | {
      expiresAt: number;
      products: WooProduct[];
    }
  | null = null;

export async function getAllStoreProducts(): Promise<WooProduct[]> {
  const now = Date.now();
  if (cachedAllProducts && cachedAllProducts.expiresAt > now) {
    return cachedAllProducts.products;
  }

  const perPage = 100;
  const allProducts: WooProduct[] = [];

  for (let page = 1; page < 100; page += 1) {
    const batch = await getStoreProducts(
      {
        per_page: String(perPage),
        page: String(page),
      },
      {
        next: { revalidate: 300 },
      },
    );

    allProducts.push(...batch);

    if (batch.length < perPage) {
      break;
    }
  }

  const wpProducts = await getWpProductSearchFields();
  const wpProductsById = new Map(wpProducts.map((product) => [product.id, product]));

  const mergedProducts = allProducts.map((product) => {
    const wpProduct = wpProductsById.get(product.id);

    if (!wpProduct) {
      return product;
    }

    return mergeWpFieldsIntoProduct(product, wpProduct);
  });

  cachedAllProducts = {
    expiresAt: now + 5 * 60 * 1000,
    products: mergedProducts,
  };

  return mergedProducts;
}

export async function getStoreProductBySlugPath(slugPath: string[]): Promise<WooProduct | null> {
  const products = await getAllStoreProducts();
  const requestedPath = normalizeDecodedValue(`/product/${slugPath.join("/")}`);
  const requestedSlug = normalizeDecodedValue(slugPath[slugPath.length - 1] ?? "");

  const matchedProduct =
    products.find(
      (product) => normalizeDecodedValue(getWpRelativePath(product.permalink)) === requestedPath,
    ) ?? products.find((product) => normalizeDecodedValue(product.slug) === requestedSlug) ?? null;

  if (!matchedProduct) {
    return null;
  }

  const wpProduct = await getWpProductHeadlessFieldsById(matchedProduct.id);
  if (!wpProduct) {
    return matchedProduct;
  }

  return mergeWpFieldsIntoProduct(matchedProduct, wpProduct);
}

export async function getStoreAttributes(): Promise<WooAttribute[]> {
  return fetchStoreJson<WooAttribute[]>("/wp-json/wc/store/v1/products/attributes");
}

export async function getStoreAttributeTerms(attributeId: number): Promise<WooAttributeTerm[]> {
  return fetchStoreJson<WooAttributeTerm[]>(
    `/wp-json/wc/store/v1/products/attributes/${attributeId}/terms`,
    {
      per_page: "50",
    },
  );
}
