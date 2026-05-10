import Image from "next/image";

type HomepageImage = {
  url?: string | null;
  alt?: string | null;
};

type Props = {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  backgroundImage?: HomepageImage | null;
};

export default function HomepageCtaSection({
  eyebrow,
  title,
  description,
  buttonLabel,
  buttonUrl,
  backgroundImage,
}: Props) {
  if (!title && !description) {
    return null;
  }

  return (
    <section className="px-4 py-8 pb-14 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 cta-section">
      <div className="w-full">
        <div className="homepage-cta relative overflow-hidden rounded-[0.5rem] border border-black/8 px-6 py-10 text-white sm:px-8 lg:px-12 lg:py-14">
          {backgroundImage?.url ? (
            <>
              <Image
                src={backgroundImage.url}
                alt={backgroundImage.alt || title || "CTA background"}
                fill
                unoptimized
                className="object-cover opacity-24"
                sizes="100vw"
              />
              <div className="homepage-cta__image-overlay absolute inset-0" />
            </>
          ) : (
            <div className="homepage-cta__bg absolute inset-0" />
          )}

          <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-3xl">
              {eyebrow ? (
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                  {eyebrow}
                </p>
              ) : null}

              {title ? <h2 className="section-title mt-4 text-4xl font-bold text-white">{title}</h2> : null}

              {description ? (
                <p className="mt-5 text-base leading-7 text-white/78">{description}</p>
              ) : null}
            </div>

            {buttonLabel && buttonUrl ? (
              <div>
                <a
                  href={buttonUrl}
                  className="homepage-cta__button inline-flex items-center justify-center rounded-[1rem] bg-white px-6 py-3 text-sm font-semibold text-[#30302f] hover:bg-primary hover:text-white"
                >
                  {buttonLabel}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
