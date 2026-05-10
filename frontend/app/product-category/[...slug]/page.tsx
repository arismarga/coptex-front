import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCategoryClient from "@/components/shop/ProductCategoryClient";
import {
  getStoreAttributes,
  getStoreAttributeTerms,
  getStoreCategories,
  getStoreProductsByCategory,
  getWpRelativePath,
} from "@/lib/wp/store";

type PageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

type StoreCategory = Awaited<ReturnType<typeof getStoreCategories>>[number];
type StoreProduct = Awaited<ReturnType<typeof getStoreProductsByCategory>>;
type StoreAttribute = Awaited<ReturnType<typeof getStoreAttributes>>;

type ResolvedCategoryPageData = {
  category: StoreCategory;
  categories: StoreCategory[];
  subcategories: StoreCategory[];
  products: StoreProduct;
  attributes: StoreAttribute;
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

function stripHtml(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function toGreekUppercase(value: string) {
  return decodeHtml(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleUpperCase("el-GR");
}

function normalizeDecodedValue(value: string) {
  try {
    return decodeURIComponent(value).replace(/\/+$/, "");
  } catch {
    return value.replace(/\/+$/, "");
  }
}

async function resolveCategoryPageData(slug: string[]): Promise<ResolvedCategoryPageData | null> {
  const requestedPath = normalizeDecodedValue(`/product-category/${slug.join("/")}`);
  const requestedSlug = normalizeDecodedValue(slug[slug.length - 1]);
  const categories = await getStoreCategories();

  const category =
    categories.find(
      (item) => normalizeDecodedValue(getWpRelativePath(item.permalink)) === requestedPath,
    ) ??
    categories.find((item) => normalizeDecodedValue(item.slug) === requestedSlug);

  if (!category) {
    return null;
  }

  const subcategories = categories.filter((item) => item.parent === category.id);
  const [products, attributes] = subcategories.length
    ? [[], []]
    : await Promise.all([getStoreProductsByCategory(category.id), getStoreAttributes()]);

  return {
    category,
    categories,
    subcategories,
    products,
    attributes,
  };
}

async function getAttributeGroupsSafely(attributes: StoreAttribute) {
  const settledAttributes = await Promise.allSettled(
    attributes.map(async (attribute) => ({
      ...attribute,
      terms: await getStoreAttributeTerms(attribute.id),
    })),
  );

  return settledAttributes.flatMap((result, index) => {
    if (result.status === "fulfilled") {
      return [result.value];
    }

    const failedAttribute = attributes[index];
    console.error(
      `[product-category] Failed to load terms for attribute ${failedAttribute?.id ?? "unknown"} (${failedAttribute?.taxonomy ?? "unknown"}):`,
      result.reason,
    );

    return [];
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await resolveCategoryPageData(slug);

  if (!data) {
    return {};
  }

  const title = `${decodeHtml(data.category.name)} | COPTEX Hellas`;
  const description =
    stripHtml(data.category.description) ||
    (data.subcategories.length
      ? `Δείτε τις υποκατηγορίες της ${decodeHtml(data.category.name)} στην COPTEX Hellas.`
      : `${data.category.count} διαθέσιμα προϊόντα στην κατηγορία ${decodeHtml(data.category.name)} της COPTEX Hellas.`);
  const ogImage = data.category.image?.src ?? data.products[0]?.images[0]?.src;

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

export default async function ProductCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await resolveCategoryPageData(slug);

  if (!data) {
    notFound();
  }

  const { category, categories, products, attributes } = data;
  const subcategories = [...data.subcategories].sort((a, b) =>
    decodeHtml(a.name).localeCompare(decodeHtml(b.name), "el"),
  );
  const showSubcategories = subcategories.length > 0;
  const attributeGroups = showSubcategories ? [] : await getAttributeGroupsSafely(attributes);
  const categoryById = new Map(categories.map((item) => [item.id, item]));
  const breadcrumbs = [category];
  const decodedCategoryName = decodeHtml(category.name);

  let currentParentId = category.parent;
  while (currentParentId) {
    const parentCategory = categoryById.get(currentParentId);
    if (!parentCategory) break;
    breadcrumbs.unshift(parentCategory);
    currentParentId = parentCategory.parent;
  }

  const topLevelCategoryName = decodeHtml(breadcrumbs[0]?.name ?? category.name);

  const visibleAttributeGroups = attributeGroups
    .map((attribute) => {
      const usedTerms = new Map<number, string>();

      products.forEach((product) => {
        product.attributes
          ?.filter((productAttribute) => productAttribute.id === attribute.id)
          .forEach((productAttribute) => {
            productAttribute.terms.forEach((term) => {
              usedTerms.set(term.id, term.name);
            });
          });
      });

      const terms =
        usedTerms.size > 0
          ? attribute.terms.filter((term) => usedTerms.has(term.id))
          : attribute.terms;

      return {
        ...attribute,
        terms,
      };
    })
    .filter((attribute) => attribute.terms.length > 0);

  const categoryDescription = category.description
    ? stripHtml(category.description)
    : showSubcategories
      ? `Ανακαλύψτε τις υποκατηγορίες της ${decodedCategoryName} και συνεχίστε στην ενότητα που σας ενδιαφέρει.`
      : `${category.count} διαθέσιμα προϊόντα σε αυτή την κατηγορία.`;

  return (
    <main className="w-full py-10">
      <section className="mb-10 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="page-hero-shell overflow-hidden rounded-[0.5rem] border border-black/8 shadow-sm">
          <div className="px-6 py-8 sm:px-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
              {toGreekUppercase(topLevelCategoryName)}
            </p>
            <h1 className="mb-3 text-4xl font-bold text-black">{decodedCategoryName}</h1>
            <p className="text-black/65">{categoryDescription}</p>
          </div>
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-black/55">
          <Link href="/" className="hover:text-primary">
            Αρχική
          </Link>
          {breadcrumbs.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <span>/</span>
              <Link href={getWpRelativePath(item.permalink)} className="hover:text-primary">
                {decodeHtml(item.name)}
              </Link>
            </div>
          ))}
        </div>

        {showSubcategories ? (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {subcategories.map((subcategory) => {
              const subcategoryName = decodeHtml(subcategory.name);
              const subcategoryDescription = stripHtml(subcategory.description);
              const subcategoryPath = getWpRelativePath(subcategory.permalink);
              const hasChildren = categories.some((item) => item.parent === subcategory.id);

              return (
                <Link
                  key={subcategory.id}
                  href={subcategoryPath}
                  className="group overflow-hidden rounded-[0.5rem] border border-black/8 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_45px_rgba(15,23,42,0.1)]"
                >
                  <div className="relative aspect-[1/0.78] overflow-hidden bg-[linear-gradient(180deg,#faf7f1_0%,#efe6d7_100%)]">
                    {subcategory.image?.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={subcategory.image.src}
                        alt={subcategory.image.alt || subcategoryName}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-end bg-[radial-gradient(circle_at_top,_rgba(167,118,43,0.22),_transparent_38%),linear-gradient(180deg,#faf7f1_0%,#efe6d7_100%)] p-5">
                        <div className="rounded-[1rem] border border-white/60 bg-white/75 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary/70 backdrop-blur">
                          {toGreekUppercase(decodedCategoryName)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-black transition group-hover:text-primary">
                          {subcategoryName}
                        </h2>
                        <p className="mt-2 text-sm text-black/52">
                          {hasChildren ? "Περιήγηση σε υποκατηγορίες" : "Περιήγηση σε προϊόντα"}
                        </p>
                      </div>

                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-black/65">
                      {subcategoryDescription ||
                        `Δείτε όλα τα διαθέσιμα στοιχεία της ενότητας ${subcategoryName}.`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          <ProductCategoryClient
            products={products}
            currentCategorySlug={category.slug}
            attributeGroups={visibleAttributeGroups.map((attribute) => ({
              id: attribute.id,
              name: attribute.name,
              taxonomy: attribute.taxonomy,
              terms: attribute.terms.map((term) => ({
                slug: term.slug,
                name: term.name,
                count: term.count,
              })),
            }))}
          />
        )}
      </section>
    </main>
  );
}
