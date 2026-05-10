const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;

export function toProxiedMediaUrl(rawUrl?: string | null) {
  if (!rawUrl) {
    return null;
  }

  if (rawUrl.startsWith("/api/media?src=")) {
    return rawUrl;
  }

  try {
    const baseUrl = WP_BASE_URL ? new URL(WP_BASE_URL) : null;
    const parsedUrl = new URL(rawUrl, WP_BASE_URL ?? undefined);

    if (parsedUrl.pathname === "/api/media" && parsedUrl.searchParams.has("src")) {
      return rawUrl;
    }

    if (baseUrl && parsedUrl.origin !== baseUrl.origin) {
      return rawUrl;
    }

    return `/api/media?src=${encodeURIComponent(parsedUrl.toString())}`;
  } catch {
    return rawUrl;
  }
}

export function proxifyHtmlMediaUrls(html?: string | null) {
  if (!html) {
    return "";
  }

  return html.replace(
    /\b(src|href)=("([^"]*)"|'([^']*)')/gi,
    (match, attribute, quotedValue, doubleQuotedValue, singleQuotedValue) => {
      const rawUrl = doubleQuotedValue ?? singleQuotedValue ?? "";
      const proxiedUrl = toProxiedMediaUrl(rawUrl);

      if (!proxiedUrl || proxiedUrl === rawUrl) {
        return match;
      }

      const quote = quotedValue.startsWith('"') ? '"' : "'";
      return `${attribute}=${quote}${proxiedUrl}${quote}`;
    },
  );
}
