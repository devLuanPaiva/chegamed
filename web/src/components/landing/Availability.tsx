import { Check, LayoutDashboard, Monitor, Play, Smartphone } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { PLAY_STORE_URL } from "@/lib/site-config";

interface BulletProps {
  children: ReactNode;
}

function Bullet({ children }: Readonly<BulletProps>) {
  return (
    <li className="flex items-start gap-2 text-left text-sm font-semibold text-neutral-600">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Check size={11} />
      </span>
      {children}
    </li>
  );
}

export function Availability() {
  return (
    <section id="disponibilidade" className="bg-neutral-50 py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-4xl tracking-wide text-neutral-900 sm:text-5xl">
            Disponível onde você precisar
          </h2>
          <p className="mt-4 text-lg font-semibold text-neutral-600">
            Agilidade para quem atende no balcão, visão completa para quem
            coordena a farmácia popular.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="animate-float flex h-full flex-col items-center rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-lg shadow-primary-900/5">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <Smartphone size={30} />
              </span>
              <h3 className="mt-6 font-heading text-2xl tracking-wide text-neutral-900">
                App para celular — agilidade no atendimento
              </h3>

              <ul className="mt-6 flex flex-col gap-3 self-stretch">
                <Bullet>
                  Fotografe a receita e deixe a inteligência artificial
                  preencher medicamento, dosagem e datas automaticamente.
                </Bullet>
                <Bullet>
                  Pergunte ao assistente virtual quando um paciente pode
                  retirar de novo, sem precisar abrir relatórios.
                </Bullet>
                <Bullet>
                  Registre entregas na hora do atendimento, com alerta
                  imediato de duplicidade.
                </Bullet>
              </ul>

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
                Painel desktop — visão completa da gestão
              </h3>

              <ul className="mt-6 flex flex-col gap-3 self-stretch">
                <Bullet>
                  Dashboards com status das prescrições, fila de pendências e
                  linha do tempo de entregas.
                </Bullet>
                <Bullet>
                  Tabelas e filtros para acompanhar cada paciente, medicamento
                  e unidade.
                </Bullet>
                <Bullet>
                  Indicadores de cumprimento — entregas completas x parciais —
                  por período.
                </Bullet>
              </ul>

              <a
                href="#contato"
                className="mt-8 inline-flex items-center gap-3 rounded-xl bg-neutral-900 px-5 py-3 text-white transition-transform hover:-translate-y-0.5"
              >
                <LayoutDashboard size={22} />
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
