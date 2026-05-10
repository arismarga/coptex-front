import {
  getAllStoreProducts,
  getStoreCategories,
  getWpRelativePath,
} from "@/lib/wp/store";
import { getSiteUrl } from "@/lib/site-url";

type SitemapEntry = {
  loc: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: number;
};

function buildAbsoluteUrl(pathname: string) {
  const siteUrl = getSiteUrl();
  return new URL(pathname, siteUrl).toString();
}

export function buildSitemapXml(entries: SitemapEntry[]) {
  const body = entries
    .map((entry) => {
      const parts = [
        `<url><loc>${entry.loc}</loc>`,
        entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : "",
        typeof entry.priority === "number" ? `<priority>${entry.priority}</priority>` : "",
        "</url>",
      ];

      return parts.join("");
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

export function buildSitemapIndexXml(urls: string[]) {
  const body = urls
    .map((url) => `<sitemap><loc>${url}</loc></sitemap>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}

export function getPagesSitemapEntries(): SitemapEntry[] {
  return [
    {
      loc: buildAbsoluteUrl("/"),
      changefreq: "weekly",
      priority: 1,
    },
    {
      loc: buildAbsoluteUrl("/shop"),
      changefreq: "daily",
      priority: 0.9,
    },
    {
      loc: buildAbsoluteUrl("/sxetika-me-emas"),
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      loc: buildAbsoluteUrl("/epikoinwnia"),
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      loc: buildAbsoluteUrl("/politiki-aporritou"),
      changefreq: "yearly",
      priority: 0.3,
    },
  ];
}

export async function getProductCategoriesSitemapEntries(): Promise<SitemapEntry[]> {
  const categories = await getStoreCategories();

  return categories.map((category) => ({
    loc: buildAbsoluteUrl(getWpRelativePath(category.permalink)),
    changefreq: "weekly",
    priority: 0.8,
  }));
}

export async function getProductsSitemapEntries(): Promise<SitemapEntry[]> {
  const products = await getAllStoreProducts();

  return products.map((product) => ({
    loc: buildAbsoluteUrl(getWpRelativePath(product.permalink)),
    changefreq: "weekly",
    priority: 0.7,
  }));
}
