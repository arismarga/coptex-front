"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type ProductImage = {
  id: number;
  src: string;
  thumbnail?: string;
  alt?: string;
};

type Props = {
  images: ProductImage[];
  productName: string;
};

export default function ProductImageGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const resolvedActiveIndex = Math.min(activeIndex, Math.max(images.length - 1, 0));

  const activeImage = images[resolvedActiveIndex] ?? null;
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (!hasMultipleImages) {
        return;
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current + 1) % images.length);
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => (current - 1 + images.length) % images.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [hasMultipleImages, images.length, lightboxOpen]);

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };

  if (!activeImage) {
    return <div className="flex h-full items-center justify-center text-sm text-black/35">Δεν υπάρχει εικόνα</div>;
  }

  return (
    <>
      <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="group relative block flex-1 overflow-hidden rounded-[1.4rem] bg-white/45 text-left"
          aria-label="Άνοιγμα εικόνας προϊόντος"
        >
          <div className="relative aspect-square min-h-[360px] lg:h-full lg:min-h-[420px] lg:aspect-auto">
            <Image
              src={activeImage.src}
              alt={activeImage.alt || productName}
              fill
              unoptimized
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <span className="absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white/90 backdrop-blur transition group-hover:bg-black/82">
            <Search className="h-4.5 w-4.5" />
          </span>
        </button>

        {hasMultipleImages ? (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5">
            {images.map((image, index) => {
              const isActive = index === resolvedActiveIndex;

              return (
                <button
                  key={`${image.id}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative overflow-hidden rounded-[1rem] border bg-white transition ${
                    isActive
                      ? "border-primary shadow-[0_10px_25px_rgba(167,118,43,0.18)]"
                      : "border-black/8 hover:border-primary/35"
                  }`}
                  aria-label={`Επιλογή εικόνας ${index + 1}`}
                  aria-pressed={isActive}
                >
                  <div className="relative aspect-square">
                    <Image
                      src={image.thumbnail || image.src}
                      alt={image.alt || `${productName} ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="120px"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/82 backdrop-blur-sm"
            aria-label="Κλείσιμο προβολής εικόνας"
            onClick={() => setLightboxOpen(false)}
          />

          <div className="relative z-[1] flex w-full max-w-6xl items-center justify-center">
            {hasMultipleImages ? (
              <button
                type="button"
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 z-[2] inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-black shadow-lg transition hover:bg-white sm:left-4"
                aria-label="Προηγούμενη εικόνα"
              >
                ‹
              </button>
            ) : null}

            <div className="relative w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-black shadow-2xl">
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="absolute right-3 top-3 z-[2] inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-xl text-white/90 transition hover:bg-black/80"
                aria-label="Κλείσιμο"
              >
                ×
              </button>

              <div className="relative aspect-[4/3] max-h-[82vh] min-h-[320px] w-full">
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt || productName}
                  fill
                  unoptimized
                  className="object-contain"
                  sizes="100vw"
                />
              </div>

              {hasMultipleImages ? (
                <div className="flex items-center justify-center gap-2 border-t border-white/10 bg-black/70 px-4 py-4">
                  {images.map((image, index) => (
                    <button
                      key={`lightbox-${image.id}-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`relative overflow-hidden rounded-[0.9rem] border ${
                        index === resolvedActiveIndex ? "border-primary" : "border-white/10"
                      }`}
                      aria-label={`Εικόνα ${index + 1}`}
                    >
                      <div className="relative h-14 w-14 sm:h-16 sm:w-16">
                        <Image
                          src={image.thumbnail || image.src}
                          alt={image.alt || `${productName} ${index + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {hasMultipleImages ? (
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-2 top-1/2 z-[2] inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-black shadow-lg transition hover:bg-white sm:right-4"
                aria-label="Επόμενη εικόνα"
              >
                ›
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
