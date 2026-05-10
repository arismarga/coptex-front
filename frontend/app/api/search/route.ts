import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/wp/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const limitValue = Number.parseInt(searchParams.get("limit") ?? "4", 10);
  const limit = Number.isNaN(limitValue) ? 4 : Math.min(Math.max(limitValue, 1), 12);

  if (query.length < 2) {
    return NextResponse.json({
      total: 0,
      products: [],
    });
  }

  const results = await searchProducts(query, {
    limit,
    page: 1,
  });

  return NextResponse.json({
    total: results.total,
    products: results.products,
  });
}
