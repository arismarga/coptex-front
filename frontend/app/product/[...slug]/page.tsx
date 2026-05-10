import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/shop/ProductDetailClient";
import ProductImageGallery from "@/components/shop/ProductImageGallery";
import ProductCard from "@/components/shop/ProductCard";
import {
  getAllStoreProducts,
  getStoreCategories,
  getStoreProductBySlugPath,
  getWpRelativePath,
} from "@/lib/wp/store";

type PageProps = {
  params: Promise<{
    slug: string[];
  }>;
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

function normalizeDecodedValue(value: string) {
  try {
    return decodeURIComponent(value).replace(/\/+$/, "");
  } catch {
    return value.replace(/\/+$/, "");
  }
}

function stripHtml(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function buildCategoryBreadcrumbs(
  productCategoryIds: number[],
  categories: Awaited<ReturnType<typeof getStoreCategories>>,
) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const matchingCategories = categories.filter((category) => productCategoryIds.includes(category.id));

  const deepestCategory =
    matchingCategories.sort((a, b) => {
      const aDepth = normalizeDecodedValue(getWpRelativePath(a.permalink)).split("/").length;
      const bDepth = normalizeDecodedValue(getWpRelativePath(b.permalink)).split("/").length;
      return bDepth - aDepth;
    })[0] ?? null;

  if (!deepestCategory) {
    return [];
  }

  const breadcrumbs = [deepestCategory];
  let currentParentId = deepestCategory.parent;

  while (currentParentId) {
    const parentCategory = categoryById.get(currentParentId);
    if (!parentCategory) {
      break;
    }

    breadcrumbs.unshift(parentCategory);
    currentParentId = parentCategory.parent;
  }

  return breadcrumbs;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProductBySlugPath(slug);

  if (!product) {
    return {};
  }

  const title = `${decodeHtml(product.name)} | COPTEX Hellas`;
  const description =
    stripHtml(product.short_description) ||
    stripHtml(product.description) ||
    `Δείτε το προϊόν ${decodeHtml(product.name)} στην COPTEX Hellas.`;
  const ogImage = product.images[0]?.src;

  return {
    title,
    description,
    openGraph: ogImage
      ? {
          title,
          description,
          images: [{ url: ogImage }],
        }
      : undefined,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getStoreProductBySlugPath(slug);

  if (!product) {
    notFound();
  }

  const [categories, allProducts] = await Promise.all([getStoreCategories(), getAllStoreProducts()]);
  const breadcrumbs = buildCategoryBreadcrumbs(
    product.categories.map((category) => category.id),
    categories,
  );
  const productName = decodeHtml(product.name);
  const pdfFiles = product.product_pdfs?.filter((file) => file.url?.trim()) ?? [];
  const specsTableTitle = product.product_may_also_have?.specs_table_title?.trim() ?? "";
  const specsTableHeadings = product.product_may_also_have?.specs_table?.headings ?? [];
  const specsTableRows = product.product_may_also_have?.specs_table?.rows ?? [];
  const visibleSpecsColumns = [0, 1, 2, 3, 4, 5].filter((columnIndex) => {
    const heading = specsTableHeadings[columnIndex]?.trim() ?? "";
    const rowHasValue = specsTableRows.some((row) => (row[columnIndex] ?? "").trim() !== "");
    return heading !== "" || rowHasValue;
  });
  const hasSpecsTable = visibleSpecsColumns.length > 0 && specsTableRows.length > 0;

  const relatedProducts = allProducts
    .filter((candidate) => candidate.id !== product.id)
    .filter((candidate) =>
      candidate.categories.some((category) =>
        product.categories.some((productCategory) => productCategory.id === category.id),
      ),
    )
    .sort((a, b) => b.id - a.id)
    .slice(0, 4);

  return (
    <main className="w-full py-10">
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="page-breadcrumb-shell mb-8 rounded-[1.75rem] border border-black/8 px-5 py-4 shadow-sm sm:px-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
            Πλοήγηση προϊόντος
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-black/55">
            <Link
              href="/"
              className="rounded-[1rem] bg-white px-3 py-1.5 font-medium text-black/70 transition hover:text-primary"
            >
              Αρχική
            </Link>

            {breadcrumbs.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="text-black/25">/</span>
                <Link
                  href={getWpRelativePath(item.permalink)}
                  className="rounded-[1rem] bg-white px-3 py-1.5 font-medium text-black/70 transition hover:text-primary"
                >
                  {decodeHtml(item.name)}
                </Link>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <span className="text-black/25">/</span>
              <span className="rounded-[1rem] bg-primary/8 px-3 py-1.5 font-semibold text-primary">
                {productName}
              </span>
            </div>
          </div>
        </div>

        <section className="grid gap-8 rounded-[0.5rem] border border-black/8 bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] lg:p-8">
          <div className="product-image-shell h-full overflow-hidden rounded-[1.75rem] border border-black/6">
            <ProductImageGallery images={product.images} productName={productName} />
          </div>

          <div className="flex h-full flex-col justify-start">
            <div className="product-summary-shell flex h-full flex-col rounded-[1.75rem] border border-black/8 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
                Προϊόν
              </p>
              <h1 className="mt-3 text-4xl font-bold text-black">{productName}</h1>

              {product.short_description ? (
                <div
                  className="wysiwyg-content mt-5"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              ) : null}

              {pdfFiles.length ? (
                <div className="product-pdf-shell mt-5 rounded-[1.6rem] border border-primary/12 p-4 sm:p-5">
                  <div className="mb-4">
                    <span className="block text-sm font-semibold uppercase tracking-[0.16em] text-primary/75">
                      PDFs
                    </span>
                  </div>

                  <div className="space-y-3">
                    {pdfFiles.map((file, index) => {
                      const fileLabel =
                        file.title?.trim() ||
                        file.filename?.trim() ||
                        `PDF ${index + 1}`;

                      return (
                        <a
                          key={`${file.url}-${index}`}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="product-pdf-card flex items-center justify-between gap-4 rounded-[1.25rem] border border-white/70 bg-white/90 px-4 py-3 text-primary transition hover:border-primary/20 hover:bg-white"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="product-pdf-icon inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
                              <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5 fill-none stroke-current"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
                                <path d="M14 2v5h5" />
                                <path d="M9 13h6" />
                                <path d="M9 17h4" />
                              </svg>
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-black">
                                {fileLabel}
                              </span>
                              <span className="mt-1 block text-xs font-medium text-black/45">
                                Προβολή ή λήψη αρχείου PDF
                              </span>
                            </span>
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <ProductDetailClient product={product} />
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-8">
          <div className="rounded-[0.5rem] border border-black/8 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
                Περιγραφή
              </p>
              <h2 className="mt-2 text-3xl font-bold text-black">Λεπτομέρειες προϊόντος</h2>
            </div>

            {product.description ? (
              <div
                className="wysiwyg-content"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-black/60">Δεν υπάρχει διαθέσιμη περιγραφή για αυτό το προϊόν.</p>
            )}
          </div>

          {hasSpecsTable ? (
            <div className="rounded-[0.5rem] border border-black/8 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
                  Product may also have
                </p>
                <h2 className="mt-2 text-3xl font-bold text-black">
                  {specsTableTitle || "Τεχνικός πίνακας"}
                </h2>
              </div>

              <div className="overflow-x-auto rounded-[1.5rem] border border-black/8">
                <table className="min-w-full border-collapse bg-white">
                  <thead>
                    <tr className="bg-[#faf7f1]">
                      {visibleSpecsColumns.map((columnIndex) => (
                        <th
                          key={`heading-${columnIndex}`}
                          scope="col"
                          className="border-b border-black/8 px-5 py-4 text-left text-sm font-semibold text-black"
                        >
                          {specsTableHeadings[columnIndex]?.trim() || `Στήλη ${columnIndex + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {specsTableRows.map((row, rowIndex) => (
                      <tr key={`row-${rowIndex}`} className="border-b border-black/6 last:border-b-0">
                        {visibleSpecsColumns.map((columnIndex) => (
                          <td
                            key={`row-${rowIndex}-col-${columnIndex}`}
                            className="px-5 py-4 text-sm leading-7 text-black/70"
                          >
                            {(row[columnIndex] ?? "").trim() || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className="rounded-[0.5rem] border border-black/8 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
                Πρόσθετες πληροφορίες
              </p>
              <h2 className="mt-2 text-3xl font-bold text-black">Χαρακτηριστικά προϊόντος</h2>
            </div>

            {product.attributes?.length ? (
              <div className="overflow-hidden rounded-[1.5rem] border border-black/8">
                <div className="divide-y divide-black/6">
                  {product.attributes.map((attribute) => (
                    <div
                      key={attribute.id}
                      className="grid gap-3 bg-white px-5 py-4 sm:grid-cols-[220px_minmax(0,1fr)]"
                    >
                      <div className="text-sm font-semibold text-black">
                        {decodeHtml(attribute.name)}
                      </div>
                      <div className="text-sm text-black/65">
                        {attribute.terms.map((term) => decodeHtml(term.name)).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-black/60">
                Δεν υπάρχουν πρόσθετες πληροφορίες για αυτό το προϊόν.
              </p>
            )}
          </div>
        </section>

        {relatedProducts.length ? (
          <section className="mt-10">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
                Related products
              </p>
              <h2 className="mt-2 text-3xl font-bold text-black">Σχετικά προϊόντα</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
