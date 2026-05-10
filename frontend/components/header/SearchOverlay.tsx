"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getFrontendProductPath,
  getProductDisplayPrice,
  type WooProduct,
} from "@/lib/wp/store";

type SearchProduct = Pick<
  WooProduct,
  | "id"
  | "name"
  | "slug"
  | "sku"
  | "global_unique_id"
  | "gtin"
  | "upc"
  | "ean"
  | "isbn"
  | "permalink"
  | "price_html"
  | "prices"
  | "images"
>;

type SearchResponse = {
  total: number;
  products: SearchProduct[];
};

type Props = {
  open: boolean;
  onClose: () => void;
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

function getIdentifier(product: SearchProduct) {
  return (
    product.global_unique_id || product.gtin || product.upc || product.ean || product.isbn || ""
  );
}

export default function SearchOverlay({ open, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse>({
    total: 0,
    products: [],
  });

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults({
      total: 0,
      products: [],
    });
  }, [open, pathname]);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setLoading(false);
      setResults({
        total: 0,
        products: [],
      });
      return;
    }

    const controller = new AbortController();
    const id = window.setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=4`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const data = (await response.json()) as SearchResponse;
        setResults(data);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults({
            total: 0,
            products: [],
          });
        }
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(id);
    };
  }, [open, query]);

  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= 2;
  const hasMoreResults = results.total > results.products.length;
  const searchPageHref = useMemo(
    () => `/search?q=${encodeURIComponent(trimmedQuery)}`,
    [trimmedQuery],
  );

  const submitSearch = () => {
    if (!canSearch) return;
    onClose();
    router.push(searchPageHref);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-white">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6 lg:right-8 lg:top-8">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-12 w-12 items-center justify-center rounded-[1rem] border border-black/10 text-xl text-black/60 transition hover:border-primary hover:text-primary"
          aria-label="Κλείσιμο αναζήτησης"
        >
          ×
        </button>
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bgWhite">
        <div className="w-full max-w-[1240px]">
          <div className="mx-auto max-w-[980px] text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/40">
              Αναζήτηση προϊόντων
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitSearch();
              }}
              className="mt-6 rounded-[0.5rem] border border-black/10 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center gap-4 px-6 py-5 sm:px-8">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-7 w-7 shrink-0 text-black/35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>

                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Αναζήτηση με όνομα προϊόντος, SKU ή MPN"
                  className="h-16 w-full border-0 bg-transparent text-2xl font-medium text-black outline-none placeholder:text-black/25 sm:text-4xl"
                />

                {canSearch ? (
                  <button
                    type="submit"
                    className="hidden shrink-0 rounded-[1rem] bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:inline-flex"
                  >
                    Αναζήτηση
                  </button>
                ) : null}
              </div>
            </form>

            <p className="mt-4 text-sm text-black/45">
              Υποστηρίζει αναζήτηση με ή χωρίς τόνους, καθώς και με SKU ή κωδικούς προϊόντος.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-[980px]">
            {!canSearch ? (
              <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-black/[0.02] px-6 py-10 text-black/55">
                Πληκτρολόγησε τουλάχιστον 2 χαρακτήρες για να εμφανιστούν τα πιο σχετικά προϊόντα.
              </div>
            ) : loading ? (
              <div className="rounded-[1.75rem] border border-black/10 bg-white px-6 py-10 text-black/55 shadow-sm">
                Αναζήτηση προϊόντων...
              </div>
            ) : results.products.length ? (
              <div className="space-y-5">
                <div className="grid gap-4">
                  {results.products.map((product) => {
                    const href = getFrontendProductPath(product);
                    const image = product.images[0];
                    const identifier = getIdentifier(product);
                    const displayPrice = getProductDisplayPrice(product);

                    return (
                      <Link
                        key={product.id}
                        href={href}
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-[1.5rem] border border-black/8 bg-white px-4 py-4 shadow-sm transition hover:border-primary/25 hover:shadow-md"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f4f7f5]">
                          {image?.src ? (
                            <Image
                              src={image.src}
                              alt={decodeHtml(image.alt || product.name)}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1 text-left">
                          <h3 className="line-clamp-2 text-lg font-semibold text-black">
                            {decodeHtml(product.name)}
                          </h3>
                          {product.sku ? (
                            <p className="mt-1 text-sm text-black/45">SKU: {product.sku}</p>
                          ) : null}
                          {identifier ? (
                            <p className="mt-1 text-sm text-black/45">Κωδικός: {identifier}</p>
                          ) : null}
                        </div>

                        <div className="hidden shrink-0 text-base font-semibold text-primary sm:block">
                          {displayPrice.amount}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {hasMoreResults ? (
                    <button
                      type="button"
                      onClick={submitSearch}
                      className="rounded-[1rem] bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      Περισσότερα αποτελέσματα
                    </button>
                  ) : null}

                  <p className="text-sm text-black/45">
                    {results.total} σχετικά προϊόντα βρέθηκαν για το “{trimmedQuery}”.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-black/[0.02] px-6 py-10 text-black/55">
                Δεν βρέθηκαν σχετικά προϊόντα για το “{trimmedQuery}”.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
