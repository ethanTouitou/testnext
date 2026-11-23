import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { OnlinePresence } from "@/components/online-presence";
import { RealtimeNotifications } from "@/components/realtime-notifications";
import { Toaster as SonnerToaster } from "sonner";
import { getSession } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drops",
  description: "Découvre et partage des drops près de toi.",
};

// N'ouvre le WebSocket que si un cookie de session est présent.
async function AuthenticatedRealtime() {
  if (!(await getSession())) return null;
  return <><OnlinePresence /><RealtimeNotifications /></>;
}

// Fournit la structure HTML, les polices et les styles communs aux pages.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-background/85 backdrop-blur-xl">
          <nav aria-label="Navigation principale" className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
            <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20">D</span>
              <span>Drops</span>
            </Link>
            <div className="flex items-center gap-1 text-sm sm:gap-2">
              <Suspense fallback={null}><AuthenticatedRealtime /></Suspense>
              <Link href="/drops" className="rounded-lg px-4 py-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground">Explorer</Link>
              <Link href="/profile" className="rounded-lg px-4 py-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground">Mon profil</Link>
              <Link href="/login" className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/85">Connexion</Link>
            </div>
          </nav>
        </header>
        <Toaster>{children}</Toaster>
        <SonnerToaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  );
}
