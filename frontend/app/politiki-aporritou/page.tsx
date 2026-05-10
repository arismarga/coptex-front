import Link from "next/link";
import { notFound } from "next/navigation";
import { getLegalPageContent } from "@/lib/wp/legal-page";

export default async function PrivacyPolicyPage() {
  const content = await getLegalPageContent("politiki-aporritou");

  if (!content) {
    notFound();
  }

  return (
    <main className="w-full py-10">
      <section className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="page-hero-shell overflow-hidden rounded-[0.5rem] border border-black/8 shadow-sm">
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-black/55">
              <Link href="/" className="hover:text-primary">
                Αρχική
              </Link>
              <span>/</span>
              <span className="font-medium text-black">{content.title}</span>
            </div>

            <h1 className="text-4xl font-bold text-black sm:text-5xl">{content.title}</h1>
          </div>
        </div>
      </section>

      <section className="mt-10 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <article className="rounded-[0.5rem] border border-black/8 bg-white p-6 shadow-sm sm:p-8">
          <div className="wysiwyg-content" dangerouslySetInnerHTML={{ __html: content.content }} />
        </article>
      </section>
    </main>
  );
}
