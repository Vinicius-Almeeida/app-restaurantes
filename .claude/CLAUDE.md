# TabSync - Diretrizes de Desenvolvimento

## MISSÃO

**TabSync** - Plataforma SaaS para gestão de pedidos e pagamentos em restaurantes com **divisão inteligente de contas (Split Bill)**.

**Padrão: ENTERPRISE-LEVEL FAANG** (Meta, Google, Amazon, Netflix, Apple, X)

---

## FILOSOFIA CORE

### Prioridades (em ordem)
1. **SEGURANÇA** - Código seguro sempre
2. **CORRETUDE** - Código que funciona corretamente
3. **CLAREZA** - Código legível e manutenível
4. **PERFORMANCE** - Código otimizado

### ZERO Tolerância
- ❌ Gambiarras, workarounds, "TODO: fix later"
- ❌ `any` no TypeScript
- ❌ Ignorar erros silenciosamente
- ❌ Skip de testes ou linting
- ❌ Código comentado "para depois"

### Compliance
- LGPD (dados pessoais)
- PCI-DSS (pagamentos)
- ISO 27001 (segurança)

### Métricas de Qualidade
- Cobertura de Testes: ≥ 80%
- Code Review: 100%
- Zero Bugs Críticos em Produção
- Documentação: 100% das APIs

---

## PRINCÍPIOS FUNDAMENTAIS

1. **SOLID** - Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion
2. **DRY** - Don't Repeat Yourself (única fonte de verdade)
3. **KISS** - Keep It Simple, Stupid (sem over-engineering)
4. **YAGNI** - You Ain't Gonna Need It (não implemente "para o futuro")
5. **Fail Fast** - Detecte erros o mais cedo possível
6. **Defense in Depth** - Rate Limit → CORS → Auth → Authorization → Validation → Business Logic

---

## STACK TECNOLÓGICO

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
- Docker + Docker Compose
- Nginx (Reverse Proxy + SSL)
- Vercel (Frontend) / VPS (Backend)

---

## ARQUITETURA

### Backend (Modular)
```
backend/src/modules/
├── auth/          # JWT authentication
├── users/         # User management
├── restaurants/   # Restaurant management
├── menu/          # Categories + items
├── orders/        # Order system
├── payments/      # Payments + Split Bill 🔥
│   └── gateway/   # Stripe/MercadoPago abstraction
├── inventory/     # Stock + OCR 🔥
└── analytics/     # Metrics
```

Cada módulo: `controller.ts` → `service.ts` → `schema.ts` → `routes.ts`

### Frontend (Next.js App Router)
```
frontend-web/app/
├── (auth)/           # Login, Register
├── restaurants/      # List restaurants
├── r/[slug]/         # Restaurant menu
├── checkout/[id]/    # Checkout
├── split-bill/[id]/  # Split bill 🔥
├── orders/           # My orders
├── pay/[token]/      # Payment link 🔥
└── dashboard/        # Restaurant panel
    ├── orders/
    ├── menu/
    └── inventory/    # Stock + OCR 🔥
```

---

## TYPESCRIPT - REGRAS ABSOLUTAS

- **strict: true** em tsconfig.json
- **NUNCA** usar `any` → usar `unknown` com type guards ou generics
- **SEMPRE** tipar parâmetros e retornos de função
- **SEMPRE** validar arrays antes de map/filter: `Array.isArray(data) ? data : []`

---

## NOMENCLATURA

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

## SEGURANÇA - CRÍTICO

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

## RBAC (Roles)

| Role | Permissões |
|------|------------|
| **ADMIN** | Sistema completo |
| **RESTAURANT_OWNER** | Seus restaurantes, cardápio, pedidos, estoque, analytics |
| **CUSTOMER** | Ver restaurantes, fazer pedidos, dividir conta, pagar |

---

## FEATURES CORE

### Split Bill 🔥
- Métodos: `EQUAL` | `BY_ITEM` | `CUSTOM` | `PERCENTAGE`
- Links únicos por participante com token
- Expiração: 24 horas
- Rastreamento individual de pagamentos

### Order Status
`PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `DELIVERED`
(ou `CANCELLED` em qualquer etapa antes de DELIVERED)

### Inventory OCR 🔥
Upload PDF/imagem → OCR (Tesseract) → Extração de dados → Revisão → Confirmação → Entrada no estoque

### Real-time (Socket.IO)
- `new-order`, `order-status-changed`
- `payment-received`, `all-payments-complete`

---

## API - ENDPOINTS PRINCIPAIS

```
POST   /api/auth/login|register|refresh
GET    /api/auth/profile

CRUD   /api/restaurants
GET    /api/restaurants/slug/:slug

CRUD   /api/menu/categories|items
GET    /api/menu/restaurant/:id/full

CRUD   /api/orders
PATCH  /api/orders/:id/status

POST   /api/payments/split/:orderId     # Dividir conta
GET    /api/payments/split/token/:token # Link pagamento
POST   /api/payments/split/:id/process  # Processar

CRUD   /api/inventory/items|suppliers
POST   /api/inventory/invoices/upload   # OCR
POST   /api/inventory/invoices/:id/confirm
```

### Status Codes
- 200 OK | 201 Created | 204 No Content
- 400 Bad Request | 401 Unauthorized | 403 Forbidden | 404 Not Found
- 429 Rate Limit | 500 Internal Error

---

## GIT WORKFLOW

### Branches
- `main` → Produção | `develop` → Staging
- `feature/*` | `fix/*` | `hotfix/*` | `refactor/*`

### Commits (Conventional)
```
feat|fix|docs|style|refactor|perf|test|chore(scope): descricao em portugues
```

**⚠️ REGRAS ABSOLUTAS:**

- Commits SEM assinatura Claude (sem Generated, sem Co-Authored-By)
- Mensagens de commit SEMPRE em portugues

---

## TESTES

| Tipo | Cobertura | Ferramenta |
|------|-----------|------------|
| Unit | ≥ 80% | Jest |
| Integration | ≥ 60% | Jest + Supertest |
| E2E | Críticos | Playwright |

Padrão **AAA**: Arrange → Act → Assert

---

## PERFORMANCE - TARGETS

| Métrica | Target |
|---------|--------|
| API Latency (p95) | < 200ms |
| Lighthouse | > 90 |
| FCP | < 1.5s |
| TTI | < 3s |
| Real-time | < 500ms |
| OCR | < 10s |

---

## AGENTES ESPECIALIZADOS

| Tarefa | Agentes |
|--------|---------|
| Frontend | `frontend-developer`, `nextjs-architecture-expert` |
| Backend | `backend-architect`, `api-security-audit` |
| Database | `database-architect`, `database-optimizer` |
| Segurança | `security-auditor`, `penetration-tester` |
| Performance | `performance-engineer`, `web-vitals-optimizer` |
| DevOps | `devops-engineer`, `vercel-deployment-specialist` |
| Testes | `test-automator`, `debugger` |
| Code Review | `code-reviewer`, `unused-code-cleaner` |
| Documentação | `api-documenter`, `technical-writer` |

---

## CHECKLIST PRÉ-IMPLEMENTAÇÃO

### Segurança
- [ ] Inputs validados (Zod)
- [ ] Ownership validation
- [ ] Rate limiting
- [ ] Sem dados sensíveis em logs
- [ ] Valores de pagamento do backend

### Código
- [ ] TypeScript strict, ZERO `any`
- [ ] Parâmetros e retornos tipados
- [ ] DRY, funções pequenas

### Frontend
- [ ] Loading/Error/Empty states
- [ ] Arrays validados
- [ ] Real-time via Socket.IO

### Git
- [ ] Conventional Commits
- [ ] SEM assinatura Claude

---

## COMUNICAÇÃO

- **Usuário/UI**: Português Brasil
- **Código/Variáveis/Commits/Logs**: Inglês

---

## LEMA

> **"Split the Bill, Not the Experience"**
>
> Segurança em pagamentos é inegociável.
> Real-time é requisito, não feature.
> Zero gambiarras, sempre definitivo.

---

## CREDENCIAIS DEV

| Role | Email | Senha |
|------|-------|-------|
| Admin | admin@tabsync.com | admin123 |
| Owner | restaurante@teste.com | teste123 |
| Customer | cliente@teste.com | teste123 |
