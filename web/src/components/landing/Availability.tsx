import { Monitor, Play, Smartphone } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { PLAY_STORE_URL } from "@/lib/site-config";

export function Availability() {
  return (
    <section id="disponibilidade" className="bg-neutral-50 py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-4xl tracking-wide text-neutral-900 sm:text-5xl">
            Disponível onde você precisar
          </h2>
          <p className="mt-4 text-lg font-semibold text-neutral-600">
            A equipe da farmácia usa o app no celular durante o atendimento, e
            a gestão acompanha tudo pelo painel desktop.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="animate-float flex h-full flex-col items-center rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-lg shadow-primary-900/5">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <Smartphone size={30} />
              </span>
              <h3 className="mt-6 font-heading text-2xl tracking-wide text-neutral-900">
                App para celular
              </h3>
              <p className="mt-2 max-w-sm text-sm font-semibold text-neutral-600">
                Consulta de pacientes, registro de entregas e alertas de
                duplicidade direto no bolso do atendente.
              </p>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-3 rounded-xl bg-neutral-900 px-5 py-3 text-white transition-transform hover:-translate-y-0.5"
              >
                <Play size={22} fill="currentColor" />
                <span className="text-left leading-tight">
                  <span className="block text-[11px] font-semibold text-neutral-300">
                    Disponível no
                  </span>
                  <span className="block text-base font-bold">
                    Google Play
                  </span>
                </span>
              </a>
            </div>
          </Reveal>

          <Reveal delayMs={120}>
            <div className="animate-float-delayed flex h-full flex-col items-center rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-lg shadow-primary-900/5">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <Monitor size={30} />
              </span>
              <h3 className="mt-6 font-heading text-2xl tracking-wide text-neutral-900">
                Painel desktop
              </h3>
              <p className="mt-2 max-w-sm text-sm font-semibold text-neutral-600">
                Gestão completa de prescrições, estoque, unidades e usuários
                para quem coordena a farmácia popular.
              </p>
              <a
                href="#contato"
                className="mt-8 inline-flex items-center gap-3 rounded-xl bg-neutral-900 px-5 py-3 text-white transition-transform hover:-translate-y-0.5"
              >
                <Monitor size={22} />
                <span className="text-left leading-tight">
                  <span className="block text-[11px] font-semibold text-neutral-300">
                    Disponível para
                  </span>
                  <span className="block text-base font-bold">
                    Prefeituras parceiras
                  </span>
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
