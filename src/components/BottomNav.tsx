"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Today", icon: "📋" },
  { href: "/meals", label: "Meals", icon: "🍽️" },
  { href: "/train", label: "Train", icon: "🏋️" },
  { href: "/log", label: "Log", icon: "📝" },
  { href: "/report", label: "Report", icon: "📊" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-white/5 safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors ${
                isActive ? "text-gold" : "text-text-dim hover:text-text-mid"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className={isActive ? "font-semibold" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
