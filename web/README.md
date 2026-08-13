# ChegaMed Web

<div align="center">
    <div data-badges>
        <img src="https://img.shields.io/badge/next.js-%23000000.svg?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
        <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
        <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
        <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
    </div>
</div>

<br/>

Site público do **ChegaMed**: página institucional/landing, autocadastro de pacientes por prefeitura e páginas legais (política de privacidade e solicitações de exclusão de conta/dados). É o único dos quatro clientes voltado ao público geral — não requer autenticação.

Para a visão geral do produto e a arquitetura completa, veja o [README raiz](../README.md).

## Tecnologias e dependências principais

- **Framework:** Next.js `16.2.11` (App Router), React `19.2.4`
- **Linguagem:** TypeScript
- **Estilo:** Tailwind CSS `4`, Sass
- **Validação:** Zod `4.4.3`
- **Ícones:** lucide-react
- **Compilador:** React Compiler (`babel-plugin-react-compiler`)

## Pré-requisitos

- **Node.js** 20+
- **pnpm** (gerenciador de pacotes usado no projeto — `pnpm-lock.yaml`)

## Instalação

```bash
cd web
pnpm install
```

## Configuração

O projeto lê a URL base da API através da variável de ambiente `API_BASE_URL` (usada no lado do servidor, em `src/lib/api-client.ts`). Crie um arquivo `.env.local` na pasta `web/`:

```bash
API_BASE_URL=http://localhost:8080
```

## Executando em desenvolvimento

```bash
pnpm dev
```

Aplicação disponível em `http://localhost:3000`.

## Build de produção

```bash
pnpm build
pnpm start
```

## Lint

```bash
pnpm lint
```

## Testes

Não há framework de testes configurado neste projeto no momento.

## Estrutura e rotas

Roteamento via **App Router** (`src/app`):

| Rota | Descrição |
| --- | --- |
| `/` | Landing page institucional |
| `/cadastro-de-paciente/[company-slug]` | Autocadastro público de pacientes, específico por prefeitura/empresa |
| `/exclusao-de-conta` | Solicitação de exclusão de conta |
| `/exclusao-dos-dados` | Solicitação de exclusão de dados (conformidade LGPD) |
| `/politica-de-privacidade` | Política de privacidade |
| `/link` | Página de redirecionamento/deep-link (handoff para lojas de aplicativo) |

Componentes organizados em `src/components` (`landing`, `patient-registration`, `legal`, `ui`) e utilitários em `src/lib` (`api-client.ts`, `business-hours.ts`, `format.ts`, `site-config.ts`).
