"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface TeamSettingsNavProps {
  teamId: string
  activeTab: string
}

export function TeamSettingsNav({ teamId, activeTab }: TeamSettingsNavProps) {
  const items = [
    {
      title: "General",
      href: `/teams/${teamId}/settings?tab=general`,
      value: "general",
    },
    {
      title: "Applications",
      href: `/teams/${teamId}/settings?tab=applications`,
      value: "applications",
    },
  ]

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center">
        <div className="flex space-x-8">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors hover:border-muted-foreground/50",
                activeTab === item.value
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
} 