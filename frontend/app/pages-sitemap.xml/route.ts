import { buildSitemapXml, getPagesSitemapEntries } from "@/lib/sitemap";

export async function GET() {
  const xml = buildSitemapXml(getPagesSitemapEntries());

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

