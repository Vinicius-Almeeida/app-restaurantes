# TabSync - Diretrizes de Desenvolvimento

## ⚠️ AMBIENTE DE DESENVOLVIMENTO - WINDOWS

> **CRÍTICO**: Este projeto é desenvolvido em **Windows**. Todos os agentes DEVEM seguir estas regras:

### Comandos Proibidos no Windows
| ❌ NÃO USAR | ✅ ALTERNATIVA |
|-------------|----------------|
| `mkdir -p` | Use a ferramenta **Write** para criar arquivos (cria diretórios automaticamente) |
| `rm -rf` | Use `rmdir /s /q` ou delete arquivos individualmente |
| `touch` | Use a ferramenta **Write** |
| `cat` | Use a ferramenta **Read** |
| `grep` | Use a ferramenta **Grep** |
| `find` | Use a ferramenta **Glob** |
| `ls` | Use `dir` ou a ferramenta **Bash** com `ls` (Git Bash) |
| `cp -r` | Use `xcopy /E /I` |

### Regra de Ouro para Criar Arquivos
**NUNCA use Bash para criar diretórios ou arquivos**. Use SEMPRE as ferramentas:
- `Write` → Cria arquivo (e diretórios pai automaticamente)
- `Edit` → Edita arquivo existente
- `Read` → Lê arquivo

### Se um comando Bash falhar
1. **NÃO repita o mesmo comando** - isso causa loop infinito
2. **Use ferramentas nativas** (Write, Read, Edit, Glob, Grep)
3. **Adapte para Windows** se precisar de Bash

---

## MISSÃO

**TabSync** - Plataforma SaaS multi-tenant para gestão de pedidos e pagamentos em restaurantes com **divisão inteligente de contas (Split Bill)**.

---

## 🏆 SELO DE QUALIDADE FAANG

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   ⭐ FAANG-LEVEL CERTIFIED DEVELOPMENT ⭐                        ║
║                                                                  ║
║   Este projeto segue padrões de desenvolvimento das maiores      ║
║   empresas de tecnologia do mundo:                               ║
║                                                                  ║
║   Meta • Google • Amazon • Netflix • Apple • X                   ║
║                                                                  ║
║   ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║   COMPROMISSO:                                                   ║
║   ✓ Zero gambiarras                                              ║
║   ✓ Zero soluções temporárias                                    ║
║   ✓ Zero "TODO: fix later"                                       ║
║   ✓ Zero comprometimento da qualidade                            ║
║   ✓ Código definitivo desde a primeira linha                     ║
║                                                                  ║
║   NÍVEL: ENTERPRISE | EQUIPE: SENIOR GLOBAL                      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 🛡️ COMPLIANCE, GOVERNANÇA E SEGURANÇA

> **SEGURANÇA VEM ANTES DE QUALQUER FEATURE**

### Frameworks de Compliance

| Framework | Escopo | Status |
|-----------|--------|--------|
| **LGPD** | Dados pessoais de usuários brasileiros | Obrigatório |
| **PCI-DSS** | Processamento de pagamentos | Obrigatório |
| **ISO 27001** | Sistema de gestão de segurança | Referência |
| **SOC 2 Type II** | Controles de segurança | Referência |
| **OWASP Top 10** | Vulnerabilidades web | Obrigatório |

### Governança de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    CLASSIFICAÇÃO DE DADOS                   │
├─────────────────────────────────────────────────────────────┤
│ 🔴 CRÍTICO    │ Senhas, tokens, dados de cartão, CPF       │
│               │ → Criptografia AES-256, nunca em logs      │
├───────────────┼─────────────────────────────────────────────┤
│ 🟠 SENSÍVEL   │ Email, telefone, endereço, pedidos         │
│               │ → Acesso controlado, audit trail           │
├───────────────┼─────────────────────────────────────────────┤
│ 🟡 INTERNO    │ Métricas, configurações, cardápio          │
│               │ → Acesso por role                          │
├───────────────┼─────────────────────────────────────────────┤
│ 🟢 PÚBLICO    │ Nome do restaurante, categorias            │
│               │ → Sem restrições                           │
└───────────────┴─────────────────────────────────────────────┘
```

### Princípios de Segurança

1. **Defense in Depth** - Múltiplas camadas de proteção
2. **Least Privilege** - Mínimo acesso necessário
3. **Zero Trust** - Nunca confie, sempre verifique
4. **Secure by Default** - Seguro desde o design
5. **Fail Secure** - Em caso de erro, falhe de forma segura

### Audit Trail Obrigatório

Eventos que DEVEM ser logados:
- Login/logout (sucesso e falha)
- Criação/modificação de pedidos
- Processamento de pagamentos
- Alterações de permissões
- Acesso negado
- Modificações em dados sensíveis

---

## 🎯 FILOSOFIA CORE

### Prioridades (em ordem ABSOLUTA)

```
1. 🛡️ SEGURANÇA    → Código seguro sempre, sem exceções
2. ✅ CORRETUDE    → Código que funciona corretamente
3. 📖 CLAREZA      → Código legível e manutenível
4. ⚡ PERFORMANCE  → Código otimizado
```

### ❌ ZERO TOLERÂNCIA - INEGOCIÁVEL

| Proibido | Consequência |
|----------|--------------|
| Gambiarras / workarounds | Rejeição imediata |
| "TODO: fix later" | Rejeição imediata |
| `any` no TypeScript | Rejeição imediata |
| Ignorar erros silenciosamente | Rejeição imediata |
| Skip de testes ou linting | Rejeição imediata |
| Código comentado "para depois" | Rejeição imediata |
| Soluções temporárias | Rejeição imediata |
| "Funciona, depois melhoro" | Rejeição imediata |
| Copiar código sem entender | Rejeição imediata |
| Secrets hardcoded | Rejeição imediata |

### Métricas de Qualidade

| Métrica | Target | Bloqueante |
|---------|--------|------------|
| Cobertura de Testes | ≥ 80% | Sim |
| Code Review | 100% | Sim |
| Bugs Críticos em Prod | 0 | Sim |
| Documentação de APIs | 100% | Sim |
| Vulnerabilidades Críticas | 0 | Sim |
| TypeScript Strict | 100% | Sim |

---

## 🏗️ ARQUITETURA MULTI-TENANT

### Hierarquia de Usuários

```
┌─────────────────────────────────────────────────────────────┐
│                     NÍVEL 1 - PLATAFORMA                    │
├─────────────────────────────────────────────────────────────┤
│  SUPER_ADMIN     │ Donos da plataforma TabSync              │
│  CONSULTANT      │ Consultores de onboarding                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NÍVEL 2 - RESTAURANTE                    │
├─────────────────────────────────────────────────────────────┤
│  RESTAURANT_OWNER │ Admin do restaurante                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      NÍVEL 3 - STAFF                        │
├─────────────────────────────────────────────────────────────┤
│  WAITER          │ Garçom                                   │
│  KITCHEN         │ Equipe de cozinha                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NÍVEL 4 - CLIENTE                        │
├─────────────────────────────────────────────────────────────┤
│  CUSTOMER        │ Cliente final (conta global)             │
└─────────────────────────────────────────────────────────────┘
```

### Separação de Ambientes

| Rota | Usuários | Descrição |
|------|----------|-----------|
| `/login` | CUSTOMER | Login de clientes |
| `/register` | CUSTOMER | Cadastro de clientes |
| `/restaurant/login` | OWNER, WAITER, KITCHEN | Login staff |
| `/super-admin` | SUPER_ADMIN, CONSULTANT | Painel da plataforma |

### Fluxo do Cliente na Mesa

```
┌─────────────────────────────────────────────────────────────┐
│                    JORNADA DO CLIENTE                       │
└─────────────────────────────────────────────────────────────┘

1. 📱 Escaneia QR Code da mesa
         │
         ▼
2. 👑 Primeiro a escanear = DONO DA MESA
         │
         ▼
3. 👥 Outros escaneiam → Solicitam entrada
         │
         ▼
4. ✅ Dono aceita/recusa membros
         │
         ▼
5. 🍽️ Todos podem fazer pedidos → Comanda compartilhada
         │
         ▼
6. 📊 Acompanhamento real-time
   (Recebido → Preparando → Pronto → Entregue)
         │
         ▼
7. 💰 Fechamento com Split Bill
   ├── Dividir igualmente
   ├── Por item (quem pediu, paga)
   ├── Percentual
   └── Customizado
         │
         ▼
8. 💳 Cada pessoa paga sua parte
         │
         ├── ✅ Pagou → Recebe QR de saída
         └── ❌ Não pagou → Vai ao caixa físico
```

---

## 👥 AGENTES ESPECIALIZADOS - SELO FAANG

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🏅 FAANG-CERTIFIED AGENT                                       ║
║                                                                  ║
║   Cada agente opera com padrões de excelência global.            ║
║   Código produzido é DEFINITIVO, não requer revisão posterior.   ║
║                                                                  ║
║   REGRAS DO AGENTE:                                              ║
║   • Entrega código pronto para produção                          ║
║   • Zero débito técnico                                          ║
║   • Documentação inline quando necessário                        ║
║   • Testes incluídos quando aplicável                            ║
║   • Segurança validada                                           ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

### Distribuição de Responsabilidades

| Domínio | Agente Principal | Agente Suporte | Responsabilidade |
|---------|------------------|----------------|------------------|
| **Database** | `database-architect` | `database-optimizer` | Schema, migrations, queries |
| **Backend API** | `backend-architect` | `api-security-audit` | Endpoints, services, validação |
| **Frontend** | `nextjs-architecture-expert` | `frontend-developer` | Componentes, páginas, state |
| **Segurança** | `security-auditor` | `penetration-tester` | Audit, vulnerabilidades |
| **Performance** | `performance-engineer` | `web-vitals-optimizer` | Otimização, métricas |
| **Testes** | `test-automator` | `debugger` | Unit, integration, E2E |
| **DevOps** | `devops-engineer` | `vercel-deployment-specialist` | CI/CD, infra |
| **Documentação** | `api-documenter` | `technical-writer` | OpenAPI, guides |
| **Code Quality** | `code-reviewer` | `unused-code-cleaner` | Review, cleanup |

### Protocolo de Trabalho dos Agentes

```
1. RECEBE TAREFA
   │
   ▼
2. ANALISA CONTEXTO (lê arquivos relacionados)
   │
   ▼
3. PLANEJA IMPLEMENTAÇÃO
   │
   ▼
4. IMPLEMENTA COM QUALIDADE FAANG
   │
   ├── TypeScript strict
   ├── Validação Zod
   ├── Error handling
   ├── Segurança
   └── Documentação
   │
   ▼
5. VALIDA (lint, types, testes se aplicável)
   │
   ▼
6. ENTREGA CÓDIGO DEFINITIVO
```

---

## 📊 SUPER ADMIN DASHBOARD

### Métricas de Negócio

| Métrica | Descrição | Visualização |
|---------|-----------|--------------|
| **MRR** | Monthly Recurring Revenue | Gráfico + Número |
| **ARR** | Annual Recurring Revenue | Gráfico + Número |
| **Churn** | Taxa de cancelamento | Percentual |
| **LTV** | Lifetime Value | Valor médio |
| **CAC** | Custo de Aquisição | Valor médio |
| **DAU/MAU** | Usuários ativos | Gráfico |
| **GMV** | Volume transacionado | Gráfico + Número |

### Módulos do Painel

```
super-admin/
├── dashboard/        # Overview com métricas principais
├── restaurants/      # Gestão de restaurantes
│   ├── list/        # Lista com filtros
│   ├── [id]/        # Detalhes
│   └── onboarding/  # Processo de setup
├── users/           # Gestão de usuários
├── billing/         # Planos e assinaturas
│   ├── plans/       # Configuração de planos
│   ├── subscriptions/ # Assinaturas ativas
│   └── invoices/    # Cobranças
├── operations/      # Monitoramento
│   ├── realtime/    # Status em tempo real
│   ├── health/      # Saúde do sistema
│   └── alerts/      # Alertas e incidentes
├── consultants/     # Gestão de consultores
└── support/         # Tickets e SLA
```

---

## ⭐ SISTEMA DE AVALIAÇÕES E FEEDBACK

### Avaliações

```typescript
interface Review {
  overallRating: 1 | 2 | 3 | 4 | 5;
  categories: {
    food: number;        // Comida
    service: number;     // Atendimento
    ambiance: number;    // Ambiente
    waitTime: number;    // Tempo de espera
    value: number;       // Custo-benefício
  };
  comment?: string;
  restaurantResponse?: string;
}
```

### Sugestões

- Caixa de sugestões com categorias
- Opção anônima ou identificada
- Status de leitura/resposta

### Reclamações

- Canal direto com restaurante
- Níveis de prioridade
- Escalonamento para Super Admin
- SLA de resposta

### NPS (Net Promoter Score)

- Pesquisa pós-visita
- Classificação: Detratores (0-6), Neutros (7-8), Promotores (9-10)
- Tracking mensal

---

## 🔧 STACK TECNOLÓGICO

### Backend
- **Runtime**: Node.js 20+ / Express.js 4.21+
- **Linguagem**: TypeScript 5.7+ (strict mode)
- **ORM**: Prisma 5.22+ / PostgreSQL 15+
- **Cache**: Redis 7+
- **Auth**: JWT + bcryptjs
- **Validação**: Zod 3.23+
- **Real-time**: Socket.IO 4.8+
- **OCR**: Tesseract.js 6.0+ / Sharp 0.34+
- **Upload**: Multer 2.0+

### Frontend
- **Framework**: Next.js 14.2+ (App Router)
- **UI**: React 18.3+ / Tailwind CSS 3.4+ / shadcn/ui
- **State**: Zustand 5.0+
- **Forms**: React Hook Form 7.54+ / Zod
- **HTTP**: Axios 1.7+ / Socket.IO Client
- **Utils**: date-fns, Lucide React, Sonner

### Infra
- **Database**: Supabase PostgreSQL (região: São Paulo)
- **Backend**: Azure Container Apps
- **Frontend**: Vercel
- **Dev Local**: Docker + Docker Compose

---

## 📐 PRINCÍPIOS FUNDAMENTAIS

1. **SOLID** - Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion
2. **DRY** - Don't Repeat Yourself (única fonte de verdade)
3. **KISS** - Keep It Simple, Stupid (sem over-engineering)
4. **YAGNI** - You Ain't Gonna Need It (não implemente "para o futuro")
5. **Fail Fast** - Detecte erros o mais cedo possível
6. **Defense in Depth** - Rate Limit → CORS → Auth → Authorization → Validation → Business Logic

---

## 📝 TYPESCRIPT - REGRAS ABSOLUTAS

- **strict: true** em tsconfig.json
- **NUNCA** usar `any` → usar `unknown` com type guards ou generics
- **SEMPRE** tipar parâmetros e retornos de função
- **SEMPRE** validar arrays antes de map/filter: `Array.isArray(data) ? data : []`

---

## 📛 NOMENCLATURA

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Arquivos | kebab-case | `split-bill-form.tsx` |
| Classes/Interfaces/Types/Enums | PascalCase | `OrderService`, `CreateOrderDto` |
| Variáveis/Funções | camelCase | `orderTotal`, `getOrders` |
| Constantes | UPPER_SNAKE_CASE | `MAX_SPLIT_PARTICIPANTS` |
| Componentes React | PascalCase | `SplitBillForm` |
| Hooks | useCamelCase | `useOrder` |
| Branches | type/description | `feature/add-pix-payment` |

---

## 🔐 SEGURANÇA - CRÍTICO

### Autenticação
- Access Token: 15min / Refresh Token: 7 dias
- Tokens em memória (Zustand) - **NUNCA** em localStorage

### Validações Obrigatórias
- **Zod** em TODAS as rotas (backend) e formulários (frontend)
- **Ownership validation**: usuário só acessa seus próprios recursos
- **Valores de pagamento**: SEMPRE buscar do banco, NUNCA confiar no frontend

### Rate Limiting
- Global: 100 req/15min
- Auth: 5 tentativas/15min
- Pagamentos: 3 req/min

### Logging
- ✅ Logar: login attempts, orders, payments, access denied, uploads
- ❌ NUNCA logar: senhas, tokens, dados de cartão

---

## 👤 RBAC (Roles)

| Role | Nível | Permissões |
|------|-------|------------|
| **SUPER_ADMIN** | 1 | Sistema completo, todos os restaurantes |
| **CONSULTANT** | 1 | Onboarding, setup de restaurantes |
| **RESTAURANT_OWNER** | 2 | Seu restaurante, staff, cardápio, pedidos |
| **WAITER** | 3 | Pedidos, mesas, chamar cozinha |
| **KITCHEN** | 3 | Visualizar e atualizar pedidos |
| **CUSTOMER** | 4 | Fazer pedidos, dividir conta, pagar |

---

## 🔥 FEATURES CORE

### Split Bill
- Métodos: `EQUAL` | `BY_ITEM` | `CUSTOM` | `PERCENTAGE`
- Links únicos por participante com token
- Expiração: 24 horas
- Rastreamento individual de pagamentos

### Table Session
- QR Code único por mesa
- Primeiro a escanear = owner
- Aprovação de membros
- Comanda compartilhada

### Order Status
`PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `DELIVERED`
(ou `CANCELLED` em qualquer etapa antes de DELIVERED)

### Real-time (Socket.IO)

- `new-order`, `order-status-changed`
- `payment-received`, `all-payments-complete`
- `table-member-joined`, `table-member-left`

### Customer Behavior Analytics

- Rastreamento de pedidos por cliente
- Rankings de pratos preferidos e categorias
- Frequência de visitas e ticket médio
- Push marketing segmentado (B2B)
- Anúncios na plataforma (CPM/CPC)
- **Documentação:** `docs/MONETIZATION_FEATURES.md`

### TabSync Payment Gateway

- Gateway de pagamentos próprio com parcerias diretas com bancos
- PIX, Cartão de Crédito, Cartão de Débito
- Sistema de liquidação D+1 para merchants
- Antecipação de recebíveis (opcional)
- Taxas negociadas menores que Stripe/MercadoPago
- **Documentação:** `docs/MONETIZATION_FEATURES.md`

---

## 🌐 API - ENDPOINTS

```
# Auth
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
POST   /api/auth/restaurant/login
GET    /api/auth/profile

# Restaurants
CRUD   /api/restaurants
GET    /api/restaurants/slug/:slug

# Menu
CRUD   /api/menu/categories
CRUD   /api/menu/items
GET    /api/menu/restaurant/:id/full

# Table Sessions
POST   /api/tables/:tableId/session      # Iniciar sessão
POST   /api/tables/session/:id/join      # Solicitar entrada
PATCH  /api/tables/session/:id/approve   # Aprovar membro
GET    /api/tables/session/:id           # Status da sessão

# Orders
CRUD   /api/orders
PATCH  /api/orders/:id/status

# Payments
POST   /api/payments/split/:orderId
GET    /api/payments/split/token/:token
POST   /api/payments/split/:id/process

# Reviews
POST   /api/reviews
GET    /api/reviews/restaurant/:id
POST   /api/reviews/:id/response

# Super Admin
GET    /api/admin/metrics
GET    /api/admin/restaurants
GET    /api/admin/users
CRUD   /api/admin/plans
CRUD   /api/admin/consultants
```

---

## 📋 GIT WORKFLOW

### Branches
- `main` → Produção | `develop` → Staging
- `feature/*` | `fix/*` | `hotfix/*` | `refactor/*`

### Commits (Conventional)
```
feat|fix|docs|style|refactor|perf|test|chore(scope): descricao em portugues
```

**⚠️ REGRAS ABSOLUTAS:**
- Commits SEM assinatura Claude (sem Generated, sem Co-Authored-By)
- Mensagens de commit SEMPRE em português

---

## 🧪 TESTES

| Tipo | Cobertura | Ferramenta |
|------|-----------|------------|
| Unit | ≥ 80% | Jest |
| Integration | ≥ 60% | Jest + Supertest |
| E2E | Críticos | Playwright |

Padrão **AAA**: Arrange → Act → Assert

---

## ⚡ PERFORMANCE - TARGETS

| Métrica | Target |
|---------|--------|
| API Latency (p95) | < 200ms |
| Lighthouse | > 90 |
| FCP | < 1.5s |
| TTI | < 3s |
| Real-time | < 500ms |
| OCR | < 10s |

---

## ✅ CHECKLIST PRÉ-IMPLEMENTAÇÃO

### Segurança
- [ ] Inputs validados (Zod)
- [ ] Ownership validation
- [ ] Rate limiting
- [ ] Sem dados sensíveis em logs
- [ ] Valores de pagamento do backend
- [ ] CSRF protection
- [ ] XSS prevention

### Código
- [ ] TypeScript strict, ZERO `any`
- [ ] Parâmetros e retornos tipados
- [ ] DRY, funções pequenas
- [ ] Error handling completo
- [ ] Código definitivo (não temporário)

### Frontend
- [ ] Loading/Error/Empty states
- [ ] Arrays validados
- [ ] Real-time via Socket.IO
- [ ] Responsivo
- [ ] Acessibilidade (a11y)

### Git
- [ ] Commit convencional
- [ ] SEM assinatura Claude/IA
- [ ] Commit no perfil @Vinicius-Almeeida
- [ ] Branch correta

---

## 🌍 COMUNICAÇÃO

- **Usuário/UI**: Português Brasil
- **Código/Variáveis/Commits/Logs**: Inglês

---

## 💎 LEMA

> **"Split the Bill, Not the Experience"**
>
> Segurança em pagamentos é inegociável.
> Real-time é requisito, não feature.
> Zero gambiarras, sempre definitivo.
> Código FAANG desde a primeira linha.

---

## 🔗 URLS DE PRODUÇÃO

| Ambiente | URL |
|----------|-----|
| Frontend | `https://app-restaurantes.vercel.app` |
| Backend API | `https://tabsync-backend.nicestone-9f661f17.brazilsouth.azurecontainerapps.io` |
| Database | Supabase PostgreSQL (aws-1-sa-east-1) |

---

## 🔑 CREDENCIAIS DEV

| Role | Email | Senha | URL de Login |
|------|-------|-------|--------------|
| Super Admin | admin@tabsync.com | Admin123! | /super-admin |
| Consultor | maria.consultora@tabsync.com | Consultor123! | /super-admin |
| Dono Restaurante | dono@botecodochef.com.br | Dono123! | /restaurant/login |
| Garçom | pedro.garcom@botecodochef.com.br | Staff123! | /restaurant/login |
| Cozinha | chef.roberto@botecodochef.com.br | Staff123! | /restaurant/login |
| Cliente | (qualquer email gerado) | Cliente123! | /login |
