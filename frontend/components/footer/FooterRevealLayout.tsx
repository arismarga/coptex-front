"use client";

import React, { useEffect, useRef, useState } from "react";
import Footer from "./Footer";
import type { FooterSidebar } from "@/lib/wp/footer";
import BrandsCarousel from "@/components/sections/BrandsCarousel";
import type { BrandItem } from "@/lib/wp/brands";

export default function FooterRevealLayout({
  children,
  sidebars,
  brands,
}: {
  children: React.ReactNode;
  sidebars: FooterSidebar[];
  brands: BrandItem[];
}) {
  const footerRef = useRef<HTMLElement | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const [footerH, setFooterH] = useState(0);

  useEffect(() => {
    spacerRef.current?.style.setProperty("--footer-reveal-h", `${footerH}px`);
  }, [footerH]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");

    let ro: ResizeObserver | null = null;

    const setup = () => {
      if (!mq.matches) {
        setFooterH(0);
        return;
      }

      const el = footerRef.current;
      if (!el) return;

      const read = () => {
        const next = Math.round(el.getBoundingClientRect().height);
        setFooterH((prev) => (prev === next ? prev : next));
      };

      ro = new ResizeObserver(() => requestAnimationFrame(read));
      ro.observe(el);

      requestAnimationFrame(read);
    };

    setup();
    mq.addEventListener("change", setup);

    return () => {
      mq.removeEventListener("change", setup);
      ro?.disconnect();
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Layer πάνω από το footer, αλλά click-through by default */}
      <div className="relative z-10 pointer-events-none">
        {/* Το πραγματικό content παραμένει clickable */}
        <div className="pointer-events-auto bg-white">
          {children}
          <BrandsCarousel brands={brands} />
        </div>

        {/* Spacer: δεν πιάνει clicks, αφήνει να πατηθεί το footer από κάτω */}
        <div ref={spacerRef} aria-hidden className="footer-reveal-spacer hidden md:block" />
      </div>

      {/* Footer πίσω για reveal */}
      <Footer ref={footerRef} sidebars={sidebars} />
    </div>
  );
}
