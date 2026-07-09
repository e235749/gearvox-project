import Link from "next/link";
import {
  IconBell,
  IconHome,
  IconPlus,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";

const navItems = [
  { href: "/", label: "ホーム", icon: IconHome },
  { href: "/search", label: "検索", icon: IconSearch },
  { href: "/reviews/new", label: "投稿", icon: IconPlus, isFab: true },
  { href: "/notifications", label: "通知", icon: IconBell },
  { href: "/profile", label: "マイページ", icon: IconUser },
] as const;

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col">
      <main className="flex-1 px-4 pb-24 pt-6">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-surface">
        <ul className="mx-auto flex max-w-lg items-end justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            if ("isFab" in item && item.isFab) {
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    className="flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-accent text-background shadow-lg"
                  >
                    <Icon size={28} stroke={1.75} />
                  </Link>
                </li>
              );
            }
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex flex-col items-center gap-1 px-3 py-2 text-muted transition-colors hover:text-accent"
                >
                  <Icon size={24} stroke={1.5} />
                  <span className="text-xs">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
