"use client";

import { FormField } from "./FormField";

interface AccountFieldsProps {
  errors: Record<string, string>;
}

export function AccountFields({ errors }: AccountFieldsProps) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
        Dados de acesso
      </h2>

      <FormField label="E-mail" name="email" type="email" required maxLength={180} error={errors.email} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Senha" name="password" type="password" required error={errors.password} />
        <FormField
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          required
          error={errors.confirmPassword}
        />
      </div>

      <p className="text-xs font-semibold text-neutral-500">
        Use entre 6 e 20 caracteres. Você usará este e-mail e senha para acessar o aplicativo depois que seu
        cadastro for aprovado.
      </p>
    </div>
  );
}
