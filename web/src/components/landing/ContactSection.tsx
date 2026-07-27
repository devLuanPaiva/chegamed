"use client";

import { Mail, Send } from "lucide-react";
import { useState } from "react";
import type React from "react";
import { Reveal } from "@/components/ui/Reveal";
import { CONTACT_EMAIL } from "@/lib/site-config";

interface ContactFormState {
  name: string;
  email: string;
  institution: string;
  message: string;
}

const INITIAL_STATE: ContactFormState = {
  name: "",
  email: "",
  institution: "",
  message: "",
};

export function ContactSection() {
  const [form, setForm] = useState<ContactFormState>(INITIAL_STATE);

  function handleChange(field: keyof ContactFormState) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = `Contato via site — ${form.institution || form.name}`;
    const body = [
      `Nome: ${form.name}`,
      `E-mail: ${form.email}`,
      `Prefeitura/Instituição: ${form.institution}`,
      "",
      form.message,
    ].join("\n");

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  }

  return (
    <section
      id="contato"
      className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 py-24"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <div>
              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white">
                Vamos conversar
              </span>
              <h2 className="mt-6 font-heading text-4xl leading-tight tracking-wide text-white sm:text-5xl">
                Quer levar o ChegaMed para a sua prefeitura?
              </h2>
              <p className="mt-5 max-w-md text-lg font-semibold text-primary-100">
                Fale com a nossa equipe e veja como reduzir o desperdício de
                medicamentos e organizar a distribuição na sua farmácia
                popular.
              </p>

              <div className="mt-10 flex flex-col gap-4">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-3 text-base font-semibold text-white transition-opacity hover:opacity-80"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                    <Mail size={20} />
                  </span>
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delayMs={150}>
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-white p-8 shadow-2xl shadow-primary-900/30 sm:p-10"
            >
              <div className="flex flex-col gap-5">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-neutral-800">
                    Nome
                  </span>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={handleChange("name")}
                    className="rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-900 outline-none transition-colors focus:border-primary-500"
                    placeholder="Seu nome completo"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-neutral-800">
                    E-mail
                  </span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    className="rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-900 outline-none transition-colors focus:border-primary-500"
                    placeholder="voce@prefeitura.gov.br"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-neutral-800">
                    Prefeitura/Instituição
                  </span>
                  <input
                    required
                    type="text"
                    value={form.institution}
                    onChange={handleChange("institution")}
                    className="rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-900 outline-none transition-colors focus:border-primary-500"
                    placeholder="Prefeitura de..."
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-neutral-800">
                    Mensagem
                  </span>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={handleChange("message")}
                    className="resize-none rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-900 outline-none transition-colors focus:border-primary-500"
                    placeholder="Conte um pouco sobre a sua farmácia popular"
                  />
                </label>

                <button
                  type="submit"
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-7 py-3.5 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-600"
                >
                  <Send size={18} />
                  Enviar mensagem
                </button>
                <p className="text-center text-xs font-semibold text-neutral-500">
                  Ao enviar, abriremos seu aplicativo de e-mail com a
                  mensagem pronta para {CONTACT_EMAIL}.
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
