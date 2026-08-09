import { Building2, SearchX } from "lucide-react";

export function CompanyNotFoundCard() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center shadow-2xl shadow-primary-900/20">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-500">
        <Building2 size={28} />
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white">
          <SearchX size={14} />
        </span>
      </div>
      <h1 className="font-heading text-3xl tracking-wide text-neutral-900">Empresa não encontrada</h1>
      <p className="text-base font-semibold text-neutral-600">
        Não encontramos uma empresa com este endereço. Verifique o link enviado pela farmácia ou entre em
        contato com ela para confirmar.
      </p>
    </div>
  );
}
