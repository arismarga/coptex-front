"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import type { BrandItem } from "@/lib/wp/brands";

type Props = {
  brands: BrandItem[];
};

export default function BrandsCarousel({ brands }: Props) {
  if (!brands.length) {
    return null;
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      <div className="brands-carousel-shell group relative w-full overflow-hidden rounded-[0.5rem] border border-black/8 px-5 py-6 shadow-sm sm:px-6 lg:px-7">
        <div className="relative">
          <button
            type="button"
            className="carousel-btn brands-carousel-prev brands-carousel-nav absolute left-[-18px] top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-white/96 text-primary shadow-sm"
            aria-label="Previous brands"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="carousel-btn brands-carousel-next brands-carousel-nav absolute right-[-18px] top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-white/96 text-primary shadow-sm"
            aria-label="Next brands"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <Swiper
            modules={[Autoplay, Navigation]}
            loop
            speed={700}
            autoplay={{
              delay: 2400,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: ".brands-carousel-prev",
              nextEl: ".brands-carousel-next",
            }}
            spaceBetween={18}
            breakpoints={{
              0: { slidesPerView: 2 },
              640: { slidesPerView: 3 },
              900: { slidesPerView: 4 },
              1200: { slidesPerView: 5 },
              1500: { slidesPerView: 6 },
            }}
          >
            {brands.map((brand) => {
              const content = (
                <div className="brands-carousel-card flex h-[104px] items-center justify-center rounded-[0.5rem] border border-black/8 bg-white px-6 py-5">
                  {brand.image?.url ? (
                    <Image
                      src={brand.image.url}
                      alt={brand.image.alt || brand.name}
                      width={180}
                      height={72}
                      unoptimized
                      className="max-h-12 w-auto max-w-full object-contain opacity-90 transition duration-200 group-hover:opacity-100"
                    />
                  ) : (
                    <span className="text-center text-sm font-semibold text-black/65">{brand.name}</span>
                  )}
                </div>
              );

              return (
                <SwiperSlide key={brand.id} className="h-auto">
                {brand.slug ? (
                  <Link href={`/shop?brands=${encodeURIComponent(brand.slug)}`} className="block h-full">
                    {content}
                  </Link>
                ) : (
                    content
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
