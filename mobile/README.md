# ChegaMed Mobile

<div align="center">
    <div data-badges>
        <img src="https://img.shields.io/badge/expo-%231C1E24.svg?style=for-the-badge&logo=expo&logoColor=%23D04A37" alt="Expo" />
        <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
        <img src="https://img.shields.io/badge/react%20native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React Native" />
        <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    </div>
</div>

<br/>

Aplicativo mobile do **ChegaMed**, voltado a pacientes e entregadores. Permite fotografar e enviar receitas médicas, acompanhar prescrições e entregas, consultar o histórico de retiradas, receber notificações e conversar com o assistente virtual do produto.

Para a visão geral do produto e a arquitetura completa, veja o [README raiz](../README.md).

## Tecnologias e dependências principais

- **Framework:** Expo SDK `~54`, React `19.1.0`, React Native `0.81.5`
- **Roteamento:** Expo Router `~6` (rotas por arquivo, `experiments.typedRoutes`)
- **Navegação:** React Navigation (`bottom-tabs`, `native`, `elements`)
- **Recursos nativos:** `expo-camera`, `expo-notifications`, `expo-secure-store`, `expo-device`, `expo-speech`, `expo-apple-authentication`, `@react-native-google-signin/google-signin`
- **Testes:** Jest `~29.7` + `jest-expo`
- **Gerenciador de pacotes:** npm (`package-lock.json`)

## Pré-requisitos

- **Node.js** 20+ e **npm**
- **Expo CLI** (executado via `npx expo`, sem instalação global obrigatória)
- **EAS CLI** (`npm install -g eas-cli`, versão `>=18.8.1`) para builds de desenvolvimento/produção e publicação nas lojas
- Aplicativo **Expo Go** ou um development build instalado no dispositivo/emulador para testar localmente

## Instalação

```bash
cd mobile
npm install
```

## Executando em desenvolvimento

```bash
npm start          # abre o Metro/Expo Dev Tools
npm run android     # abre diretamente no emulador/dispositivo Android
npm run ios         # abre diretamente no simulador/dispositivo iOS
npm run web          # executa a versão web (react-native-web)
```

## Lint

```bash
npm run lint
```

## Testes

```bash
npm test
```

Executa a suíte com Jest (`jest-expo`).

## Build de produção

O projeto não possui build local — os builds são gerados via **EAS Build**, configurados em `eas.json`:

```bash
eas build --profile development   # build de desenvolvimento (dev client)
eas build --profile preview       # build interno para testes (APK Android)
eas build --profile production    # build de loja (App Bundle Android / iOS)
```

Publicação nas lojas:

```bash
eas submit --profile production
```

Atualizações OTA (sem passar pela loja) são publicadas via `expo-updates`, com política `appVersion`.

## Estrutura do projeto

| Pasta | Conteúdo |
| --- | --- |
| `src/app` | Rotas (Expo Router), agrupadas em `(authentication)` e `(protected)` — `assistant`, `deliveries`, `history`, `medicines`, `my-deliveries`, `notifications`, `patients`, `prescriptions` |
| `src/features` | Lógica de negócio por domínio (`auth`, `assistant`, `deliveries`, `history`, `home`, `medicines`, `myDeliveries`, `notifications`, `patients`, `prescriptions`, `profile`), cada um com `components/` e `hooks/` |
| `src/data` | Contextos, hooks, modelos e serviços de acesso à API |
| `src/lib` | Utilitários (ex.: cliente HTTP) |
| `src/theme` | Tema visual do aplicativo |

O modelo de dados consumido pelo app (paciente, receita, medicamento, entrega) está documentado no [README raiz](../README.md#modelo-de-dados-principal).
