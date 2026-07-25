import { CheckCircle2, Clock, PackageCheck, Pill } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-neutral-50">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-20 sm:px-10 lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <Reveal>
            <span className="inline-flex items-center rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-600">
              Feito para farmácias populares e prefeituras
            </span>
          </Reveal>

          <Reveal delayMs={100}>
            <h1 className="mt-6 font-heading text-5xl leading-[1.05] tracking-wide text-neutral-900 sm:text-6xl">
              Todo remédio desperdiçado é um paciente a menos atendido
            </h1>
          </Reveal>

          <Reveal delayMs={200}>
            <p className="mt-6 max-w-xl text-lg font-semibold text-neutral-600">
              O ChegaMed controla prescrições e entregas de medicamentos e
              calcula automaticamente a próxima data disponível para cada
              paciente, evitando retiradas duplicadas e garantindo que o
              estoque da sua farmácia popular chegue a quem realmente precisa.
            </p>
          </Reveal>

          <Reveal delayMs={300}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#contato"
                className="inline-flex items-center justify-center rounded-full bg-primary-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-500/20 transition-transform hover:-translate-y-0.5 hover:bg-primary-600"
              >
                Fale conosco
              </a>
              <a
                href="#funcionalidades"
                className="inline-flex items-center justify-center rounded-full border-2 border-neutral-300 px-7 py-3.5 text-base font-semibold text-neutral-800 transition-colors hover:border-primary-500 hover:text-primary-600"
              >
                Conheça os planos
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delayMs={200}>
          <div className="relative mx-auto max-w-md">
            <div className="animate-float rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl shadow-primary-900/10">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-4">
                <span className="h-3 w-3 rounded-full bg-danger/70" />
                <span className="h-3 w-3 rounded-full bg-warning/70" />
                <span className="h-3 w-3 rounded-full bg-success/70" />
                <span className="ml-3 text-sm font-semibold text-neutral-400">
                  Painel de entregas
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-primary-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white">
                    <Pill size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">
                      Losartana 50mg
                    </p>
                    <p className="text-xs font-semibold text-neutral-500">
                      Maria S. · tratamento contínuo
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                  <CheckCircle2 size={14} />
                  Liberado
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-neutral-600">
                    <Pill size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">
                      Metformina 850mg
                    </p>
                    <p className="text-xs font-semibold text-neutral-500">
                      João P. · retirada antecipada
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-bold text-warning">
                  <Clock size={14} />
                  12 dias
                </span>
              </div>

              <div className="mt-5 h-2 w-2/3 rounded-full bg-neutral-100" />
              <div className="mt-2 h-2 w-1/2 rounded-full bg-neutral-100" />
            </div>

            <div className="animate-float-delayed absolute -bottom-6 -left-6 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white">
                <PackageCheck size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-neutral-900">
                  Estoque atualizado
                </p>
                <p className="text-[11px] font-semibold text-neutral-500">
                  em tempo real
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
