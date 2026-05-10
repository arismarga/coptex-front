import type { NavItem } from "@/components/header/NavLinks";

const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;
const WP_MENU_ENDPOINT =
  process.env.NEXT_PUBLIC_WP_MENU_ENDPOINT ?? "/wp-json/menus/v1/menus/main_menu";
const WP_NAVIGATION_ENDPOINT =
  process.env.NEXT_PUBLIC_WP_NAVIGATION_ENDPOINT ??
  "/wp-json/wp/v2/navigation?status=publish&per_page=100";
const WP_NAVIGATION_SLUG = process.env.NEXT_PUBLIC_WP_NAVIGATION_SLUG;

type WpMenuNode = {
  id?: number | string;
  url?: string;
  link?: string;
  path?: string;
  title?: string;
  label?: string;
  name?: string;
  child_items?: WpMenuNode[];
  children?: WpMenuNode[];
};

type WpMenuResponse =
  | WpMenuNode[]
  | {
      items?: WpMenuNode[];
      data?: WpMenuNode[];
    };

type WpNavigationNode = {
  id: number;
  slug?: string;
  title?: {
    rendered?: string;
  };
  content?: {
    rendered?: string;
  };
};

function normalizeHref(rawHref?: string | null) {
  if (!rawHref) return "/";

  try {
    if (rawHref.startsWith("/")) {
      return rawHref;
    }

    if (!WP_BASE_URL) {
      return rawHref;
    }

    const parsed = new URL(rawHref, WP_BASE_URL);
    const base = new URL(WP_BASE_URL);

    if (parsed.origin === base.origin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
    }

    return rawHref;
  } catch {
    return rawHref;
  }
}

function mapMenuNode(node: WpMenuNode): NavItem | null {
  const label = decodeHtmlEntities(node.label ?? node.title ?? node.name ?? "");
  const href = normalizeHref(node.path ?? node.url ?? node.link);

  if (!label) return null;

  const childNodes = node.child_items ?? node.children ?? [];
  const children = childNodes
    .map(mapMenuNode)
    .filter((item): item is NavItem => item !== null);

  return {
    href,
    label,
    ...(children.length ? { children } : {}),
  };
}

function extractMenuNodes(payload: WpMenuResponse): WpMenuNode[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (match, code) => {
      const parsed = Number.parseInt(code, 10);
      return Number.isNaN(parsed) ? match : String.fromCodePoint(parsed);
    })
    .replace(/&#x([0-9a-f]+);/gi, (match, code) => {
      const parsed = Number.parseInt(code, 16);
      return Number.isNaN(parsed) ? match : String.fromCodePoint(parsed);
    });
}

function stripTags(value: string) {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function readAttribute(tag: string, attribute: string) {
  const match = tag.match(
    new RegExp(`${attribute}\\s*=\\s*(['"])(.*?)\\1`, "i"),
  );

  return match?.[2];
}

function extractLiBlock(html: string, startIndex: number) {
  let depth = 0;

  for (let index = startIndex; index < html.length; ) {
    const liOpen = html.indexOf("<li", index);
    const liClose = html.indexOf("</li>", index);

    if (liClose === -1) return null;

    if (liOpen !== -1 && liOpen < liClose) {
      depth += 1;
      index = html.indexOf(">", liOpen);
      if (index === -1) return null;
      index += 1;
      continue;
    }

    depth -= 1;
    const endIndex = liClose + "</li>".length;
    if (depth === 0) {
      return {
        endIndex,
        html: html.slice(startIndex, endIndex),
      };
    }

    index = endIndex;
  }

  return null;
}

function extractDirectAnchor(liHtml: string) {
  const contentStart = liHtml.indexOf(">");
  const contentEnd = liHtml.lastIndexOf("</li>");
  if (contentStart === -1 || contentEnd === -1) return null;

  const inner = liHtml.slice(contentStart + 1, contentEnd);
  let depth = 0;

  for (let index = 0; index < inner.length; ) {
    const tagStart = inner.indexOf("<", index);
    if (tagStart === -1) break;

    if (tagStart > index && depth === 0 && inner.slice(index, tagStart).trim()) {
      return null;
    }

    const tagEnd = inner.indexOf(">", tagStart);
    if (tagEnd === -1) break;

    const tagBody = inner.slice(tagStart + 1, tagEnd).trim();
    const isClosing = tagBody.startsWith("/");
    const tagName = (isClosing ? tagBody.slice(1) : tagBody).split(/\s+/)[0]?.toLowerCase();

    if (!tagName) {
      index = tagEnd + 1;
      continue;
    }

    if (tagName === "ul" && !isClosing) {
      depth += 1;
      index = tagEnd + 1;
      continue;
    }

    if (tagName === "ul" && isClosing) {
      depth = Math.max(0, depth - 1);
      index = tagEnd + 1;
      continue;
    }

    if (depth === 0 && tagName === "a" && !isClosing) {
      const closeTag = inner.indexOf("</a>", tagEnd + 1);
      if (closeTag === -1) return null;

      const tag = inner.slice(tagStart, tagEnd + 1);
      const href = readAttribute(tag, "href");
      const label = stripTags(inner.slice(tagEnd + 1, closeTag));

      if (!href || !label) return null;
      return { href, label };
    }

    index = tagEnd + 1;
  }

  return null;
}

function extractDirectChildList(innerHtml: string) {
  let depth = 0;

  for (let index = 0; index < innerHtml.length; ) {
    const tagStart = innerHtml.indexOf("<", index);
    if (tagStart === -1) break;

    const tagEnd = innerHtml.indexOf(">", tagStart);
    if (tagEnd === -1) break;

    const tagBody = innerHtml.slice(tagStart + 1, tagEnd).trim();
    const isClosing = tagBody.startsWith("/");
    const tagName = (isClosing ? tagBody.slice(1) : tagBody).split(/\s+/)[0]?.toLowerCase();

    if (!tagName) {
      index = tagEnd + 1;
      continue;
    }

    if (tagName === "ul" && !isClosing) {
      if (depth === 0) {
        let listDepth = 1;
        let cursor = tagEnd + 1;

        while (cursor < innerHtml.length) {
          const nextTagStart = innerHtml.indexOf("<", cursor);
          if (nextTagStart === -1) break;

          const nextTagEnd = innerHtml.indexOf(">", nextTagStart);
          if (nextTagEnd === -1) break;

          const nextTagBody = innerHtml.slice(nextTagStart + 1, nextTagEnd).trim();
          const nextClosing = nextTagBody.startsWith("/");
          const nextTagName = (nextClosing ? nextTagBody.slice(1) : nextTagBody)
            .split(/\s+/)[0]
            ?.toLowerCase();

          if (nextTagName === "ul" && !nextClosing) {
            listDepth += 1;
          } else if (nextTagName === "ul" && nextClosing) {
            listDepth -= 1;
            if (listDepth === 0) {
              return innerHtml.slice(tagStart, nextTagEnd + 1);
            }
          }

          cursor = nextTagEnd + 1;
        }

        return null;
      }

      depth += 1;
      index = tagEnd + 1;
      continue;
    }

    if (tagName === "ul" && isClosing) {
      depth = Math.max(0, depth - 1);
    }

    index = tagEnd + 1;
  }
}

function parseListItems(listHtml: string): NavItem[] {
  const openTagEnd = listHtml.indexOf(">");
  const closeTagStart = listHtml.lastIndexOf("</ul>");
  if (openTagEnd === -1 || closeTagStart === -1) return [];

  const inner = listHtml.slice(openTagEnd + 1, closeTagStart);
  const items: NavItem[] = [];

  for (let index = 0; index < inner.length; ) {
    const liStart = inner.indexOf("<li", index);
    if (liStart === -1) break;

    const block = extractLiBlock(inner, liStart);
    if (!block) break;

    const anchor = extractDirectAnchor(block.html);
    if (anchor) {
      const contentStart = block.html.indexOf(">");
      const contentEnd = block.html.lastIndexOf("</li>");
      const liInner =
        contentStart !== -1 && contentEnd !== -1
          ? block.html.slice(contentStart + 1, contentEnd)
          : "";

      const nestedList = extractDirectChildList(liInner);
      const children = nestedList ? parseListItems(nestedList) : [];

      items.push({
        href: normalizeHref(anchor.href),
        label: anchor.label,
        ...(children.length ? { children } : {}),
      });
    }

    index = block.endIndex;
  }

  return items;
}

function mapNavigationNode(node: WpNavigationNode): NavItem[] {
  const rendered = node.content?.rendered ?? "";
  return parseListItems(rendered);
}

async function fetchJson<T>(path: string): Promise<T | null> {
  const url = new URL(path, WP_BASE_URL).toString();
  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) return null;

  return (await res.json()) as T;
}

export async function getMenuItems(): Promise<NavItem[]> {
  if (!WP_BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_WP_BASE_URL in .env.local");
  }

  const legacyMenu = await fetchJson<WpMenuResponse>(WP_MENU_ENDPOINT);
  const legacyItems = legacyMenu
    ? extractMenuNodes(legacyMenu)
        .map(mapMenuNode)
        .filter((item): item is NavItem => item !== null)
    : [];

  if (legacyItems.length > 0) {
    return legacyItems;
  }

  const navigationNodes = await fetchJson<WpNavigationNode[]>(WP_NAVIGATION_ENDPOINT);
  const navigationNode = navigationNodes?.find((node) =>
    WP_NAVIGATION_SLUG ? node.slug === WP_NAVIGATION_SLUG : true,
  );

  if (!navigationNode) {
    return [];
  }

  return mapNavigationNode(navigationNode);
}
