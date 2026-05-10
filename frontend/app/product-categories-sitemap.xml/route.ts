import { buildSitemapXml, getProductCategoriesSitemapEntries } from "@/lib/sitemap";

export async function GET() {
  const xml = buildSitemapXml(await getProductCategoriesSitemapEntries());

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
