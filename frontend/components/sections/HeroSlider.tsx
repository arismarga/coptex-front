"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Slide } from "@/lib/wp/types";

type HeroSliderProps = {
  slides: Slide[];
};

function splitTitle(title: string): string[] {
  if (!title) return [];
  if (title.includes("|")) {
    return title.split("|").map((s) => s.trim()).filter(Boolean);
  }
  return [title];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  if (slides.length === 0) return null;

  return (
    <section className="hero-slider">
      <Swiper
        modules={[Autoplay, Navigation]}
        slidesPerView={1}
        loop
        autoplay={{ delay: 4500, disableOnInteraction: true }}
        navigation={{
          prevEl: ".hero-slide__arrow--prev",
          nextEl: ".hero-slide__arrow--next",
        }}
      >
        {slides.map((slide) => {
          const titleLines = splitTitle(slide.title);
          const ctaLabel = slide.ctaLabel?.trim();
          const ctaUrl = slide.ctaUrl?.trim();
          const ctaNewTab = Boolean(slide.ctaNewTab);

          return (
            <SwiperSlide key={slide.id}>
              <div className="hero-slide">
                {slide.imageUrl ? (
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title || "Hero slide"}
                    fill
                    priority
                    sizes="100vw"
                    unoptimized
                    className="hero-slide__image"
                  />
                ) : null}

                <div className="hero-slide__overlay" />

                <div className="hero-slide__container">
                  <div className="hero-slide__panel">
                    <h3 className="hero-slide__title">
                      {titleLines.map((line, index) => (
                        <span
                          key={index}
                          className={
                            index === 1
                              ? "hero-slide__title-line hero-slide__title-line--highlight"
                              : "hero-slide__title-line"
                          }
                        >
                          {line}
                        </span>
                      ))}
                    </h3>

                    {slide.excerptHtml ? (
                      <div
                        className="hero-slide__text"
                        dangerouslySetInnerHTML={{
                          __html: slide.excerptHtml,
                        }}
                      />
                    ) : null}

                    {ctaLabel && ctaUrl ? (
                      <a
                        href={ctaUrl}
                        className="hero-slide__cta"
                        target={ctaNewTab ? "_blank" : undefined}
                        rel={ctaNewTab ? "noopener noreferrer" : undefined}
                      >
                        {ctaLabel}
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="hero-slide__arrows">
                  <button
                    className="hero-slide__arrow hero-slide__arrow--prev"
                    aria-label="Previous slide"
                    type="button"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    className="hero-slide__arrow hero-slide__arrow--next"
                    aria-label="Next slide"
                    type="button"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}