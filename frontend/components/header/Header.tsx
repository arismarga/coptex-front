"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import SearchOverlay from "./SearchOverlay";
import type { NavItem } from "./NavLinks";

type Props = {
  innerClassName?: string;
  items: NavItem[];
  logoText?: string;
  logoUrl?: string | null;
  logoAlt?: string | null;
  logoWidth?: number | null;
  logoHeight?: number | null;
};

type DesktopMenuColumn = {
  parent: NavItem;
  items: NavItem[];
};

function itemHasActivePath(item: NavItem, pathname: string): boolean {
  if (pathname === item.href) return true;
  if (!item.children?.length) return false;
  return item.children.some((child) => itemHasActivePath(child, pathname));
}

function findActiveTrail(items: NavItem[], pathname: string, trail: string[] = []): string[] {
  for (const item of items) {
    const nextTrail = [...trail, item.href];

    if (pathname === item.href) {
      return nextTrail;
    }

    if (item.children?.length) {
      const nestedTrail = findActiveTrail(item.children, pathname, nextTrail);
      if (nestedTrail.length) {
        return nestedTrail;
      }
    }
  }

  return [];
}

function buildInitialDesktopTrail(item: NavItem, pathname: string): string[] {
  const activeTrail = findActiveTrail(item.children ?? [], pathname);
  if (activeTrail.length) {
    return activeTrail.slice(0, 1);
  }

  return [];
}

function buildDesktopColumns(item: NavItem, trail: string[]): DesktopMenuColumn[] {
  const columns: DesktopMenuColumn[] = [];
  let currentParent = item;

  while (currentParent.children?.length) {
    columns.push({
      parent: currentParent,
      items: currentParent.children,
    });

    const selectedHref = trail[columns.length - 1];

    if (!selectedHref) {
      break;
    }

    const nextParent = currentParent.children.find((child) => child.href === selectedHref);
    if (!nextParent?.children?.length) {
      break;
    }

    currentParent = nextParent;
  }

  return columns;
}

export default function Header({
  innerClassName = "",
  items,
  logoText,
  logoUrl,
  logoAlt,
  logoWidth,
  logoHeight,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [desktopOpenHref, setDesktopOpenHref] = useState<string | null>(null);
  const [desktopTrail, setDesktopTrail] = useState<string[]>([]);
  const headerRef = useRef<HTMLElement | null>(null);
  const desktopNavRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const setHeaderVar = () => {
      const h = headerRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--header-h", `${h}px`);
    };
    setHeaderVar();
    window.addEventListener("resize", setHeaderVar);
    return () => window.removeEventListener("resize", setHeaderVar);
  }, []);

  useEffect(() => {
    if (!open && !searchOpen) return;

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      const top = document.body.style.top;

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      const restoredY = top ? Math.abs(parseInt(top, 10)) : 0;
      window.scrollTo(0, restoredY);
    };
  }, [open, searchOpen]);

  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;

    const id = window.setTimeout(() => {
      setOpen(false);
      setDesktopOpenHref(null);
      setSearchOpen(false);
    }, 0);

    return () => window.clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setDesktopOpenHref(null);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!desktopNavRef.current?.contains(event.target as Node)) {
        setDesktopOpenHref(null);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

  const navItems = useMemo(() => items, [items]);
  const desktopOpenItem =
    navItems.find((item) => item.href === desktopOpenHref && item.children?.length) ?? null;
  const desktopColumns = desktopOpenItem
    ? buildDesktopColumns(desktopOpenItem, desktopTrail)
    : [];

  const isActive = (item: NavItem) => itemHasActivePath(item, pathname);

  const openDesktopMenu = (item: NavItem) => {
    if (!item.children?.length) {
      setDesktopOpenHref(null);
      return;
    }

    setDesktopOpenHref((current) => {
      if (current === item.href) {
        return null;
      }

      setDesktopTrail(buildInitialDesktopTrail(item, pathname));
      return item.href;
    });
  };

  const selectDesktopItem = (level: number, item: NavItem) => {
    setDesktopTrail((current) => {
      const nextTrail = current.slice(0, level);
      nextTrail[level] = item.href;
      return nextTrail;
    });
  };

  const openSearch = () => {
    setOpen(false);
    setDesktopOpenHref(null);
    setSearchOpen(true);
  };

  return (
    <header
      ref={headerRef}
      className={[
        "sticky top-0 z-50 w-full",
        "bg-white/70 backdrop-blur transition-shadow duration-200",
        isSticky
          ? "border-b border-black/10 shadow-sm"
          : "border-b border-transparent shadow-none",
      ].join(" ")}
    >
      <div className={["w-full", innerClassName].join(" ")}>
        <div className="flex items-center justify-between py-4">
          <Logo
            text={logoText}
            logoUrl={logoUrl}
            logoAlt={logoAlt}
            logoWidth={logoWidth}
            logoHeight={logoHeight}
          />

          <div ref={desktopNavRef} className="relative hidden min-[992px]:block">
            <nav>
              <ul className="flex items-center justify-end gap-1">
                {navItems.map((item) => {
                  const active = isActive(item);
                  const hasChildren = Boolean(item.children?.length);
                  const isDesktopOpen = desktopOpenHref === item.href;

                  if (!hasChildren) {
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={[
                            "rounded-xl px-3 py-2 transition-colors",
                            "text-(length:--menu-size)",
                            active
                              ? "text-primary font-semibold"
                              : "text-black hover:text-primary",
                          ].join(" ")}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li key={item.href}>
                      <button
                        type="button"
                        className={[
                          "inline-flex items-center gap-2 rounded-xl px-3 py-2 transition-colors",
                          "text-(length:--menu-size)",
                          active || isDesktopOpen
                            ? "text-primary font-semibold"
                            : "text-black hover:text-primary",
                        ].join(" ")}
                        aria-expanded={isDesktopOpen}
                        onClick={() => openDesktopMenu(item)}
                      >
                        <span>{item.label}</span>
                        <span
                          className={[
                            "text-sm translate-y-px opacity-70 transition-transform",
                            isDesktopOpen ? "rotate-180" : "",
                          ].join(" ")}
                        >
                          ▾
                        </span>
                      </button>
                    </li>
                  );
                })}

                <li>
                  <button
                    type="button"
                    onClick={openSearch}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-black transition hover:text-primary"
                    aria-label="Άνοιγμα αναζήτησης"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" />
                    </svg>
                  </button>
                </li>
              </ul>
            </nav>

            {desktopOpenItem ? (
              <div className="header-desktop-menu fixed left-1/2 z-50 pt-4 -translate-x-1/2">
                <div className="overflow-hidden rounded-[0.5rem] border border-black/10 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
                  <div className="header-desktop-menu__columns">
                    {desktopColumns.map((column, level) => {
                      const selectedHref = desktopTrail[level] ?? null;

                      return (
                        <div
                          key={`${column.parent.href}-${level}`}
                          className="header-desktop-menu__column min-h-[340px] border-r border-black/6 bg-white last:border-r-0"
                        >
                          <div className="border-b border-black/6 px-6 py-5">
                            <Link
                              href={column.parent.href}
                              className="text-base font-semibold text-primary hover:opacity-80"
                              onClick={() => setDesktopOpenHref(null)}
                            >
                              Όλα για: {column.parent.label}
                            </Link>
                          </div>

                          <ul className="px-3 py-3">
                            {column.items.map((child) => {
                              const childActive = itemHasActivePath(child, pathname);
                              const childSelected = selectedHref === child.href;

                              if (child.children?.length) {
                                return (
                                  <li key={child.href}>
                                    <button
                                      type="button"
                                      className={[
                                        "flex w-full items-center justify-between gap-4 rounded-2xl px-3 py-3 text-left transition-colors",
                                        childSelected || childActive
                                          ? "bg-black/5 text-primary"
                                          : "text-black hover:bg-black/5 hover:text-primary",
                                      ].join(" ")}
                                      onClick={() => selectDesktopItem(level, child)}
                                    >
                                      <span>{child.label}</span>
                                      <span className="text-base opacity-60">▸</span>
                                    </button>
                                  </li>
                                );
                              }

                              return (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    className={[
                                      "block rounded-2xl px-3 py-3 transition-colors",
                                      childActive
                                        ? "bg-black/5 text-primary font-semibold"
                                        : "text-black hover:bg-black/5 hover:text-primary",
                                    ].join(" ")}
                                    onClick={() => setDesktopOpenHref(null)}
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 min-[992px]:hidden">
            <button
              type="button"
              onClick={openSearch}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border"
              aria-label="Άνοιγμα αναζήτησης"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-4 w-5">
                <span
                  className={[
                    "absolute left-0 top-0 block h-0.5 w-full bg-black transition",
                    open ? "translate-y-1.5 rotate-45" : "",
                  ].join(" ")}
                />
                <span
                  className={[
                    "absolute left-0 top-1.5 block h-0.5 w-full bg-black transition",
                    open ? "opacity-0" : "",
                  ].join(" ")}
                />
                <span
                  className={[
                    "absolute left-0 top-3 block h-0.5 w-full bg-black transition",
                    open ? "-translate-y-1.5 -rotate-45" : "",
                  ].join(" ")}
                />
              </span>
            </button>
          </div>
        </div>

        <MobileMenu open={open} items={navItems} onClose={() => setOpen(false)} />
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </header>
  );
}
