# 🏗️ TabSync - Arquitetura do Sistema

> **Visão Geral**: Plataforma web/mobile para pedidos, pagamentos e divisão de contas em restaurantes e bares

---

## 📊 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CAMADA DE APRESENTAÇÃO                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │   Web App        │         │  Mobile App      │             │
│  │   (Cliente)      │         │  (React Native)  │             │
│  │   - Next.js      │         │  - Fase 2        │             │
│  │   - TailwindCSS  │         │                  │             │
│  └────────┬─────────┘         └────────┬─────────┘             │
│           │                            │                        │
│  ┌────────▼─────────────────────────────▼────────┐             │
│  │        Dashboard Restaurante                  │             │
│  │        - Gestão de Pedidos                    │             │
│  │        - Analytics                            │             │
│  │        - Gestão de Cardápio                   │             │
│  └───────────────────────────────────────────────┘             │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTPS/WSS
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                         CAMADA DE API                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────┐          │
│  │           API Gateway (Node.js + Express)         │          │
│  │                                                    │          │
│  │  ┌──────────────┐  ┌──────────────┐              │          │
│  │  │ Auth Module  │  │ Rate Limiter │              │          │
│  │  │ (JWT)        │  │              │              │          │
│  │  └──────────────┘  └──────────────┘              │          │
│  └────────────────────────┬──────────────────────────┘          │
│                           │                                      │
│  ┌────────────────────────▼──────────────────────────┐          │
│  │              Microserviços / Módulos              │          │
│  ├───────────────────────────────────────────────────┤          │
│  │                                                    │          │
│  │  📋 Orders Service       💳 Payment Service       │          │
│  │  - CRUD pedidos          - Abstração Gateway      │          │
│  │  - Tempo real (WS)       - Split Logic (CORE!)    │          │
│  │  - Status tracking       - Histórico transações   │          │
│  │                                                    │          │
│  │  👤 Users Service        🍽️ Menu Service         │          │
│  │  - Autenticação          - CRUD cardápios         │          │
│  │  - Perfis                - Categorias             │          │
│  │  - Preferências          - Disponibilidade        │          │
│  │                                                    │          │
│  │  🏪 Restaurant Service   📊 Analytics Service     │          │
│  │  - CRUD estabelecimentos - Métricas vendas        │          │
│  │  - Configurações         - Insights consumo       │          │
│  │  - Integrações           - Relatórios             │          │
│  │                                                    │          │
│  └────────────────────────┬──────────────────────────┘          │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                    CAMADA DE DADOS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │  PostgreSQL      │    │  Redis Cache     │                  │
│  │  - Dados principais   - Sessões          │                  │
│  │  - Relacional     │    │  - Real-time data│                  │
│  │  - ACID          │    │  - Rate limiting │                  │
│  └──────────────────┘    └──────────────────┘                  │
│                                                                  │
│  ┌──────────────────────────────────────────┐                  │
│  │         AWS S3 / Cloud Storage            │                  │
│  │         - Imagens cardápio                │                  │
│  │         - Logos restaurantes              │                  │
│  └──────────────────────────────────────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRAÇÕES EXTERNAS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  💰 Payment Gateway (Abstração)                                 │
│     ├─ Stripe (preparado)                                       │
│     └─ Mercado Pago (preparado)                                 │
│                                                                  │
│  📧 Email Service (SendGrid/Resend)                             │
│  📱 SMS/Push Notifications (Firebase/OneSignal)                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Funcionalidades Core (MVP)

### **DIFERENCIAL #1: Sistema de Rachar Conta** 🔥
```typescript
// Lógica de divisão inteligente
interface SplitBill {
  billId: string;
  totalAmount: number;
  participants: Participant[];
  splitMethod: 'equal' | 'by_item' | 'custom';
  status: 'pending' | 'completed';
}

// Exemplo: Divisão por item
// Pessoa A pediu cerveja (R$ 10)
// Pessoa B pediu pizza (R$ 40)
// Compartilhado: batata frita (R$ 20) - dividir por 2
// A paga: R$ 10 + R$ 10 = R$ 20
// B paga: R$ 40 + R$ 10 = R$ 50
```

### **DIFERENCIAL #2: Pagamento In-App** 🔥
```typescript
// Abstração para múltiplos gateways
interface PaymentGateway {
  processPayment(amount: number, method: PaymentMethod): Promise<PaymentResult>;
  refund(transactionId: string): Promise<RefundResult>;
  splitPayment(participants: SplitParticipant[]): Promise<SplitResult>;
}

// Implementações:
class StripeGateway implements PaymentGateway { }
class MercadoPagoGateway implements PaymentGateway { }
```

---

## 🛠️ Stack Tecnológico

### **Frontend Web**
- **Framework**: Next.js 14+ (App Router)
- **UI**: TailwindCSS + shadcn/ui
- **Estado**: Zustand ou React Context
- **Forms**: React Hook Form + Zod
- **Real-time**: Socket.io client

### **Backend**
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **ORM**: Prisma
- **Validação**: Zod
- **Auth**: JWT + bcrypt
- **Real-time**: Socket.io

### **Banco de Dados**
- **Principal**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Storage**: AWS S3 / Cloudflare R2

### **DevOps**
- **Hosting**: Railway / Render / Vercel
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (erros) + Vercel Analytics

---

## 📁 Estrutura de Pastas

```
tabsync/
├─ backend/
│  ├─ src/
│  │  ├─ modules/
│  │  │  ├─ auth/
│  │  │  ├─ users/
│  │  │  ├─ restaurants/
│  │  │  ├─ menu/
│  │  │  ├─ orders/
│  │  │  ├─ payments/          # 🔥 CORE - Rachar conta
│  │  │  │  ├─ split-bill.service.ts
│  │  │  │  ├─ payment-gateway.interface.ts
│  │  │  │  ├─ stripe.gateway.ts
│  │  │  │  └─ mercadopago.gateway.ts
│  │  │  └─ analytics/
│  │  ├─ config/
│  │  ├─ middlewares/
│  │  ├─ utils/
│  │  └─ server.ts
│  ├─ prisma/
│  │  └─ schema.prisma
│  ├─ package.json
│  └─ tsconfig.json
│
├─ frontend-web/
│  ├─ app/
│  │  ├─ (customer)/           # Cliente
│  │  │  ├─ menu/
│  │  │  ├─ order/
│  │  │  ├─ split-bill/       # 🔥 DIFERENCIAL
│  │  │  └─ payment/          # 🔥 DIFERENCIAL
│  │  ├─ (restaurant)/        # Dashboard
│  │  │  ├─ dashboard/
│  │  │  ├─ orders/
│  │  │  ├─ menu/
│  │  │  └─ analytics/
│  │  └─ api/                 # API Routes (Next.js)
│  ├─ components/
│  ├─ lib/
│  ├─ public/
│  └─ package.json
│
├─ mobile/                     # Fase 2
│  └─ (React Native)
│
├─ docs/
│  ├─ API.md
│  ├─ DATABASE.md
│  └─ DEPLOYMENT.md
│
└─ README.md
```

---

## 🔐 Segurança

- ✅ Autenticação JWT com refresh tokens
- ✅ Rate limiting (Redis)
- ✅ Sanitização de inputs (Zod)
- ✅ HTTPS obrigatório
- ✅ CORS configurado
- ✅ Secrets em variáveis de ambiente
- ✅ PCI DSS compliance (pagamentos tokenizados)

---

## 🚀 Fluxo de Dados - Rachar Conta (Exemplo)

```
1. Cliente A cria pedido → Backend salva
2. Cliente B se junta ao pedido (QR Code/Link)
3. Ambos adicionam itens ao pedido
4. Cliente A solicita "Fechar conta"
5. Sistema calcula divisão:
   - Por item (cada um paga o que pediu)
   - Igualmente (divide total por N pessoas)
   - Customizado (define valores manualmente)
6. Cada participante recebe link de pagamento
7. Gateway processa pagamentos individuais
8. Sistema confirma quando todos pagaram
9. Restaurante recebe consolidado
```

---

## 📈 Escalabilidade

**MVP (0-1000 pedidos/dia)**:
- Monolito Next.js + Express
- PostgreSQL único
- Redis para cache

**Crescimento (1000-10000 pedidos/dia)**:
- Separar frontend e backend
- PostgreSQL réplicas (read/write)
- CDN para assets

**Escala (10000+ pedidos/dia)**:
- Microserviços independentes
- Load balancer
- Sharding de banco
- Queue para processos assíncronos (Bull/BullMQ)

---

**Status**: 🚧 Em construção
**Última atualização**: 2025-01-04
