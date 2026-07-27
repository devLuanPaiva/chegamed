import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import { IMPACT_STATS } from "@/lib/site-config";

export function ImpactStats() {
  return (
    <section id="impacto" className="bg-primary-900 py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-4xl tracking-wide text-white sm:text-5xl">
            Menos desperdício, mais remédio para quem precisa
          </h2>
          <p className="mt-4 text-lg font-semibold text-primary-200">
            O impacto esperado ao substituir o controle manual pelo ChegaMed.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {IMPACT_STATS.map((stat, index) => (
            <Reveal key={stat.label} delayMs={index * 100}>
              <div className="text-center">
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                  className="font-heading text-5xl tracking-wide text-white"
                />
                <p className="mt-3 text-sm font-semibold text-primary-200">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-12 text-center text-xs font-semibold text-primary-300">
          *Metas de impacto do produto, com base no projeto piloto do
          ChegaMed.
        </p>
      </div>
    </section>
  );
}
