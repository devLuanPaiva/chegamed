"use client";

import { formatCpf, formatPhone } from "@/lib/format";

import { FormField } from "./FormField";

interface PersonalInfoFieldsProps {
  errors: Record<string, string>;
}

export function PersonalInfoFields({ errors }: Readonly<PersonalInfoFieldsProps>) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
        Dados do paciente
      </h2>

      <FormField label="Nome completo" name="name" required maxLength={120} error={errors.name} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="CPF"
          name="cpf"
          required
          placeholder="000.000.000-00"
          maxLength={14}
          error={errors.cpf}
          onChange={(event) => {
            event.target.value = formatCpf(event.target.value);
          }}
        />
        <FormField label="Data de nascimento" name="birthDate" type="date" required error={errors.birthDate} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Telefone (opcional)"
          name="contact"
          placeholder="(00) 00000-0000"
          maxLength={15}
          error={errors.contact}
          onChange={(event) => {
            event.target.value = formatPhone(event.target.value);
          }}
        />
        <FormField label="Endereço (opcional)" name="address" maxLength={255} error={errors.address} />
      </div>
    </div>
  );
}
