import Image from "next/image";
import Link from "next/link";
import { Monitor, Play } from "lucide-react";
import { CONTACT_EMAIL, NAV_LINKS, PLAY_STORE_URL } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="bg-neutral-900 py-14 text-neutral-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 sm:px-10">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Image
                src="/icon-logo-white.png"
                alt="ChegaMed"
                width={32}
                height={32}
              />
              <span className="font-heading text-2xl tracking-wide text-white">
                ChegaMed
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm font-semibold text-neutral-400">
              Controle de prescrições e entregas de medicamentos para
              farmácias populares vinculadas a prefeituras.
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm font-semibold">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-neutral-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/politica-de-privacidade"
              className="text-neutral-400 transition-colors hover:text-white"
            >
              Política de Privacidade
            </Link>
          </nav>

          <div className="flex flex-col gap-3">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-neutral-500"
            >
              <Play size={16} fill="currentColor" />
              Google Play
            </a>
            <Link
              href="/#contato"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-neutral-500"
            >
              <Monitor size={16} />
              Desktop
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-neutral-800 pt-6 text-xs font-semibold text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} ChegaMed. Todos os direitos
            reservados.
          </span>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="transition-colors hover:text-neutral-300"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
