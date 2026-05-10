"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "@/components/shop/ProductCard";
import type { WooProduct } from "@/lib/wp/store";

type Props = {
  products: WooProduct[];
};

export default function HomepageProductsCarousel({ products }: Props) {
  if (!products.length) {
    return null;
  }

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-end gap-3">
        <button
          type="button"
          className="carousel-btn homepage-products-prev inline-flex h-12 w-12 items-center justify-center rounded-[1rem] border border-black/10 bg-white text-black shadow-sm hover:border-primary hover:text-primary"
          aria-label="Previous products"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="carousel-btn homepage-products-next inline-flex h-12 w-12 items-center justify-center rounded-[1rem] border border-black/10 bg-white text-black shadow-sm hover:border-primary hover:text-primary"
          aria-label="Next products"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <Swiper
        modules={[Navigation]}
        loop
        navigation={{
          prevEl: ".homepage-products-prev",
          nextEl: ".homepage-products-next",
        }}
        spaceBetween={24}
        breakpoints={{
          0: {
            slidesPerView: 1,
          },
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
          1280: {
            slidesPerView: 4,
          },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="h-auto pb-2">
            <div className="h-full">
              <ProductCard product={product} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
