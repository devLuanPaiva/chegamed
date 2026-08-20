import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { CONTACT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Política de Privacidade | ChegaMed",
  description:
    "Como o ChegaMed coleta, usa e protege os dados de usuários, pacientes e prescrições.",
};

const LAST_UPDATED = "20 de agosto de 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Política de Privacidade do ChegaMed" lastUpdated={LAST_UPDATED}>
      <section>
        <h2 className="font-heading text-2xl tracking-wide text-neutral-900">
          1. Sobre o ChegaMed
        </h2>
        <p className="mt-3">
          O ChegaMed é uma plataforma utilizada por farmácias e clínicas parceiras para
          gerenciar pacientes, prescrições médicas e a entrega de medicamentos. O acesso à
          plataforma é feito por profissionais autorizados pela empresa parceira (farmácia ou
          clínica), e não por meio de cadastro público.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-2xl tracking-wide text-neutral-900">
          2. Quais dados coletamos
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong>Dados de conta:</strong> nome, e-mail, CPF e cargo do profissional que
            utiliza o aplicativo.
          </li>
          <li>
            <strong>Dados de pacientes e prescrições:</strong> nome do paciente, medicamentos
            prescritos, dosagens e datas, informados pela empresa parceira para viabilizar o
            controle de entregas.
          </li>
          <li>
            <strong>Fotos de receitas e de caixas de medicamentos:</strong> capturadas pela
            câmera do dispositivo para agilizar o cadastro de prescrições e medicamentos.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-2xl tracking-wide text-neutral-900">
          3. Uso de inteligência artificial
        </h2>
        <p className="mt-3">
          O ChegaMed utiliza a API do Google Gemini, um serviço de inteligência artificial de
          terceiros, em duas funcionalidades opcionais do aplicativo. Em ambos os casos, o
          processamento é feito por meio de uma conta paga (tier pago) da API do Google
          Gemini, cujos termos comerciais excluem o uso dos dados enviados para o treinamento
          dos modelos do Google, e os dados são usados apenas para responder à solicitação, não
          sendo compartilhados com terceiros para qualquer outra finalidade. Antes do primeiro
          uso de cada uma dessas funcionalidades, o aplicativo explica o que será enviado e
          solicita a autorização do usuário.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong>Extração de dados de fotos:</strong> ao fotografar uma receita ou a caixa
            de um medicamento, a imagem é enviada à API do Google Gemini para extrair
            automaticamente informações como nome do paciente, medicamento, dosagem e datas,
            reduzindo a digitação manual.
          </li>
          <li>
            <strong>Assistente de IA (chat):</strong> ao usar o assistente para perguntar sobre
            entregas ou pacientes, o texto da pergunta é enviado à API do Google Gemini para
            gerar uma resposta. Quando necessário para responder à pergunta, nomes de
            pacientes e dados de entregas/prescrições relacionados também são enviados junto
            com a pergunta.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-2xl tracking-wide text-neutral-900">
          4. Como protegemos os dados
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            O CPF é armazenado de forma completa apenas quando necessário para identificação
            do usuário, mas é exibido de forma mascarada (ex.: 123.***.***-**) nas telas e
            listagens do sistema.
          </li>
          <li>As senhas são armazenadas com hash criptográfico e nunca em texto plano.</li>
          <li>
            Os tokens de sessão do aplicativo móvel são armazenados em área segura do
            dispositivo (Keychain no iOS e armazenamento criptografado no Android).
          </li>
          <li>
            O acesso aos dados é restrito por papel (cargo) do usuário: cada profissional só
            visualiza os pacientes e registros da(s) empresa(s) às quais está vinculado.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-2xl tracking-wide text-neutral-900">
          5. Com quem compartilhamos dados
        </h2>
        <p className="mt-3">
          Não vendemos nem compartilhamos dados pessoais para fins de publicidade. Os dados
          são compartilhados apenas com prestadores de serviço estritamente necessários para o
          funcionamento da plataforma, como o provedor de infraestrutura em nuvem e a API do
          Google Gemini (para extração de dados de imagens e para o assistente de IA,
          conforme descrito na seção 3).
        </p>
      </section>

      <section>
        <h2 className="font-heading text-2xl tracking-wide text-neutral-900">
          6. Exclusão de conta e de dados
        </h2>
        <p className="mt-3">
          Qualquer usuário pode excluir a própria conta diretamente pelo aplicativo móvel, no
          menu de opções da tela de Perfil (ícone de três pontos), selecionando &quot;Excluir
          conta&quot; e confirmando com a senha. A exclusão remove permanentemente os dados de
          acesso do usuário e não pode ser desfeita. Caso prefira solicitar a exclusão por
          outro meio, entre em contato pelo e-mail abaixo.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-2xl tracking-wide text-neutral-900">7. Contato</h2>
        <p className="mt-3">
          Dúvidas sobre esta política ou sobre o tratamento dos seus dados podem ser enviadas
          para{" "}
          <a
            className="font-bold text-primary-600 underline underline-offset-2"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
