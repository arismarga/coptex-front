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
  leftImage?: HomepageImage | null;
  rightImage?: HomepageImage | null;
};

export default function HomepageAboutSection({
  eyebrow,
  title,
  description,
  buttonLabel,
  buttonUrl,
  leftImage,
  rightImage,
}: Props) {
  if (!title && !description && !leftImage?.url && !rightImage?.url) {
    return null;
  }

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 about-section">
      <div className="grid gap-6 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.1fr)_minmax(220px,0.8fr)]">
        <div className="homepage-about-media relative min-h-[360px] overflow-hidden rounded-[0.5rem] border border-black/8 shadow-sm">
          {leftImage?.url ? (
            <Image
              src={leftImage.url}
              alt={leftImage.alt || title || "About image"}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 25vw"
            />
          ) : (
            <div className="homepage-about-media__placeholder homepage-about-media__placeholder--top h-full w-full" />
          )}
        </div>

        <div className="homepage-about-panel flex flex-col justify-center rounded-[0.5rem] border border-black/8 px-6 py-10 text-center shadow-sm sm:px-8 lg:px-10">
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/75">
              {eyebrow}
            </p>
          ) : null}

          {title ? <h2 className="section-title mt-4 text-4xl font-bold text-black">{title}</h2> : null}

          {description ? (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-black/65">
              {description}
            </p>
          ) : null}

          {buttonLabel && buttonUrl ? (
            <div className="mt-7">
              <a
                href={buttonUrl}
                className="homepage-about-button inline-flex items-center justify-center rounded-[1rem] border border-primary/15 bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-[color:var(--brand-hover)] hover:text-white"
              >
                {buttonLabel}
              </a>
            </div>
          ) : null}
        </div>

        <div className="homepage-about-media relative min-h-[360px] overflow-hidden rounded-[0.5rem] border border-black/8 shadow-sm">
          {rightImage?.url ? (
            <Image
              src={rightImage.url}
              alt={rightImage.alt || title || "About image"}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 25vw"
            />
          ) : (
            <div className="homepage-about-media__placeholder homepage-about-media__placeholder--bottom h-full w-full" />
          )}
        </div>
      </div>
    </section>
  );
}
