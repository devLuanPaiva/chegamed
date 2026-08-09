import { CheckCircle2 } from "lucide-react";

export function RegistrationSuccessCard() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center shadow-2xl shadow-primary-900/20">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 size={28} />
      </span>
      <h1 className="font-heading text-3xl tracking-wide text-neutral-900">Cadastro enviado</h1>
      <p className="text-base font-semibold text-neutral-600">
        Recebemos sua solicitação de cadastro. A equipe vai analisar seus dados e, assim que for aprovado, você
        receberá um e-mail de confirmação com acesso à plataforma.
      </p>
    </div>
  );
}
