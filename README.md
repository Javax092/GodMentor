# Evolua AI

Evolua AI e um SaaS full-stack para diario pessoal inteligente, metas, revisoes e acompanhamento com IA. O projeto usa Next.js App Router, TypeScript, Prisma, Neon PostgreSQL e deploy na Vercel.

## Stack

- Next.js 15 com App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- Neon PostgreSQL
- JWT em cookie HTTP-only
- API routes do Next.js

## Funcionalidades

- Registro, login e logout
- Middleware protegendo `/dashboard`, `/diario`, `/metas`, `/revisoes` e `/configuracoes`
- Dashboard com dados agregados do usuario
- CRUD de diario
- CRUD de metas
- Revisoes semanais e mensais
- Endpoints de IA com fallback local
- Validacao com Zod
- Hash de senha com bcryptjs

## Estrutura

```text
app/
  (auth)/
  (app)/
  api/
components/
lib/
prisma/
```

## Variaveis de ambiente

O projeto usa duas URLs para o Neon:

- `DATABASE_URL`: runtime da aplicacao e producao na Vercel. Deve usar o host com `-pooler`.
- `DIRECT_URL`: migrations e comandos Prisma que precisam conexao direta. Deve usar o host sem `-pooler`.

Exemplo correto:

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require&connect_timeout=60"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require&connect_timeout=60"
JWT_SECRET="replace-with-a-long-random-secret"
OPENAI_API_KEY=""
```

Regras importantes:

- `DATABASE_URL` sempre com `-pooler`
- `DIRECT_URL` sempre sem `-pooler`
- manter `sslmode=require`
- manter `connect_timeout=60`
- nao usar `DATABASE_URL` pooled para `migrate dev`

## Prisma

O datasource atual esta configurado para separar runtime e migrations:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

O Prisma tambem carrega `.env` via [prisma.config.ts](/home/limax44/trilha092/prisma.config.ts:1).

## Setup local

1. Copie `.env.example` para `.env`.
2. Preencha `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` e `OPENAI_API_KEY`.
3. Instale dependencias:

```bash
npm install
```

4. Gere o client Prisma:

```bash
npx prisma generate
```

5. Rode as migrations locais:

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

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:migrate:deploy`
- `npm run prisma:deploy`
- `npm run prisma:seed`

## Migrations

Fluxo recomendado:

- Desenvolvimento: `npx prisma migrate dev`
- Producao: `npx prisma migrate deploy`

As migrations versionadas ficam em `prisma/migrations`. Para este projeto, existem migrations de sincronizacao do schema e um fallback SQL manual em [prisma/sql/20260506_add_subscription_tier_fallback.sql](/home/limax44/trilha092/prisma/sql/20260506_add_subscription_tier_fallback.sql:1).

Se for necessario aplicar o fallback manualmente:

```sql
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "subscriptionTier" TEXT NOT NULL DEFAULT 'free';
```

Observacao: o fallback acima serve apenas para emergencia. O caminho correto continua sendo `npx prisma migrate deploy`.

## Neon

Checklist de conexao:

- usar a string pooled em `DATABASE_URL`
- usar a string direta em `DIRECT_URL`
- validar com `npx prisma validate`
- conferir status com `npx prisma migrate status`

Comandos uteis:

```bash
npx prisma validate
npx prisma generate
npx prisma migrate status
npx prisma migrate deploy
```

## Deploy na Vercel

Variaveis obrigatorias em `Production`:

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`

Fluxo de deploy:

```bash
npm run build
npx prisma generate
npx prisma migrate deploy
vercel --prod
```

Notas:

- o projeto usa `postinstall` com `prisma generate`
- a Vercel deve executar o build padrao `npm run build`
- as migrations de producao devem rodar com `DIRECT_URL`

## Validacao

Comandos usados para validar a configuracao:

```bash
npx prisma validate
npx prisma generate
npx prisma migrate status
npm run build
```

## Credencial demo do seed

- Email: `demo@evolua.ai`
- Senha: `12345678`
