"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { getFrontendProductPath, getProductDisplayPrice, type WooProduct } from "@/lib/wp/store";

type Props = {
  sliderId: string;
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  products: WooProduct[];
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

function MachineCard({ product }: { product: WooProduct }) {
  const image = product.images[0];
  const productPath = getFrontendProductPath(product);
  const displayPrice = getProductDisplayPrice(product);

  return (
    <article className="machine-card flex h-full flex-col overflow-hidden border border-black/8 bg-white">
      <Link href={productPath} className="block">
        <div className="machine-card__media relative overflow-hidden">
          {image?.src ? (
            <Image
              src={image.src}
              alt={decodeHtml(image.alt || product.name)}
              fill
              unoptimized
              className="object-contain p-6 transition duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 1280px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-black/35">
              Δεν υπάρχει εικόνα
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <div className="min-h-[3.5rem]">
          <Link href={productPath} className="block">
            <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-[#1f2430]">
              {decodeHtml(product.name)}
            </h3>
          </Link>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <span className="text-xs text-black/55">(χωρίς Φ.Π.Α.)</span>

          <div className="flex shrink-0 items-end gap-1.5 whitespace-nowrap">
            <span className="pb-0.5 text-[12px] font-medium text-black/45">από</span>
            <div className="text-right text-2xl font-semibold text-primary">
              {displayPrice.amount}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HomepageMachinesSlider({
  sliderId,
  eyebrow,
  title,
  buttonLabel,
  buttonUrl,
  products,
}: Props) {
  if (!products.length) {
    return null;
  }

  const prevClass = `${sliderId}-prev`;
  const nextClass = `${sliderId}-next`;

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      <div className="homepage-machines-shell w-full">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/75">
                {eyebrow}
              </p>
            ) : null}

            {title ? <h2 className="section-title mt-4 text-black">{title}</h2> : null}
          </div>

          <div className="flex items-center gap-3">
            {buttonLabel && buttonUrl ? (
              <Link
                href={buttonUrl}
                className="inline-flex items-center justify-center rounded-[1rem] border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm hover:border-primary hover:bg-primary hover:text-white"
              >
                {buttonLabel}
              </Link>
            ) : null}

            <button
              type="button"
              className={`carousel-btn ${prevClass} inline-flex h-12 w-12 items-center justify-center rounded-[1rem] border border-primary bg-white text-primary hover:bg-primary hover:text-white`}
              aria-label="Previous machines"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              className={`carousel-btn ${nextClass} inline-flex h-12 w-12 items-center justify-center rounded-[1rem] border border-primary bg-white text-primary hover:bg-primary hover:text-white`}
              aria-label="Next machines"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Navigation]}
          loop
          navigation={{
            prevEl: `.${prevClass}`,
            nextEl: `.${nextClass}`,
          }}
          spaceBetween={22}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 },
            1500: { slidesPerView: 4 },
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="h-auto pb-2">
              <div className="h-full">
                <MachineCard product={product} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
