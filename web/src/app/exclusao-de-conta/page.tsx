import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Exclusão de conta | ChegaMed",
  description: "Como solicitar a exclusão da sua conta no ChegaMed.",
};

export default function ExclusaoDeContaPage() {
  return (
    <LegalLayout title="Exclusão de conta">
      <p className="text-lg leading-8">
        Você pode excluir sua conta no ChegaMed a qualquer momento, diretamente pelo
        aplicativo.
      </p>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-2xl tracking-wide text-neutral-900">
          Como excluir sua conta
        </h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Faça login no aplicativo ChegaMed.</li>
          <li>Acesse a tela de Perfil.</li>
          <li>
            Toque no menu de <strong>três pontinhos (⋮)</strong>, no canto superior direito.
          </li>
          <li>
            Selecione a opção <strong>&quot;Excluir conta&quot;</strong>.
          </li>
          <li>Digite sua senha para confirmar a exclusão.</li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-2xl tracking-wide text-neutral-900">
          Não consegue acessar sua conta?
        </h2>
        <p>
          Se você esqueceu sua senha ou não consegue fazer login, utilize a opção{" "}
          <strong>&quot;Esqueceu a senha?&quot;</strong> na tela de login do aplicativo para
          recuperar o acesso e, em seguida, siga os passos acima para excluir sua conta.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-2xl tracking-wide text-neutral-900">
          O que acontece com seus dados
        </h2>
        <p>
          Ao confirmar a exclusão, sua conta e os dados de acesso associados a ela (login,
          senha e informações de perfil) são removidos permanentemente dos nossos sistemas.
        </p>
        <p>
          Dados de pacientes, prescrições e entregas vinculados à empresa parceira não são
          apagados junto com sua conta. Para solicitar a exclusão desses dados, veja{" "}
          <Link
            className="font-bold text-primary-600 underline underline-offset-2"
            href="/exclusao-dos-dados"
          >
            como solicitar a exclusão de dados
          </Link>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
