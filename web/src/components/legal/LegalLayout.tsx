import type { ReactNode } from "react";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";

interface LegalLayoutProps {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

export function LegalLayout({ title, lastUpdated, children }: Readonly<LegalLayoutProps>) {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex flex-1 justify-center bg-neutral-50">
        <div className="w-full max-w-3xl px-6 py-16 sm:px-10">
          <h1 className="font-heading text-4xl tracking-wide text-neutral-900">
            {title}
          </h1>
          {lastUpdated && (
            <p className="mt-2 text-sm font-semibold text-neutral-500">
              Última atualização: {lastUpdated}
            </p>
          )}

          <div className="mt-10 flex flex-col gap-8 text-base font-semibold leading-7 text-neutral-700">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
