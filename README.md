# 🌐 ConectaCG.net

Plataforma de comparação de planos de internet por região, com recomendação personalizada.

## 🛠 Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** API Routes do Next.js
- **Banco de dados:** PostgreSQL + Prisma ORM
- **Autenticação:** NextAuth.js (JWT + Credentials)
- **Validação:** Zod

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js 18+](https://nodejs.org/) — `node -v` para verificar
- [PostgreSQL 14+](https://www.postgresql.org/download/) — banco de dados
- [Git](https://git-scm.com/) — controle de versão

---

## 🚀 Instalação passo a passo

### 1. Clone / copie o projeto

```bash
# Se for clonar de um repositório:
git clone <url-do-repositorio> conectacg
cd conectacg

# Ou simplesmente entre na pasta do projeto:
cd conectacg
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env
```

Abra o arquivo `.env` e ajuste as configurações:

```env
# URL do seu banco PostgreSQL
# Formato: postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/conectacg"

# Chave secreta para JWT (gere uma aleatória)
NEXTAUTH_SECRET="uma-chave-longa-e-aleatoria-aqui"

# URL da aplicação
NEXTAUTH_URL="http://localhost:3000"
```

#### Como gerar o NEXTAUTH_SECRET:
```bash
# No terminal, rode:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copie o resultado e cole no `.env`.

### 4. Configure o banco de dados PostgreSQL

#### Opção A — PostgreSQL instalado localmente:

```bash
# Acesse o PostgreSQL
psql -U postgres

# Crie o banco
CREATE DATABASE conectacg;

# Saia do psql
\q
```

#### Opção B — Com Docker (mais fácil):

```bash
# Suba um container PostgreSQL
docker run --name conectacg-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=conectacg \
  -p 5432:5432 \
  -d postgres:16

# Neste caso, seu DATABASE_URL será:
# postgresql://postgres:postgres@localhost:5432/conectacg
```

### 5. Gere o Prisma Client e crie as tabelas

```bash
# Gera o Prisma Client
npm run db:generate

# Cria as tabelas no banco de dados
npm run db:push
```

### 6. Popule o banco com dados de exemplo

```bash
npm run db:seed
```

Isso vai criar:
- ✅ 3 provedores: Claro, TechNet, Vivo
- ✅ 6 planos diferentes
- ✅ 5 usuários de teste
- ✅ 10 avaliações de exemplo

### 7. Rode o projeto

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 👤 Usuários de teste (criados pelo seed)

| E-mail | Senha |
|--------|-------|
| joao@email.com | senha123 |
| maria@email.com | senha123 |
| pedro@email.com | senha123 |
| marcos@email.com | senha123 |
| paula@email.com | senha123 |

---

## 📄 CEPs para teste (busca na home)

Estes CEPs retornam planos:
- `01310-000` (São Paulo - SP)
- `04530-000` (São Paulo - SP)
- `20040-000` (Rio de Janeiro - RJ)
- `22050-000` (Rio de Janeiro - RJ)
- `30140-000` (Belo Horizonte - MG)

---

## 🗂 Estrutura do projeto

```
conectacg/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts   # NextAuth handler
│   │   │   └── register/route.ts        # Cadastro
│   │   └── plans/
│   │       ├── route.ts                 # Listar planos (com CEP)
│   │       ├── recommend/route.ts       # Recomendação personalizada
│   │       └── [id]/
│   │           ├── route.ts             # Detalhes do plano
│   │           └── reviews/route.ts     # Avaliações
│   ├── auth/
│   │   ├── login/page.tsx              # Tela de login
│   │   └── cadastro/page.tsx           # Tela de cadastro
│   ├── planos/
│   │   ├── page.tsx                    # Lista de planos
│   │   └── [id]/page.tsx              # Detalhes do plano
│   ├── personalizar/page.tsx           # Questionário (logado)
│   ├── avaliacoes/page.tsx             # Avaliações
│   ├── contato/page.tsx                # Contato
│   ├── layout.tsx                      # Layout raiz
│   ├── page.tsx                        # Home (landing)
│   ├── SearchSection.tsx               # Componente de busca
│   ├── globals.css                     # Estilos globais
│   └── providers.tsx                   # SessionProvider
├── components/
│   ├── Navbar.tsx                      # Navegação
│   ├── PlanCard.tsx                    # Card de plano
│   ├── ProviderLogo.tsx                # Logo do provedor
│   ├── StarRating.tsx                  # Estrelas
│   ├── ReviewCard.tsx                  # Card de avaliação
│   └── CTALoginCard.tsx               # CTA para visitantes
├── lib/
│   ├── prisma.ts                       # Cliente Prisma
│   └── auth.ts                         # Config NextAuth
├── prisma/
│   ├── schema.prisma                   # Schema do banco
│   └── seed.ts                         # Dados de exemplo
├── types/
│   └── next-auth.d.ts                  # Tipos da sessão
├── .env.example                        # Variáveis de ambiente
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🔧 Comandos úteis

```bash
# Rodar em desenvolvimento
npm run dev

# Abrir o Prisma Studio (interface visual do banco)
npm run db:studio

# Recriar todas as tabelas (cuidado: apaga dados)
npm run db:push

# Rodar o seed novamente
npm run db:seed

# Build para produção
npm run build
npm start
```

---

## 🌟 Funcionalidades

| Funcionalidade | Visitante | Logado |
|---|---|---|
| Buscar planos por CEP | ✅ (2 planos) | ✅ (todos) |
| Ver detalhes do plano | ✅ | ✅ |
| Ver avaliações | ✅ | ✅ |
| Questionário personalizado | ❌ | ✅ |
| Comparação detalhada | ❌ | ✅ |
| Deixar avaliação | ❌ | ✅ |
| Filtros por categoria | ❌ | ✅ |

---

## ❓ Problemas comuns

**Erro: `DATABASE_URL` not set**
→ Certifique que copiou `.env.example` para `.env` e preencheu.

**Erro: `connect ECONNREFUSED`**
→ O PostgreSQL não está rodando. Inicie o serviço ou o Docker.

**Erro: `prisma generate` falhou**
→ Rode `npm install` novamente e tente de novo.

**Página em branco / erro 500**
→ Verifique o terminal onde rodou `npm run dev` para ver o erro.
