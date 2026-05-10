import Link from "next/link";
import ProductCategoryClient from "@/components/shop/ProductCategoryClient";
import {
  getAllStoreProducts,
  getStoreAttributes,
  getStoreAttributeTerms,
} from "@/lib/wp/store";

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

function toGreekUppercase(value: string) {
  return decodeHtml(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleUpperCase("el-GR");
}

async function getAttributeGroupsSafely(attributes: Awaited<ReturnType<typeof getStoreAttributes>>) {
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
      `[shop] Failed to load terms for attribute ${failedAttribute?.id ?? "unknown"} (${failedAttribute?.taxonomy ?? "unknown"}):`,
      result.reason,
    );

    return [];
  });
}

export default async function ShopPage() {
  const [products, attributes] = await Promise.all([getAllStoreProducts(), getStoreAttributes()]);

  const attributeGroups = await getAttributeGroupsSafely(attributes);

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

  return (
    <main className="w-full py-10">
      <section className="mb-10 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="page-hero-shell overflow-hidden rounded-[0.5rem] border border-black/8 shadow-sm">
          <div className="px-6 py-8 sm:px-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
              {toGreekUppercase("Shop")}
            </p>
            <h1 className="mb-3 text-4xl font-bold text-black">Όλα τα Προϊόντα</h1>
            <p className="max-w-3xl text-black/65">
              Περιηγηθείτε σε ολόκληρο το διαθέσιμο catalog της Coptex Hellas και φιλτράρετε
              προϊόντα ανά κατηγορία, brand και τεχνικά χαρακτηριστικά.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-black/55">
          <Link href="/" className="hover:text-primary">
            Αρχική
          </Link>
          <div className="flex items-center gap-2">
            <span>/</span>
            <span className="font-medium text-black">Shop</span>
          </div>
        </div>

        <ProductCategoryClient
          products={products}
          currentCategorySlug=""
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
      </section>
    </main>
  );
}
