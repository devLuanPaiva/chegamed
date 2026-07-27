import { ArrowRight, Ban, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-white py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-600">
            Um problema real
          </span>
          <h2 className="mt-6 font-heading text-4xl tracking-wide text-neutral-900 sm:text-5xl">
            Duas receitas, o mesmo remédio, 20 dias de diferença
          </h2>
          <p className="mt-4 text-lg font-semibold text-neutral-600">
            É assim que um medicamento ainda dentro do prazo de tratamento
            acaba sendo entregue em dobro — e é exatamente isso que o
            ChegaMed impede.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border border-neutral-200 bg-neutral-50 p-8">
              <span className="text-sm font-bold uppercase tracking-wide text-neutral-500">
                1º de julho — Primeira entrega
              </span>
              <p className="mt-2 text-sm font-semibold text-neutral-600">
                João leva sua receita e recebe os dois medicamentos no mesmo
                dia.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <p className="text-sm font-bold text-neutral-900">
                    Glifage XR — 30 comprimidos
                  </p>
                  <p className="text-xs font-semibold text-neutral-500">
                    1x ao dia · dura 30 dias
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <p className="text-sm font-bold text-neutral-900">
                    Losartana — 30 comprimidos
                  </p>
                  <p className="text-xs font-semibold text-neutral-500">
                    2x ao dia · dura 15 dias
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="hidden items-center justify-center lg:flex">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <ArrowRight size={22} />
            </span>
          </div>

          <Reveal delayMs={150}>
            <div className="flex h-full flex-col rounded-3xl border border-primary-100 bg-primary-50 p-8">
              <span className="text-sm font-bold uppercase tracking-wide text-primary-700">
                20 de julho — Nova tentativa
              </span>
              <p className="mt-2 text-sm font-semibold text-primary-800">
                João volta com uma nova receita dos mesmos remédios. O
                ChegaMed avalia cada item individualmente.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">
                      Glifage XR
                    </p>
                    <p className="text-xs font-semibold text-neutral-500">
                      restam 10 dias de tratamento
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-bold text-danger">
                    <Ban size={14} />
                    Bloqueado
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">
                      Losartana
                    </p>
                    <p className="text-xs font-semibold text-neutral-500">
                      tratamento já concluído
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                    <CheckCircle2 size={14} />
                    Liberado
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delayMs={250}>
          <p className="mx-auto mt-12 max-w-2xl text-center text-sm font-semibold text-neutral-500">
            E quando a prefeitura consegue repor um medicamento em falta, o
            ChegaMed indica quem está esperando há mais tempo, para que a
            entrega siga a ordem de chegada.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
