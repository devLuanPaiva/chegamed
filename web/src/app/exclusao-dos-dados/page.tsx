import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Exclusão de dados | ChegaMed",
  description:
    "Como solicitar a exclusão de dados de pacientes, prescrições e entregas no ChegaMed.",
};

const SUPPORT_EMAIL = "suporte@chegamed.com.br";

export default function ExclusaoDosDadosPage() {
  return (
    <LegalLayout title="Exclusão de dados">
      <p className="text-lg leading-8">
        Excluir sua conta remove seus dados de acesso, mas dados de pacientes, prescrições,
        entregas e fotos vinculados à empresa parceira continuam existindo, pois pertencem à
        empresa e podem ser usados por outros profissionais dela. Para pedir a exclusão desses
        dados, envie uma solicitação diretamente pelo aplicativo.
      </p>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-2xl tracking-wide text-neutral-900">
          Como solicitar a exclusão de dados
        </h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Faça login no aplicativo ChegaMed.</li>
          <li>Acesse a tela de Perfil.</li>
          <li>
            Toque no menu de <strong>três pontinhos (⋮)</strong>, no canto superior direito.
          </li>
          <li>
            Selecione a opção <strong>&quot;Solicitar exclusão de dados&quot;</strong>.
          </li>
          <li>
            Descreva, se quiser, quais dados deseja que sejam excluídos e envie a solicitação.
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-2xl tracking-wide text-neutral-900">
          O que acontece depois
        </h2>
        <p>
          Você recebe um e-mail confirmando o recebimento da solicitação, e nossa equipe
          responde em até 15 dias úteis, conforme previsto na LGPD. Como parte desses dados
          pode ter valor probatório ou regulatório para a empresa parceira (farmácia ou
          clínica), a exclusão é feita manualmente após uma análise.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-2xl tracking-wide text-neutral-900">
          Não consegue acessar o aplicativo?
        </h2>
        <p>
          Se você não consegue fazer login, envie sua solicitação por e-mail para{" "}
          <a
            className="font-bold text-primary-600 underline underline-offset-2"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>

      <p className="text-sm font-semibold text-neutral-500">
        Para excluir sua conta (dados de login), veja{" "}
        <Link
          className="font-bold text-primary-600 underline underline-offset-2"
          href="/exclusao-de-conta"
        >
          como excluir sua conta
        </Link>
        .
      </p>
    </LegalLayout>
  );
}
