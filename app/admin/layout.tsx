"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href === "/admin" && pathname === "/admin");

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
        isActive
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen">
      <nav className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex space-x-8">
                <NavLink href="/admin">Dashboard</NavLink>
                <NavLink href="/admin/teams">Teams</NavLink>
                <NavLink href="/admin/notifications">Notifications</NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
} 