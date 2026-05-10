import { buildSitemapXml, getProductsSitemapEntries } from "@/lib/sitemap";

export async function GET() {
  const xml = buildSitemapXml(await getProductsSitemapEntries());

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

