import { Clock } from "lucide-react";

import { BUSINESS_HOURS_LABEL } from "@/lib/business-hours";

export function BusinessHoursNotice() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center shadow-2xl shadow-primary-900/20">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 text-warning">
        <Clock size={28} />
      </span>
      <h1 className="font-heading text-3xl tracking-wide text-neutral-900">
        Cadastro fora do horário de atendimento
      </h1>
      <p className="text-base font-semibold text-neutral-600">
        O cadastro de pacientes está disponível apenas de {BUSINESS_HOURS_LABEL}. Volte durante o horário de
        atendimento para concluir sua solicitação.
      </p>
    </div>
  );
}
