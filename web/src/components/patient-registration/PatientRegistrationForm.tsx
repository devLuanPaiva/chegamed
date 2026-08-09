"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Reveal } from "@/components/ui/Reveal";
import {
  INITIAL_FORM_STATE,
  submitPatientRegistration,
} from "@/app/cadastro-de-paciente/[company-slug]/actions";

import { AccountFields } from "./AccountFields";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { RegistrationSuccessCard } from "./RegistrationSuccessCard";

interface PatientRegistrationFormProps {
  companySlug: string;
  companyName: string;
}

export function PatientRegistrationForm({ companySlug, companyName }: PatientRegistrationFormProps) {
  const submitForCompany = submitPatientRegistration.bind(null, companySlug);
  const [state, formAction] = useActionState(submitForCompany, INITIAL_FORM_STATE);

  if (state.success) {
    return <RegistrationSuccessCard />;
  }

  const errors = state.fieldErrors ?? {};

  return (
    <Reveal>
      <form
        action={formAction}
        className="mx-auto flex max-w-2xl flex-col gap-8 rounded-3xl bg-white p-8 shadow-2xl shadow-primary-900/30 sm:p-10"
      >
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-neutral-900">Cadastro de paciente</h1>
          <p className="mt-2 text-sm font-semibold text-neutral-500">{companyName}</p>
        </div>

        {state.message && (
          <p className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-semibold text-danger">
            {state.message}
          </p>
        )}

        <PersonalInfoFields errors={errors} />
        <AccountFields errors={errors} />

        <SubmitButton />
      </form>
    </Reveal>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-7 py-3.5 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      {pending ? "Enviando..." : "Enviar cadastro"}
    </button>
  );
}
