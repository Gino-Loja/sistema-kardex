"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  href: string;
  label: string;
  description?: string;
};

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export const SidebarNav = ({ items }: { items: NavItem[] }) => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col rounded-xl px-3 py-2 text-sm transition ${
              isActive
                ? "bg-neutral-900 text-white shadow-sm"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            <span className="font-medium">{item.label}</span>
            {item.description ? (
              <span
                className={`text-xs ${
                  isActive ? "text-neutral-200" : "text-neutral-500"
                }`}
              >
                {item.description}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
};

export const MobileNav = ({ items }: { items: NavItem[] }) => {
  const pathname = usePathname();

  return (
    <details className="relative md:hidden">
      <summary className="cursor-pointer list-none rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm">
        Menu
      </summary>
      <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg">
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </details>
  );
};
