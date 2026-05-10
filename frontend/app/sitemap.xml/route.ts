import { getSiteUrl } from "@/lib/site-url";
import { buildSitemapIndexXml } from "@/lib/sitemap";

export async function GET() {
  const siteUrl = getSiteUrl();
  const xml = buildSitemapIndexXml([
    new URL("/pages-sitemap.xml", siteUrl).toString(),
    new URL("/products-sitemap.xml", siteUrl).toString(),
    new URL("/product-categories-sitemap.xml", siteUrl).toString(),
  ]);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

