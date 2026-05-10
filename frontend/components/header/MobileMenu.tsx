"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { NavItem } from "./NavLinks";

type Props = {
  open: boolean;
  items: NavItem[];
  onClose: () => void;
};

type MobileMenuBranchProps = {
  items: NavItem[];
  pathname: string;
  onClose: () => void;
  openKeys: string[];
  setOpenKeys: Dispatch<SetStateAction<string[]>>;
  depth?: number;
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
      const childTrail = findActiveTrail(item.children, pathname, nextTrail);
      if (childTrail.length) {
        return childTrail;
      }
    }
  }

  return [];
}

function MobileMenuBranch({
  items,
  pathname,
  onClose,
  openKeys,
  setOpenKeys,
  depth = 0,
}: MobileMenuBranchProps) {
  return (
    <ul className={["flex flex-col gap-1", depth > 0 ? "pb-2" : ""].join(" ")}>
      {items.map((item) => {
        const active = itemHasActivePath(item, pathname);
        const hasChildren = Boolean(item.children?.length);

        if (!hasChildren) {
          return (
            <li key={`${depth}-${item.href}-${item.label}`}>
              <Link
                href={item.href}
                onClick={onClose}
                className={[
                  "block rounded-xl px-4 py-3 transition-colors",
                  depth === 0 ? "text-(length:--menu-size)" : "text-base",
                  active
                    ? "text-primary font-semibold bg-black/5"
                    : "text-black hover:text-primary hover:bg-black/5",
                ].join(" ")}
              >
                {item.label}
              </Link>
            </li>
          );
        }

        const expanded = openKeys.includes(item.href);

        return (
          <li key={`${depth}-${item.href}-${item.label}`} className="rounded-2xl">
            <button
              type="button"
              className={[
                "w-full flex items-center justify-between rounded-xl px-4 py-3 transition-colors",
                depth === 0 ? "text-(length:--menu-size)" : "text-base",
                active
                  ? "text-primary font-semibold"
                  : "text-black hover:text-primary",
              ].join(" ")}
              aria-expanded={expanded}
              onClick={() =>
                setOpenKeys((keys) =>
                  expanded ? keys.filter((key) => key !== item.href) : [...keys, item.href],
                )
              }
            >
              <span>{item.label}</span>
              <span
                className={[
                  "text-sm opacity-70 transition-transform",
                  expanded ? "rotate-180" : "",
                ].join(" ")}
              >
                ▾
              </span>
            </button>

            <div
              className={[
                "grid transition-[grid-template-rows] duration-200",
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              ].join(" ")}
            >
              <div className="overflow-hidden">
                <div className={depth === 0 ? "pl-3" : "pl-4"}>
                  <MobileMenuBranch
                    items={item.children ?? []}
                    pathname={pathname}
                    onClose={onClose}
                    openKeys={openKeys}
                    setOpenKeys={setOpenKeys}
                    depth={depth + 1}
                  />
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function MobileMenu({ open, items, onClose }: Props) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const isActive = useMemo(() => {
    return (item: NavItem) => itemHasActivePath(item, pathname);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    panelRef.current?.scrollTo({ top: 0 });

    const nextKeys = findActiveTrail(items, pathname).slice(0, -1);
    const id = window.setTimeout(() => setOpenKeys(nextKeys), 0);
    return () => window.clearTimeout(id);
  }, [open, items, isActive, pathname]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="mobile-menu-backdrop fixed left-0 right-0 bottom-0 z-40 min-[992px]:hidden bg-black/20"
      />

      <div
        ref={panelRef}
        className="mobile-menu-panel fixed left-0 right-0 bottom-0 z-40 overflow-y-auto bg-white min-[992px]:hidden"
      >
        <div className="px-4 sm:px-6 py-4">
          <nav>
            <MobileMenuBranch
              items={items}
              pathname={pathname}
              onClose={onClose}
              openKeys={openKeys}
              setOpenKeys={setOpenKeys}
            />
          </nav>
        </div>
      </div>
    </>
  );
}
