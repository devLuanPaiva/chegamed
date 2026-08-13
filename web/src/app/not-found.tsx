import type { Metadata } from "next";
import Link from "next/link";
import { Home, PillBottle, SearchX } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Página não encontrada | ChegaMed",
  description: "A página que você procura não existe ou foi movida.",
};

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-neutral-50 px-6 py-20 sm:px-10">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-100 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-primary-50 blur-3xl" />

        <div className="relative mx-auto flex max-w-xl flex-col items-center text-center">
          <Reveal>
            <div className="animate-float relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-neutral-200 bg-white shadow-xl shadow-primary-900/10">
              <PillBottle size={40} className="text-primary-500" />
              <span className="absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30">
                <SearchX size={18} />
              </span>
            </div>
          </Reveal>

          <Reveal delayMs={100}>
            <h1 className="mt-8 font-heading text-7xl tracking-wide text-primary-500 sm:text-8xl">
              404
            </h1>
          </Reveal>

          <Reveal delayMs={200}>
            <h2 className="mt-2 font-heading text-3xl tracking-wide text-neutral-900 sm:text-4xl">
              Essa página não foi encontrada
            </h2>
          </Reveal>

          <Reveal delayMs={300}>
            <p className="mt-4 max-w-md text-base font-semibold text-neutral-600">
              A página que você procura não existe, foi movida ou o endereço
              foi digitado incorretamente.
            </p>
          </Reveal>

          <Reveal delayMs={400}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-500/20 transition-transform hover:-translate-y-0.5 hover:bg-primary-600"
              >
                <Home size={18} />
                Voltar para o início
              </Link>
              <Link
                href="/#contato"
                className="inline-flex items-center justify-center rounded-full border-2 border-neutral-300 px-7 py-3.5 text-base font-semibold text-neutral-800 transition-colors hover:border-primary-500 hover:text-primary-600"
              >
                Fale conosco
              </Link>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}
