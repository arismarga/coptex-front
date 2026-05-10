import { NextRequest, NextResponse } from "next/server";

const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;

function isAllowedMediaUrl(src: string) {
  if (!WP_BASE_URL) {
    return false;
  }

  try {
    const baseUrl = new URL(WP_BASE_URL);
    const mediaUrl = new URL(src);
    return mediaUrl.origin === baseUrl.origin;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");

  if (!src || !isAllowedMediaUrl(src)) {
    return new NextResponse("Invalid media source", { status: 400 });
  }

  const upstreamResponse = await fetch(src, {
    cache: "no-store",
  });

  if (!upstreamResponse.ok) {
    return new NextResponse("Media not found", { status: upstreamResponse.status });
  }

  const headers = new Headers();
  const contentType = upstreamResponse.headers.get("content-type");
  const cacheControl = upstreamResponse.headers.get("cache-control");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  headers.set("cache-control", cacheControl || "public, max-age=3600, s-maxage=3600");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

  return new NextResponse(upstreamResponse.body, {
    status: 200,
    headers,
  });
}
