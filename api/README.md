# ChegaMed API

<div align="center">
    <div data-badges>
        <img src="https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
        <img src="https://img.shields.io/badge/spring%20boot-%236DB33F.svg?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
        <img src="https://img.shields.io/badge/postgresql-%23336791.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
        <img src="https://img.shields.io/badge/maven-%23C71A36.svg?style=for-the-badge&logo=apachemaven&logoColor=white" alt="Maven" />
    </div>
</div>

<br/>

API REST central do **ChegaMed**. Concentra toda a regra de negócio, persistência e integrações (armazenamento de imagens, extração por IA, autenticação, notificações e assistente virtual) consumidas pelos clientes [`desktop`](../desktop), [`mobile`](../mobile) e [`web`](../web).

Para uma visão geral do produto, arquitetura completa e modelo de dados, veja o [README raiz](../README.md).

## Tecnologias e dependências principais

- **Linguagem/runtime:** Java 21
- **Framework:** Spring Boot 4.0.6 (`spring-boot-starter-webmvc`, `data-jpa`, `security`, `validation`, `websocket`)
- **Banco de dados:** PostgreSQL, migrações versionadas com **Flyway**
- **Documentação da API:** springdoc-openapi (Swagger UI) `2.8.9`
- **Autenticação:** JWT (`io.jsonwebtoken:jjwt` `0.12.5`), Google Sign-In (`google-api-client` `2.7.2`), Sign in with Apple (`nimbus-jose-jwt` `10.3`)
- **Armazenamento:** AWS SDK S3 `2.29.52`
- **Testes:** JUnit 5, Mockito, AssertJ, `spring-security-test`, H2 (banco em memória para testes)
- **Build:** Maven (wrapper `mvnw`/`mvnw.cmd` incluso — não é necessário ter o Maven instalado globalmente)

## Pré-requisitos

- **JDK 21**
- **PostgreSQL** em execução (localmente ou via Docker) — veja o [docker-compose.yml](../docker-compose.yml) na raiz
- Maven é opcional, pois o projeto inclui o wrapper (`./mvnw`)

## Instalação

```bash
cd api
./mvnw dependency:go-offline
```

No Windows, use `mvnw.cmd` no lugar de `./mvnw`.

## Configuração

Copie o arquivo de exemplo e preencha as variáveis necessárias:

```bash
cp .env.sample .env
```

| Variável | Descrição |
| --- | --- |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Conexão JDBC com o PostgreSQL |
| `JWT_SECRET` | Chave usada para assinar os tokens JWT |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_S3_PUBLIC_BASE_URL` | Armazenamento de imagens de receitas no S3 |
| `GEMINI_API_KEY` | Extração automática de dados de receitas fotografadas |
| `N8N_WEBHOOK_URL`, `ASSISTANT_INTERNAL_SECRET` | Integração com o assistente virtual (n8n) |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SUPPORT_EMAIL` | Envio de e-mails transacionais |
| `EXPO_PUSH_ENABLED`, `EXPO_ACCESS_TOKEN` | Notificações push para o app mobile |
| `OAUTH_CLIENT_ID_WEB` / `_MOBILE` / `_DESKTOP`, `OAUTH_CLIENT_SECRET` | Login social (Google) por plataforma |
| `APPLE_BUNDLE_ID` | Audience usado na validação do identity token do Sign in with Apple |
| `APP_LOGO_URL`, `APP_WEB_URL`, `DESKTOP_RESET_PASSWORD_URL`, `MOBILE_RESET_PASSWORD_URL` | URLs usadas em e-mails e links de redefinição de senha |

A aplicação carrega o arquivo `.env` automaticamente (`spring.config.import`), sem necessidade de exportar as variáveis manualmente no shell.

## Executando em desenvolvimento

```bash
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080`. As migrações do Flyway são aplicadas automaticamente na inicialização.

### Documentação interativa (Swagger)

Com a aplicação rodando:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Build de produção

```bash
./mvnw -B clean package -DskipTests
java -jar target/*.jar
```

### Via Docker

```bash
docker build -t chegamed-api .
docker run --env-file .env -p 8080:8080 chegamed-api
```

O `Dockerfile` realiza um build em duas etapas (`maven:3.9.9-eclipse-temurin-21` → `eclipse-temurin:21-jre-alpine`) e expõe um healthcheck em `/v3/api-docs`.

## Testes

```bash
./mvnw test
```

Os testes unitários cobrem praticamente todos os serviços, mappers e clients de cada módulo (ex.: `PrescriptionServiceImplTest`, `DeliveryEligibilityServiceImplTest`, `MedicineNameMatcherTest`, `GoogleAuthServiceTest`), utilizando H2 como banco em memória e `spring-security-test` para os cenários autenticados.

## Estrutura do projeto

O código é organizado **por funcionalidade** (package-by-feature), sob `src/main/java/com/devluanpaiva/controle_de_remedios/modules/`:

| Módulo | Responsabilidade |
| --- | --- |
| `auth` | Login (e-mail/senha, Google, Apple), refresh token e redefinição de senha |
| `user` | Usuários da aplicação, papéis (`ADMIN`, `MANAGER`, `ASSISTANT`, `PATIENT`, `DELIVERER`) |
| `company` | Empresas/prefeituras (multi-tenant) |
| `patient` | Pacientes, incluindo autocadastro público |
| `prescription` / `prescription_item` | Receitas médicas e seus itens — domínio central da aplicação |
| `medicine` | Catálogo de medicamentos por empresa e resolução/deduplicação por nome |
| `medicine_movement` | Ledger de movimentações de estoque de medicamentos |
| `delivery` | Fluxo de dispensação/entrega de medicamentos e regras de elegibilidade |
| `notification` | Notificações in-app, push (Expo), e-mail (Resend) e WebSocket |
| `assistant` | Integração do assistente virtual com o n8n |
| `ai` | Extração de dados de receitas via IA (Gemini) e rastreamento de custo/uso |
| `dashboard` | Endpoints agregados de indicadores (filas, prescrições, entregas) |
| `storage` | Geração de URLs pré-assinadas para upload no S3 |

Componentes transversais em `security/` (JWT, verificação de identidade Google/Apple, políticas de autorização) e `shared/` (tratamento de exceções, envelope de resposta `ApiResponse`, validadores de CPF/CNPJ).

O modelo de dados completo (entidades, relacionamentos e regras de negócio da receita) está documentado no [README raiz](../README.md#modelo-de-dados-principal).
