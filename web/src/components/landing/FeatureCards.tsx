import { Reveal } from "@/components/ui/Reveal";
import { FEATURE_CARDS } from "@/lib/site-config";

export function FeatureCards() {
  return (
    <section id="funcionalidades" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-4xl tracking-wide text-neutral-900 sm:text-5xl">
            Tudo que sua farmácia popular precisa em um só lugar
          </h2>
          <p className="mt-4 text-lg font-semibold text-neutral-600">
            Do cadastro da prescrição ao controle de estoque, o ChegaMed
            acompanha cada etapa da distribuição de medicamentos.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_CARDS.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delayMs={index * 90}>
              <div className="group h-full rounded-2xl border border-neutral-200 bg-neutral-50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-900/5">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white">
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 font-heading text-2xl tracking-wide text-neutral-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-neutral-600">
                  {description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
