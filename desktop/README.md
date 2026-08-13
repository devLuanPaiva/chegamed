# ChegaMed Desktop

<div align="center">
    <div data-badges>
        <img src="https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
        <img src="https://img.shields.io/badge/tauri-%2324C8DB.svg?style=for-the-badge&logo=tauri&logoColor=white" alt="Tauri" />
        <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
        <img src="https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white" alt="Rust" />
    </div>
</div>

<br/>

Aplicativo desktop de **back-office** do ChegaMed. É a ferramenta de trabalho de gestores, atendentes e administradores das prefeituras: cadastro de pacientes, medicamentos e usuários, emissão e acompanhamento de receitas, controle de entregas e visualização de indicadores (dashboard e uso de IA).

Para a visão geral do produto e a arquitetura completa, veja o [README raiz](../README.md).

## Tecnologias e dependências principais

- **UI:** Angular `21.2.x` (standalone, `@angular/build`), NgRx (`store`, `effects`, `signals`, `store-devtools`) `21.1.1`
- **Empacotamento desktop:** Tauri `v2` (`@tauri-apps/api`, `@tauri-apps/cli`, plugins `deep-link` e `opener`)
- **Gráficos:** Chart.js `4.5.1`
- **Ícones:** `@lucide/angular`
- **Testes:** Vitest `4.1.9` via o novo test runner do Angular (`@angular/build:unit-test`)
- **Gerenciador de pacotes:** pnpm (`pnpm-lock.yaml`)

## Pré-requisitos

- **Node.js** 20+ e **pnpm**
- **Rust toolchain** (`rustc`/`cargo`) — necessário para compilar o shell nativo do Tauri
- Dependências nativas da plataforma exigidas pelo Tauri v2 (ex.: WebView2 no Windows, `libwebkit2gtk` no Linux) — veja os [pré-requisitos oficiais do Tauri](https://v2.tauri.app/start/prerequisites/)

## Instalação

```bash
cd desktop
pnpm install
```

## Executando em desenvolvimento

Apenas a camada web (Angular), no navegador:

```bash
pnpm start
```

Aplicativo desktop completo (janela nativa via Tauri, com hot-reload do Angular):

```bash
pnpm tauri dev
```

## Build de produção

Build apenas dos artefatos web:

```bash
pnpm build
```

Empacotamento do executável/instalador desktop:

```bash
pnpm tauri build
```

## Testes

```bash
pnpm test
```

Executa os testes unitários (`*.spec.ts`, ~36 arquivos) via Vitest, com o builder de testes do Angular.

## Estrutura do projeto

Código Angular em `src/app`:

| Pasta | Conteúdo |
| --- | --- |
| `core/` | Clientes de API, guards de rota, pipes e serviços transversais |
| `features/` | Módulos de funcionalidade: `auth`, `company`, `patient`, `prescription`, `medicine`, `delivery`, `users`, `dashboard`, `ai-usage` |
| `layouts/` | Casca da aplicação (`shell`, `sidebar`) |
| `shared/` | Diretivas, modelos, serviços e componentes de UI reutilizáveis |
| `store/` | Estado global com NgRx |

O shell nativo fica em `src-tauri/` (projeto Rust/Cargo, configuração em `tauri.conf.json`).

Os módulos de `features/` espelham praticamente 1:1 os domínios da [API](../api/README.md#estrutura-do-projeto) — o modelo de dados (paciente, receita, medicamento, entrega) está documentado no [README raiz](../README.md#modelo-de-dados-principal).
