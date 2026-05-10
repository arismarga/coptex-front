import type { Metadata } from "next";
import Link from "next/link";
import { getContactPageContent } from "@/lib/wp/contact";

function detailHref(type: "address" | "email" | "phone", value: string) {
  if (type === "email") {
    return `mailto:${value}`;
  }

  if (type === "phone") {
    return `tel:${value.replace(/\s+/g, "")}`;
  }

  return undefined;
}

function DetailRow({
  label,
  value,
  type,
}: {
  label: string;
  value: string;
  type: "address" | "email" | "phone";
}) {
  const href = detailHref(type, value);

  return (
    <div className="border-b border-black/8 pb-5 last:border-b-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">{label}</p>
      {href ? (
        <Link
          href={href}
          className="mt-3 block text-base font-semibold leading-7 text-black hover:text-primary sm:text-lg"
        >
          {value}
        </Link>
      ) : (
        <p className="mt-3 text-base font-semibold leading-7 text-black sm:text-lg">{value}</p>
      )}
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContactPageContent();
  const title = content?.seo.metaTitle || content?.hero.title || "Επικοινωνία";
  const description =
    content?.seo.metaDescription ||
    content?.hero.description ||
    content?.map.locationDescription ||
    "Επικοινωνήστε με την Coptex Hellas για πληροφορίες, τεχνική υποστήριξη και προσφορές.";
  const ogImage = content?.seo.ogImage?.url;

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

export default async function ContactPage() {
  const content = await getContactPageContent();

  if (!content) {
    return null;
  }

  const showTopSection = content.hero.enabled || content.details.enabled || content.form.enabled;
  const showHeroInfo = content.hero.enabled || content.details.enabled;
  const showMapSection = content.map.enabled;

  return (
    <main className="w-full py-10">
      {showTopSection ? (
        <section className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="contact-hero-shell overflow-hidden rounded-[0.5rem] border border-black/8 shadow-sm">
            <div
              className={`grid gap-10 px-6 py-8 sm:px-8 sm:py-10 xl:items-start xl:gap-14 ${
                showHeroInfo && content.form.enabled
                  ? "xl:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.75fr)]"
                  : ""
              }`}
            >
              {showHeroInfo ? (
                <div className="space-y-8">
                  {content.hero.enabled ? (
                    <div className="space-y-4">
                      {content.hero.eyebrow ? (
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
                          {content.hero.eyebrow}
                        </p>
                      ) : null}
                      {content.hero.title ? (
                        <h3 className="smaller-section-title text-4xl font-bold text-black sm:text-5xl">
                          {content.hero.title}
                        </h3>
                      ) : null}
                      {content.hero.description ? (
                        <p className="max-w-xl text-black/68">{content.hero.description}</p>
                      ) : null}
                    </div>
                  ) : null}

                  {content.details.enabled ? (
                    <>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-5 sm:col-span-2">
                          <DetailRow
                            label={content.details.addressLabel}
                            value={content.details.addressValue}
                            type="address"
                          />
                          <div className="grid gap-5 sm:grid-cols-2">
                            <DetailRow
                              label={content.details.emailLabel}
                              value={content.details.emailValue}
                              type="email"
                            />
                            <DetailRow
                              label={content.details.phoneLabel}
                              value={content.details.phoneValue}
                              type="phone"
                            />
                          </div>
                        </div>
                      </div>

                      {content.details.supportBlocks.length ? (
                        <div className="grid gap-5 pt-2 md:grid-cols-3">
                          {content.details.supportBlocks.map((block) => (
                            <article
                              key={`${block.title}-${block.text}`}
                              className="rounded-[0.5rem] border border-black/8 bg-white/70 p-5 shadow-[0_12px_30px_rgba(48,48,47,0.05)]"
                            >
                              {block.title ? <h2 className="text-base font-bold text-black">{block.title}</h2> : null}
                              {block.text ? <p className="mt-3 text-sm leading-6 text-black/62">{block.text}</p> : null}
                            </article>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              ) : null}

              {content.form.enabled ? (
                <div className="contact-form-shell rounded-[1.5rem] border border-white/80 p-6 shadow-[0_22px_60px_rgba(48,48,47,0.12)] sm:p-8">
                  {content.form.title ? <h2 className="text-3xl font-bold text-black">{content.form.title}</h2> : null}
                  {content.form.description ? (
                    <p className="mt-2 text-sm leading-6 text-black/55">{content.form.description}</p>
                  ) : null}

                  {content.form.html ? (
                    <div
                      className="contact-form-render mt-6"
                      dangerouslySetInnerHTML={{ __html: content.form.html }}
                    />
                  ) : (
                    <div className="mt-6 rounded-[0.5rem] border border-dashed border-black/12 bg-black/[0.02] px-5 py-6 text-sm text-black/55">
                      Δεν έχει οριστεί ακόμα φόρμα επικοινωνίας.
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {showMapSection ? (
        <section className="mt-10 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-black/55">
            <Link href="/" className="hover:text-primary">
              Αρχική
            </Link>
            <div className="flex items-center gap-2">
              <span>/</span>
              <span className="font-medium text-black">Επικοινωνία</span>
            </div>
          </div>

          <section className="space-y-5">
            {(content.map.locationTitle || content.map.locationDescription) && (
              <div className="rounded-[0.5rem] border border-black/8 bg-white p-6 shadow-[0_16px_40px_rgba(48,48,47,0.06)] sm:p-8">
                {content.map.locationTitle ? (
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
                    {content.map.locationTitle}
                  </p>
                ) : null}
                {content.map.locationDescription ? (
                  <div className="mt-4 text-black/68">
                    <p>{content.map.locationDescription}</p>
                  </div>
                ) : null}
              </div>
            )}

            {content.map.embed ? (
              <div className="overflow-hidden rounded-[0.5rem] border border-black/8 shadow-sm">
                <div
                  className="contact-map-shell [&_iframe]:h-[440px] [&_iframe]:w-full [&_iframe]:border-0"
                  dangerouslySetInnerHTML={{ __html: content.map.embed }}
                />
              </div>
            ) : null}
          </section>
        </section>
      ) : null}
    </main>
  );
}
