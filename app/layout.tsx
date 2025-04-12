import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/src/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner"
import { TeamBar } from "@/src/components/TeamBar";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Certificate Management System",
  description: "Centralized certificate management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
        <SidebarProvider>
          <div className="flex flex-col min-h-screen w-full">
            <div className="h-14 border-b">
              <TeamBar />
            </div>
            <div className="flex flex-1">
              <AppSidebar />
              <main className="flex-1 overflow-x-auto">
                {children}
              </main>
            </div>
          </div>
          <Toaster position="top-right" />
        </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
