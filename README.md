# Evolua AI

Evolua AI e um SaaS full-stack para diario pessoal inteligente, metas, revisoes e base de mentor com IA. O projeto usa Next.js App Router, TypeScript, Tailwind, componentes estilo shadcn/ui, Prisma e PostgreSQL.

## Stack

- Next.js 15 com App Router
- TypeScript
- Tailwind CSS
- shadcn/ui style components
- lucide-react
- Prisma ORM
- PostgreSQL
- Autenticacao com email e senha usando JWT em cookie HTTP-only
- API routes do Next.js
- Estrutura pronta para integracao futura com OpenAI com fallback local

## Funcionalidades

- Landing page premium e responsiva
- Registro, login e logout
- Middleware protegendo `/dashboard`, `/diario`, `/metas`, `/revisoes` e `/configuracoes`
- Dashboard com streak, metas concluidas, nota media, progresso mensal e insight
- Diario com CRUD real
- Metas com CRUD, filtros por periodo e categoria, status e progresso
- Revisoes semanais e mensais
- Endpoints de IA com fallback local persistindo insights
- Validacao com Zod
- Hash de senha com bcryptjs
- Isolamento de dados por `userId`

## Estrutura

```text
app/
  (auth)/
  (app)/
  api/
components/
  app/
  forms/
  ui/
lib/
prisma/
```

## Setup local

1. Copie `.env.example` para `.env`.
2. Preencha:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
JWT_SECRET="uma-chave-longa-e-segura"
OPENAI_API_KEY=""
```

3. Instale dependencias:

```bash
npm install
```

4. Gere o client Prisma:

```bash
npx prisma generate
```

5. Rode a migracao de desenvolvimento:

```bash
npx prisma migrate dev
```

6. Opcional: popule com seed:

```bash
npm run prisma:seed
```

7. Suba o projeto:

```bash
npm run dev
```

## Credencial demo do seed

- Email: `demo@evolua.ai`
- Senha: `12345678`

## Scripts

- `npm install`
- `npx prisma generate`
- `npx prisma migrate dev`
- `npm run prisma:seed`
- `npm run dev`
- `npm run build`

## Neon PostgreSQL

1. Crie um projeto no Neon.
2. Copie a connection string do banco.
3. Cole em `DATABASE_URL`.
4. Mantenha `sslmode=require`.
5. Rode `npx prisma migrate dev` localmente.
6. Em producao, use `npx prisma migrate deploy`.

Exemplo:

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx.sa-east-1.aws.neon.tech/neondb?sslmode=require"
```

## Deploy na Vercel

1. Suba o repositorio no GitHub.
2. Importe o projeto na Vercel.
3. Defina as variaveis `DATABASE_URL`, `JWT_SECRET` e `OPENAI_API_KEY`.
4. Garanta que o banco Neon esteja acessivel.
5. Configure o comando de build padrao: `npm run build`.
6. Rode as migracoes em producao:

```bash
npx prisma migrate deploy
```

## IA e fallback

Os endpoints:

- `/api/ai/insight`
- `/api/ai/weekly-review`
- `/api/ai/monthly-review`

ja funcionam sem OpenAI configurada. Eles analisam diario, metas e revisoes e retornam:

- resumo
- foco sugerido
- alerta de padrao negativo
- recomendacao pratica

Hoje o retorno usa fallback local. A camada de prompt e contexto ja esta separada em `lib/ai.ts` para conectar OpenAI depois.

## Checklist de producao

- Definir `JWT_SECRET` forte
- Trocar seed demo por processo de onboarding real
- Criar migracoes versionadas em `prisma/migrations`
- Adicionar rate limiting em auth e endpoints de IA
- Adicionar observabilidade e logs estruturados
- Mover JWT para rotacao ou sessao persistida se houver requisitos enterprise
- Adicionar reset de senha e verificacao de email
- Adicionar CSRF hardening se houver expansao de superficie de sessao
- Conectar OpenAI com retries, timeout e auditoria de uso
- Cobrir API routes e fluxo auth com testes

## Validacao

Build validado localmente com:

```bash
npm run build
```
