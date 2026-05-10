"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type StatItem = {
  number?: string | null;
  suffix?: string | null;
  label?: string | null;
  description?: string | null;
};

function parseNumber(value?: string | null) {
  const normalized = value?.replace(/[^\d]/g, "") ?? "";

  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function AnimatedNumber({
  value,
  suffix,
  active,
}: {
  value?: string | null;
  suffix?: string | null;
  active: boolean;
}) {
  const parsedValue = useMemo(() => parseNumber(value), [value]);
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!active || parsedValue === null) {
      return;
    }

    const duration = 1200;
    const start = performance.now();

    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(parsedValue * eased);
      setDisplayValue(String(current));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [active, parsedValue, value]);

  return (
    <span>
      {active && parsedValue !== null ? displayValue : value ?? "0"}
      {suffix ?? ""}
    </span>
  );
}

export default function AboutStatsGrid({ items }: { items: StatItem[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (!items.length) {
    return null;
  }

  return (
    <div ref={ref} className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <article
          key={`${item.label}-${index}`}
          className="rounded-[1.75rem] border border-white/55 bg-white/85 p-6 shadow-[0_20px_55px_rgba(39,33,24,0.08)] backdrop-blur"
        >
          <div className="text-4xl font-bold tracking-tight text-[#1f1f1f] sm:text-5xl">
            <AnimatedNumber value={item.number} suffix={item.suffix} active={isActive} />
          </div>
          {item.label ? <h3 className="mt-4 text-lg font-semibold text-[#262626]">{item.label}</h3> : null}
          {item.description ? (
            <p className="mt-3 text-sm leading-6 text-black/60">{item.description}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
