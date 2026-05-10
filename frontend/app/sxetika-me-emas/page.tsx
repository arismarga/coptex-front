import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  Factory,
  Mail,
  MapPin,
  Phone,
  Settings2,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import AboutStatsGrid from "@/components/sections/AboutStatsGrid";
import { getAboutPageContent } from "@/lib/wp/about";

function stripHtml(value?: string | null) {
  return (value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function resolveIcon(iconName?: string | null) {
  switch ((iconName ?? "").toLowerCase()) {
    case "factory":
      return Factory;
    case "settings":
    case "settings2":
      return Settings2;
    case "shield":
    case "shieldcheck":
      return ShieldCheck;
    case "wrench":
      return Wrench;
    case "box":
    case "package":
      return Box;
    default:
      return Settings2;
  }
}

function detailHref(type: "phone" | "email", value: string) {
  if (type === "phone") {
    return `tel:${value.replace(/\s+/g, "")}`;
  }

  return `mailto:${value}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getAboutPageContent();
  const title = content?.seo.metaTitle || content?.title || "Σχετικά με εμάς";
  const description =
    content?.seo.metaDescription ||
    content?.hero.description ||
    stripHtml(content?.story.content) ||
    "Μάθετε περισσότερα για την Coptex Hellas, τις λύσεις κοπτικού εξοπλισμού και την τεχνική υποστήριξη που προσφέρει.";
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

export default async function AboutPage() {
  const content = await getAboutPageContent();

  if (!content) {
    return null;
  }

  const showcaseImages = content.showcase.images ?? [];
  const expertiseItems = content.expertise.items ?? [];
  const statItems = content.stats.items ?? [];

  return (
    <main className="pb-16 pt-8 sm:pt-10 lg:pt-12">
      <section className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="rounded-[2rem] border border-black/8 bg-[linear-gradient(135deg,#f5efe3_0%,#ffffff_50%,#efe1c0_100%)] p-6 shadow-[0_32px_90px_rgba(39,33,24,0.08)] sm:p-8 lg:p-10">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-black/55">
            <Link href="/" className="hover:text-primary">
              Αρχική
            </Link>
            <span>/</span>
            <span className="font-medium text-black">{content.title}</span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center">
            <div>
              {content.hero.eyebrow ? (
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/75">
                  {content.hero.eyebrow}
                </p>
              ) : null}

              <h2 className="section-title mt-5 max-w-3xl text-4xl font-bold tracking-tight text-[#1d1d1b] sm:text-5xl xl:text-6xl">
                {content.hero.title || content.title}{" "}
                {content.hero.highlight ? (
                  <span className="text-primary">{content.hero.highlight}</span>
                ) : null}
              </h2>

              {content.hero.description ? (
                <p className="mt-6 max-w-2xl text-base leading-8 text-black/68 sm:text-lg">
                  {content.hero.description}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-4">
                {content.hero.primaryButtonLabel && content.hero.primaryButtonUrl ? (
                  <Link
                    href={content.hero.primaryButtonUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-[1rem] bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-hover)]"
                  >
                    {content.hero.primaryButtonLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}

                {content.hero.secondaryButtonLabel && content.hero.secondaryButtonUrl ? (
                  <Link
                    href={content.hero.secondaryButtonUrl}
                    className="inline-flex items-center justify-center rounded-[1rem] border border-black/10 bg-white/80 px-6 py-3 text-sm font-semibold text-[#1f1f1f] transition hover:border-primary hover:text-primary"
                  >
                    {content.hero.secondaryButtonLabel}
                  </Link>
                ) : null}
              </div>

              {content.hero.badge ? (
                <div className="mt-8 inline-flex rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
                  {content.hero.badge}
                </div>
              ) : null}
            </div>

            <div className="relative min-h-[380px] overflow-hidden rounded-[2rem] border border-white/80 bg-[#2a2a2a] shadow-[0_26px_70px_rgba(31,31,31,0.18)]">
              {content.hero.image?.url ? (
                <>
                  <Image
                    src={content.hero.image.url}
                    alt={content.hero.image.alt || content.hero.title || content.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 44vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,20,0.05)_0%,rgba(20,20,20,0.58)_100%)]" />
                </>
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(184,134,46,0.38),_transparent_42%),linear-gradient(135deg,#1d1d1d_0%,#373737_100%)]" />
              )}

              <div className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] border border-white/14 bg-black/35 p-5 text-white backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                  Coptex Hellas
                </p>
                <p className="mt-3 text-lg font-semibold leading-7">
                  Λύσεις για τόρνους, φρέζες CNC και σύγχρονη βιομηχανική παραγωγή.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {content.story.enabled !== false ? (
        <section className="px-4 pt-10 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid gap-6 xl:grid-cols-[minmax(240px,0.7fr)_minmax(0,1.1fr)_minmax(240px,0.7fr)]">
            <div className="relative min-h-[320px] overflow-hidden rounded-[1.75rem] border border-black/8 bg-[#f1ede6] shadow-[0_20px_60px_rgba(39,33,24,0.06)]">
              {content.story.imageLeft?.url ? (
                <Image
                  src={content.story.imageLeft.url}
                  alt={content.story.imageLeft.alt || content.story.title || content.title}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 22vw"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(184,134,46,0.2),transparent_40%),linear-gradient(180deg,#f1ede6_0%,#e6ddce_100%)]" />
              )}
            </div>

            <article className="rounded-[1.75rem] border border-black/8 bg-white px-6 py-8 shadow-[0_20px_60px_rgba(39,33,24,0.06)] sm:px-8 lg:px-10">
              {content.story.eyebrow ? (
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/75">
                  {content.story.eyebrow}
                </p>
              ) : null}
              {content.story.title ? (
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#1d1d1b] sm:text-4xl">
                  {content.story.title}
                </h2>
              ) : null}
              {content.story.content ? (
                <div
                  className="wysiwyg-content mt-6"
                  dangerouslySetInnerHTML={{ __html: content.story.content }}
                />
              ) : null}
            </article>

            <div className="relative min-h-[320px] overflow-hidden rounded-[1.75rem] border border-black/8 bg-[#f1ede6] shadow-[0_20px_60px_rgba(39,33,24,0.06)]">
              {content.story.imageRight?.url ? (
                <Image
                  src={content.story.imageRight.url}
                  alt={content.story.imageRight.alt || content.story.title || content.title}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 22vw"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(184,134,46,0.2),transparent_40%),linear-gradient(180deg,#f1ede6_0%,#e6ddce_100%)]" />
              )}
            </div>
          </div>
        </section>
      ) : null}

      {content.stats.enabled !== false && statItems.length ? (
        <section className="px-4 pt-10 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-[linear-gradient(140deg,#1e1e1e_0%,#2a2a2a_100%)] px-6 py-8 text-white shadow-[0_28px_80px_rgba(31,31,31,0.18)] sm:px-8 lg:px-10">
            <div className="mb-8 max-w-3xl">
              {content.stats.eyebrow ? (
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8bb7c]">
                  {content.stats.eyebrow}
                </p>
              ) : null}
              {content.stats.title ? (
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {content.stats.title}
                </h2>
              ) : null}
              {content.stats.description ? (
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/70">
                  {content.stats.description}
                </p>
              ) : null}
            </div>

            <AboutStatsGrid items={statItems} />
          </div>
        </section>
      ) : null}

      {content.expertise.enabled !== false && expertiseItems.length ? (
        <section className="px-4 pt-10 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="mb-8 max-w-3xl">
            {content.expertise.eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/75">
                {content.expertise.eyebrow}
              </p>
            ) : null}
            {content.expertise.title ? (
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#1d1d1b] sm:text-4xl">
                {content.expertise.title}
              </h2>
            ) : null}
            {content.expertise.description ? (
              <p className="mt-4 max-w-2xl text-base leading-8 text-black/65">
                {content.expertise.description}
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {expertiseItems.map((item, index) => {
              const Icon = resolveIcon(item.iconName);

              return (
                <article
                  key={`${item.title}-${index}`}
                  className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_20px_50px_rgba(39,33,24,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(39,33,24,0.1)]"
                >
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-[1.15rem] bg-primary/12 text-primary">
                    <Icon className="h-7 w-7" />
                  </div>
                  {item.title ? (
                    <h3 className="mt-5 text-xl font-semibold tracking-tight text-[#1d1d1b]">
                      {item.title}
                    </h3>
                  ) : null}
                  {item.description ? (
                    <p className="mt-3 text-sm leading-7 text-black/63">{item.description}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {content.showcase.enabled !== false && showcaseImages.length ? (
        <section className="px-4 pt-10 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="mb-8 max-w-3xl">
            {content.showcase.eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/75">
                {content.showcase.eyebrow}
              </p>
            ) : null}
            {content.showcase.title ? (
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#1d1d1b] sm:text-4xl">
                {content.showcase.title}
              </h2>
            ) : null}
            {content.showcase.description ? (
              <p className="mt-4 max-w-2xl text-base leading-8 text-black/65">
                {content.showcase.description}
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-[1.1fr_0.9fr]">
            {showcaseImages.map((image, index) => (
              <div
                key={`${image.url}-${index}`}
                className={`relative overflow-hidden rounded-[1.75rem] border border-black/8 bg-[#f2ede4] shadow-[0_20px_50px_rgba(39,33,24,0.06)] ${
                  index === 0 ? "md:row-span-2 min-h-[420px]" : "min-h-[280px]"
                }`}
              >
                {image.url ? (
                  <Image
                    src={image.url}
                    alt={image.alt || content.showcase.title || content.title}
                    fill
                    unoptimized
                    className="object-cover transition duration-500 hover:scale-[1.03]"
                    sizes="(max-width: 1280px) 100vw, 40vw"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {content.contact.enabled !== false ? (
        <section className="px-4 pt-10 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid gap-6 rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_28px_80px_rgba(39,33,24,0.08)] sm:p-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.8fr)] lg:p-10">
            <div>
              {content.contact.eyebrow ? (
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/75">
                  {content.contact.eyebrow}
                </p>
              ) : null}
              {content.contact.title ? (
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#1d1d1b] sm:text-4xl">
                  {content.contact.title}
                </h2>
              ) : null}
              {content.contact.description ? (
                <p className="mt-4 max-w-2xl text-base leading-8 text-black/65">
                  {content.contact.description}
                </p>
              ) : null}

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {content.contact.phone ? (
                  <Link
                    href={detailHref("phone", content.contact.phone)}
                    className="rounded-[1.25rem] border border-black/8 bg-[#faf7f1] p-5 transition hover:border-primary/40"
                  >
                    <Phone className="h-5 w-5 text-primary" />
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                      Τηλέφωνο
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#1d1d1b]">{content.contact.phone}</p>
                  </Link>
                ) : null}

                {content.contact.email ? (
                  <Link
                    href={detailHref("email", content.contact.email)}
                    className="rounded-[1.25rem] border border-black/8 bg-[#faf7f1] p-5 transition hover:border-primary/40"
                  >
                    <Mail className="h-5 w-5 text-primary" />
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                      Email
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#1d1d1b] break-all">
                      {content.contact.email}
                    </p>
                  </Link>
                ) : null}

                {content.contact.address ? (
                  <div className="rounded-[1.25rem] border border-black/8 bg-[#faf7f1] p-5">
                    <MapPin className="h-5 w-5 text-primary" />
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                      Διεύθυνση
                    </p>
                    <p className="mt-2 whitespace-pre-line text-lg font-semibold leading-8 text-[#1d1d1b]">
                      {content.contact.address}
                    </p>
                  </div>
                ) : null}

                {content.contact.workingHours ? (
                  <div className="rounded-[1.25rem] border border-black/8 bg-[#faf7f1] p-5">
                    <Settings2 className="h-5 w-5 text-primary" />
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                      Ωράριο
                    </p>
                    <p className="mt-2 whitespace-pre-line text-lg font-semibold leading-8 text-[#1d1d1b]">
                      {content.contact.workingHours}
                    </p>
                  </div>
                ) : null}
              </div>

              {content.contact.buttonLabel && content.contact.buttonUrl ? (
                <div className="mt-8">
                  <Link
                    href={content.contact.buttonUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-[1rem] bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-hover)]"
                  >
                    {content.contact.buttonLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-[#1f1f1f]">
              {content.contact.mapEmbedUrl ? (
                <iframe
                  src={content.contact.mapEmbedUrl}
                  className="h-full min-h-[420px] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Coptex map"
                />
              ) : (
                <div className="flex min-h-[420px] items-end bg-[radial-gradient(circle_at_top,_rgba(184,134,46,0.32),_transparent_38%),linear-gradient(135deg,#1f1f1f_0%,#363636_100%)] p-6">
                  <div className="max-w-sm rounded-[1.25rem] border border-white/10 bg-white/8 p-5 text-white backdrop-blur">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/68">
                      Coptex Hellas
                    </p>
                    <p className="mt-3 text-lg font-semibold leading-8">
                      Προσθέστε το `Map Embed URL` στο WordPress για να εμφανιστεί ο χάρτης εδώ.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
