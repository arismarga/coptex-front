import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { searchProducts } from "@/lib/wp/search";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

const RESULTS_PER_PAGE = 22;

function toPositiveInt(value?: string) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "", page } = await searchParams;
  const query = q.trim();
  const currentPage = toPositiveInt(page);
  const results = await searchProducts(query, {
    limit: RESULTS_PER_PAGE,
    page: currentPage,
  });

  return (
    <main className="w-full py-10">
      <section className="mb-10 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="page-hero-shell overflow-hidden rounded-[0.5rem] border border-black/8 shadow-sm">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
                Αποτελέσματα αναζήτησης
              </p>
              <h1 className="mb-3 text-4xl font-bold text-black">
                {query ? `Αναζήτηση για “${query}”` : "Αναζήτηση προϊόντων"}
              </h1>
              <p className="max-w-3xl text-black/65">
                Βρες προϊόντα με βάση όνομα, SKU και σχετικά matches ακόμη κι αν γράψεις χωρίς
                τόνους.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/60 bg-white/75 p-5 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-black/45">
                Σύνολο αποτελεσμάτων
              </p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <div className="text-4xl font-bold text-black">{results.total}</div>
                  <div className="text-sm text-black/55">Σχετικά προϊόντα</div>
                </div>
                <div className="h-14 w-px bg-black/10" />
                <div>
                  <div className="text-4xl font-bold text-primary">{results.totalPages || 1}</div>
                  <div className="text-sm text-black/55">Σελίδες</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {query ? (
          results.products.length ? (
            <>
              <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {results.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </section>

              {results.totalPages > 1 ? (
                <nav
                  className="mt-8 flex flex-wrap items-center justify-center gap-2"
                  aria-label="Πλοήγηση σελίδων αναζήτησης"
                >
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${Math.max(1, currentPage - 1)}`}
                    aria-disabled={currentPage === 1}
                    className={[
                      "rounded-[1rem] border border-black/10 px-4 py-2 text-sm font-semibold transition",
                      currentPage === 1
                        ? "pointer-events-none opacity-40 text-black/50"
                        : "text-black/65 hover:border-primary hover:text-primary",
                    ].join(" ")}
                  >
                    Προηγούμενη
                  </Link>

                  {Array.from({ length: results.totalPages }, (_, index) => index + 1).map(
                    (pageNumber) => (
                      <Link
                        key={pageNumber}
                        href={`/search?q=${encodeURIComponent(query)}&page=${pageNumber}`}
                        aria-current={pageNumber === currentPage ? "page" : undefined}
                        className={[
                          "inline-flex h-11 min-w-11 items-center justify-center rounded-[1rem] border px-4 text-sm font-semibold transition",
                          pageNumber === currentPage
                            ? "border-primary bg-primary text-white"
                            : "border-black/10 text-black/70 hover:border-primary hover:text-primary",
                        ].join(" ")}
                      >
                        {pageNumber}
                      </Link>
                    ),
                  )}

                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${Math.min(results.totalPages, currentPage + 1)}`}
                    aria-disabled={currentPage === results.totalPages}
                    className={[
                      "rounded-[1rem] border border-black/10 px-4 py-2 text-sm font-semibold transition",
                      currentPage === results.totalPages
                        ? "pointer-events-none opacity-40 text-black/50"
                        : "text-black/65 hover:border-primary hover:text-primary",
                    ].join(" ")}
                  >
                    Επόμενη
                  </Link>
                </nav>
              ) : null}
            </>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-black/15 bg-black/[0.02] px-6 py-12 text-center text-black/60">
              Δεν βρέθηκαν προϊόντα για το “{query}”.
            </div>
          )
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-black/15 bg-black/[0.02] px-6 py-12 text-center text-black/60">
            Γράψε έναν όρο αναζήτησης από το popup ή απευθείας στο URL για να εμφανιστούν
            σχετικά προϊόντα.
          </div>
        )}
      </section>
    </main>
  );
}
