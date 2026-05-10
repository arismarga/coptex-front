import { getAllStoreProducts, type WooProduct } from "@/lib/wp/store";

export type ProductSearchResult = {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  products: WooProduct[];
};

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (match, code) => {
      const parsed = Number.parseInt(code, 10);
      return Number.isNaN(parsed) ? match : String.fromCodePoint(parsed);
    })
    .replace(/&#x([0-9a-f]+);/gi, (match, code) => {
      const parsed = Number.parseInt(code, 16);
      return Number.isNaN(parsed) ? match : String.fromCodePoint(parsed);
    });
}

function stripHtml(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function normalizeSearchValue(value: string) {
  return stripHtml(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ς/g, "σ")
    .toLocaleLowerCase("el-GR")
    .replace(/[^\p{L}\p{N}\s/-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalizeSearchValue(value).split(" ").filter(Boolean);
}

function fieldIncludesAllTokens(field: string, tokens: string[]) {
  return tokens.every((token) => field.includes(token));
}

function fieldHasTokenPrefixes(field: string, tokens: string[]) {
  const words = field.split(" ").filter(Boolean);
  return tokens.every((token) => words.some((word) => word.startsWith(token)));
}

function scoreProduct(product: WooProduct, query: string, tokens: string[]) {
  const name = normalizeSearchValue(product.name);
  const sku = normalizeSearchValue(product.sku ?? "");
  const identifiers = [
    product.global_unique_id,
    product.gtin,
    product.upc,
    product.ean,
    product.isbn,
  ]
    .map((value) => normalizeSearchValue(value ?? ""))
    .filter(Boolean);
  const description = normalizeSearchValue(
    `${product.short_description ?? ""} ${product.description ?? ""}`,
  );
  const categories = normalizeSearchValue(
    product.categories.map((category) => category.name).join(" "),
  );

  let score = 0;

  if (sku) {
    if (sku === query) score += 3000;
    else if (sku.startsWith(query)) score += 2200;
    else if (sku.includes(query)) score += 1500;
  }

  identifiers.forEach((identifier) => {
    if (identifier === query) score += 2800;
    else if (identifier.startsWith(query)) score += 2100;
    else if (identifier.includes(query)) score += 1450;
  });

  if (name === query) score += 2600;
  else if (name.startsWith(query)) score += 2000;
  else if (name.includes(query)) score += 1400;

  if (fieldHasTokenPrefixes(name, tokens)) score += 1200;
  if (fieldIncludesAllTokens(name, tokens)) score += 1100;
  if (fieldIncludesAllTokens(categories, tokens)) score += 500;
  if (fieldIncludesAllTokens(description, tokens)) score += 350;

  if (!score && tokens.some((token) => description.includes(token))) {
    score += 120;
  }

  return score;
}

export function normalizeProductSearchQuery(value: string) {
  return normalizeSearchValue(value);
}

export async function searchProducts(
  rawQuery: string,
  options?: {
    limit?: number;
    page?: number;
  },
): Promise<ProductSearchResult> {
  const normalizedQuery = normalizeSearchValue(rawQuery);
  const tokens = tokenize(rawQuery);
  const limit = options?.limit ?? 22;
  const page = Math.max(1, options?.page ?? 1);

  if (!normalizedQuery || tokens.length === 0) {
    return {
      total: 0,
      totalPages: 0,
      page,
      limit,
      products: [],
    };
  }

  const products = await getAllStoreProducts();
  const rankedProducts = products
    .map((product) => ({
      product,
      score: scoreProduct(product, normalizedQuery, tokens),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.product.name.localeCompare(b.product.name, "el-GR");
    });

  const total = rankedProducts.length;
  const totalPages = total ? Math.ceil(total / limit) : 0;
  const startIndex = (page - 1) * limit;

  return {
    total,
    totalPages,
    page,
    limit,
    products: rankedProducts.slice(startIndex, startIndex + limit).map((item) => item.product),
  };
}
