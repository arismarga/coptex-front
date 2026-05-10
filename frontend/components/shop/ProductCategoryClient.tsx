"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/shop/ProductCard";
import type { WooProduct } from "@/lib/wp/store";

type FilterOption = {
  slug: string;
  name: string;
  count: number;
};

type AttributeFilterGroup = {
  id: number;
  name: string;
  taxonomy: string;
  terms: FilterOption[];
};

type Props = {
  products: WooProduct[];
  currentCategorySlug: string;
  attributeGroups: AttributeFilterGroup[];
};

const PRODUCTS_PER_PAGE = 24;

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

function readMultiValue(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  if (!value) return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function readPageValue(searchParams: URLSearchParams) {
  const value = Number.parseInt(searchParams.get("page") ?? "1", 10);
  return Number.isNaN(value) || value < 1 ? 1 : value;
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function sortFilterOptions(options: FilterOption[]) {
  return [...options].sort((a, b) => a.name.localeCompare(b.name));
}

function toGreekUppercase(value: string) {
  return decodeHtml(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleUpperCase("el-GR");
}

export default function ProductCategoryClient({
  products,
  currentCategorySlug,
  attributeGroups,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const readAttributeEntries = useCallback(() => {
    const entries = new Map<string, string[]>();
    attributeGroups.forEach((group) => {
      entries.set(group.taxonomy, readMultiValue(searchParams, `attr_${group.taxonomy}`));
    });
    return entries;
  }, [attributeGroups, searchParams]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    readMultiValue(searchParams, "categories"),
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(() =>
    readMultiValue(searchParams, "brands"),
  );
  const [currentPage, setCurrentPage] = useState(() => readPageValue(searchParams));
  const [selectedAttributes, setSelectedAttributes] = useState<Map<string, string[]>>(() =>
    readAttributeEntries(),
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSelectedCategories(readMultiValue(searchParams, "categories"));
      setSelectedBrands(readMultiValue(searchParams, "brands"));
      setCurrentPage(readPageValue(searchParams));
      setSelectedAttributes(readAttributeEntries());
    }, 0);

    return () => window.clearTimeout(id);
  }, [readAttributeEntries, searchParams]);

  const productMatchesFilters = useCallback(
    (
      product: WooProduct,
      excludedFilter?: { type: "categories" | "brands" | "attribute"; taxonomy?: string },
    ) => {
      if (
        excludedFilter?.type !== "categories" &&
        selectedCategories.length &&
        !product.categories.some((category) => selectedCategories.includes(category.slug))
      ) {
        return false;
      }

      if (
        excludedFilter?.type !== "brands" &&
        selectedBrands.length &&
        !product.brands?.some((brand) => selectedBrands.includes(brand.slug))
      ) {
        return false;
      }

      for (const group of attributeGroups) {
        if (excludedFilter?.type === "attribute" && excludedFilter.taxonomy === group.taxonomy) {
          continue;
        }

        const selectedTerms = selectedAttributes.get(group.taxonomy) ?? [];
        if (!selectedTerms.length) continue;

        const productAttribute = product.attributes?.find(
          (attribute) => attribute.taxonomy === group.taxonomy,
        );

        if (!productAttribute) {
          return false;
        }

        const matchesAttribute = productAttribute.terms.some((term) =>
          selectedTerms.includes(term.slug),
        );

        if (!matchesAttribute) {
          return false;
        }
      }

      return true;
    },
    [attributeGroups, selectedAttributes, selectedBrands, selectedCategories],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => productMatchesFilters(product));
  }, [products, productMatchesFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const resolvedCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const startIndex = (resolvedCurrentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, resolvedCurrentPage]);

  const availableCategoryOptions = useMemo(() => {
    const counts = new Map<string, FilterOption>();

    products
      .filter((product) => productMatchesFilters(product, { type: "categories" }))
      .forEach((product) => {
        product.categories.forEach((category) => {
          if (category.slug === currentCategorySlug) return;

          const existing = counts.get(category.slug);
          counts.set(category.slug, {
            slug: category.slug,
            name: category.name,
            count: existing ? existing.count + 1 : 1,
          });
        });
      });

    return sortFilterOptions(Array.from(counts.values()));
  }, [products, productMatchesFilters, currentCategorySlug]);

  const availableBrandOptions = useMemo(() => {
    const counts = new Map<string, FilterOption>();

    products
      .filter((product) => productMatchesFilters(product, { type: "brands" }))
      .forEach((product) => {
        product.brands?.forEach((brand) => {
          const existing = counts.get(brand.slug);
          counts.set(brand.slug, {
            slug: brand.slug,
            name: brand.name,
            count: existing ? existing.count + 1 : 1,
          });
        });
      });

    return sortFilterOptions(Array.from(counts.values()));
  }, [products, productMatchesFilters]);

  const availableAttributeGroups = useMemo(() => {
    return attributeGroups
      .map((group) => {
        const counts = new Map<string, FilterOption>();

        products
          .filter((product) =>
            productMatchesFilters(product, { type: "attribute", taxonomy: group.taxonomy }),
          )
          .forEach((product) => {
            const productAttribute = product.attributes?.find(
              (attribute) => attribute.taxonomy === group.taxonomy,
            );

            productAttribute?.terms.forEach((term) => {
              const existing = counts.get(term.slug);
              counts.set(term.slug, {
                slug: term.slug,
                name: term.name,
                count: existing ? existing.count + 1 : 1,
              });
            });
          });

        const selectedTerms = selectedAttributes.get(group.taxonomy) ?? [];
        const mergedTerms = new Map(counts);

        selectedTerms.forEach((selectedSlug) => {
          if (!mergedTerms.has(selectedSlug)) {
            const original = group.terms.find((term) => term.slug === selectedSlug);
            if (original) {
              mergedTerms.set(selectedSlug, {
                slug: original.slug,
                name: original.name,
                count: 0,
              });
            }
          }
        });

        return {
          ...group,
          terms: sortFilterOptions(Array.from(mergedTerms.values())),
        };
      })
      .filter((group) => group.terms.length > 0);
  }, [products, attributeGroups, productMatchesFilters, selectedAttributes]);

  useEffect(() => {
    const nextSearchParams = new URLSearchParams();

    if (selectedCategories.length) {
      nextSearchParams.set("categories", selectedCategories.join(","));
    }

    if (selectedBrands.length) {
      nextSearchParams.set("brands", selectedBrands.join(","));
    }

    if (resolvedCurrentPage > 1) {
      nextSearchParams.set("page", String(resolvedCurrentPage));
    }

    attributeGroups.forEach((group) => {
      const values = selectedAttributes.get(group.taxonomy) ?? [];
      if (values.length) {
        nextSearchParams.set(`attr_${group.taxonomy}`, values.join(","));
      }
    });

    const nextUrl = nextSearchParams.toString()
      ? `${pathname}?${nextSearchParams.toString()}`
      : pathname;

    const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    if (nextUrl !== currentUrl) {
      window.history.replaceState({}, "", nextUrl);
    }
  }, [
    attributeGroups,
    pathname,
    resolvedCurrentPage,
    searchParams,
    selectedAttributes,
    selectedBrands,
    selectedCategories,
  ]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setCurrentPage(1);
    setSelectedAttributes(new Map());
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    Array.from(selectedAttributes.values()).some((terms) => terms.length > 0);

  useEffect(() => {
    if (!mobileFiltersOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFiltersOpen]);

  const toggleSection = (sectionKey: string) => {
    setOpenSections((current) =>
      current.includes(sectionKey)
        ? current.filter((item) => item !== sectionKey)
        : [...current, sectionKey],
    );
  };

  const renderFilterSection = (
    sectionKey: string,
    title: string,
    content: React.ReactNode,
    badge?: number,
  ) => {
    const isOpen = openSections.includes(sectionKey);

    return (
      <section
        key={sectionKey}
        className="rounded-[1.4rem] border border-black/6 bg-[#fafcfb] p-4"
      >
        <button
          type="button"
          onClick={() => toggleSection(sectionKey)}
          className="flex w-full items-center justify-between gap-3 text-left"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-black">{title}</h3>
            {typeof badge === "number" ? (
              <span className="rounded-[1rem] bg-primary/8 px-2.5 py-1 text-xs font-semibold text-primary">
                {badge}
              </span>
            ) : null}
          </div>

          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-[1rem] border border-black/10 text-lg leading-none text-black/45"
          >
            {isOpen ? "-" : "+"}
          </span>
        </button>

        {isOpen ? <div className="mt-3">{content}</div> : null}
      </section>
    );
  };

  const filtersContent = (
    <div className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="border-b border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f7faf7_100%)] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/40">
              {toGreekUppercase("Φίλτρα")}
            </p>
            <p className="mt-2 text-sm leading-6 text-black/55">
              Κατηγορίες, μάρκες και βασικά χαρακτηριστικά προϊόντων.
            </p>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-[1rem] border border-black/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-black/55 hover:border-primary hover:text-primary"
              >
                {toGreekUppercase("Καθαρισμός")}
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-black/10 text-lg text-black/55 lg:hidden"
              aria-label="Κλείσιμο φίλτρων"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        {renderFilterSection(
          "categories",
          "Κατηγορίες",
          <div className="space-y-2">
            {availableCategoryOptions.map((option) => {
              const checked = selectedCategories.includes(option.slug);
              return (
                <label
                  key={option.slug}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 text-sm text-black/70 transition hover:border-black/8"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        (setCurrentPage(1),
                        setSelectedCategories(toggleValue(selectedCategories, option.slug)))
                      }
                      className="h-4 w-4 rounded border-black/20 text-primary focus:ring-primary"
                    />
                    <span>{decodeHtml(option.name)}</span>
                  </span>
                  <span className="rounded-[1rem] bg-black/[0.04] px-2 py-1 text-xs">
                    {option.count}
                  </span>
                </label>
              );
            })}
          </div>,
          availableCategoryOptions.length,
        )}

        {renderFilterSection(
          "brands",
          "Μάρκες",
          <div className="space-y-2">
            {availableBrandOptions.length ? (
              availableBrandOptions.map((option) => {
                const checked = selectedBrands.includes(option.slug);
                return (
                  <label
                    key={option.slug}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 text-sm text-black/70 transition hover:border-black/8"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          (setCurrentPage(1),
                          setSelectedBrands(toggleValue(selectedBrands, option.slug)))
                        }
                        className="h-4 w-4 rounded border-black/20 text-primary focus:ring-primary"
                      />
                      <span>{decodeHtml(option.name)}</span>
                    </span>
                    <span className="rounded-[1rem] bg-black/[0.04] px-2 py-1 text-xs">
                      {option.count}
                    </span>
                  </label>
                );
              })
            ) : (
              <div className="rounded-2xl bg-white px-3 py-3 text-sm text-black/55">
                Δεν βρέθηκαν μάρκες σε αυτή την κατηγορία.
              </div>
            )}
          </div>,
          availableBrandOptions.length,
        )}

        {availableAttributeGroups.map((group) => {
          const selectedTerms = selectedAttributes.get(group.taxonomy) ?? [];

          return renderFilterSection(
            group.taxonomy,
            decodeHtml(group.name),
            <div className="space-y-2">
              {group.terms.map((term) => {
                const checked = selectedTerms.includes(term.slug);

                return (
                  <label
                    key={term.slug}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 text-sm text-black/70 transition hover:border-black/8"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setCurrentPage(1);
                          setSelectedAttributes((current) => {
                            const next = new Map(current);
                            next.set(group.taxonomy, toggleValue(selectedTerms, term.slug));
                            return next;
                          });
                        }}
                        className="h-4 w-4 rounded border-black/20 text-primary focus:ring-primary"
                      />
                      <span>{decodeHtml(term.name)}</span>
                    </span>
                    <span className="rounded-[1rem] bg-black/[0.04] px-2 py-1 text-xs">
                      {term.count}
                    </span>
                  </label>
                );
              })}
            </div>,
            group.terms.length,
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
      <div className="hidden lg:block lg:sticky lg:top-[calc(var(--header-h)+24px)]">
        {filtersContent}
      </div>

      <div>
        <div className="mb-5 flex items-center justify-between gap-4 rounded-[1.5rem] border border-black/8 bg-white px-5 py-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
              {toGreekUppercase("Προϊόντα")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-[1rem] border border-black/10 px-4 py-2 text-sm font-semibold text-black/70 hover:border-primary hover:text-primary lg:hidden"
          >
            <span>Φίλτρα</span>
            {hasActiveFilters ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-[1rem] bg-primary px-1.5 text-[11px] text-white">
                {selectedCategories.length +
                  selectedBrands.length +
                  Array.from(selectedAttributes.values()).filter((terms) => terms.length > 0)
                    .length}
              </span>
            ) : null}
          </button>
        </div>

        {filteredProducts.length ? (
          <>
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedProducts.map((product) => {
                return <ProductCard key={product.id} product={product} />;
              })}
            </section>

            {totalPages > 1 ? (
              <nav
                className="mt-8 flex flex-wrap items-center justify-center gap-2"
                aria-label="Πλοήγηση σελίδων προϊόντων"
              >
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={resolvedCurrentPage === 1}
                  className="rounded-[1rem] border border-black/10 px-4 py-2 text-sm font-semibold text-black/65 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Προηγούμενη
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    aria-current={page === resolvedCurrentPage ? "page" : undefined}
                    className={`inline-flex h-11 min-w-11 items-center justify-center rounded-[1rem] border px-4 text-sm font-semibold transition ${
                      page === resolvedCurrentPage
                        ? "border-primary bg-primary text-white"
                        : "border-black/10 text-black/70 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={resolvedCurrentPage === totalPages}
                  className="rounded-[1rem] border border-black/10 px-4 py-2 text-sm font-semibold text-black/65 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Επόμενη
                </button>
              </nav>
            ) : null}
          </>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-black/[0.02] px-6 py-10 text-center text-black/60">
            Δεν υπάρχουν προϊόντα που να ταιριάζουν με τα επιλεγμένα φίλτρα.
          </div>
        )}
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Κλείσιμο φίλτρων"
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            onClick={() => setMobileFiltersOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 top-[12vh] overflow-y-auto rounded-t-[2rem] bg-[#f6f8f6] p-4 shadow-2xl">
            {filtersContent}
          </div>
        </div>
      ) : null}
    </section>
  );
}
