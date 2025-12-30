# TabSync - Features de Monetização

> Documentação das features críticas para geração de receita adicional na plataforma TabSync

---

## Índice

1. [Customer Behavior Analytics](#1-customer-behavior-analytics)
2. [TabSync Payment Gateway](#2-tabsync-payment-gateway)
3. [Integração com Sistema Existente](#3-integração-com-sistema-existente)
4. [Roadmap de Implementação](#4-roadmap-de-implementação)

---

## 1. CUSTOMER BEHAVIOR ANALYTICS

### 1.1 Visão Geral

Sistema de rastreamento de comportamento de pedidos para cada cliente, permitindo duas fontes de receita:

1. **Push Marketing (B2B)**: Restaurantes compram serviço de push notifications segmentadas
2. **Anúncios na Plataforma (B2B2C)**: Venda de espaço publicitário baseado em preferências

### 1.2 Objetivo de Negócio

- Criar perfis comportamentais detalhados de cada cliente
- Permitir que restaurantes façam marketing direcionado
- Vender inventário publicitário para marcas (cervejarias, fornecedores, etc)
- Aumentar LTV dos restaurantes através de ferramentas de retenção

### 1.3 Dados Coletados por Cliente

#### Dados Agregados

| Métrica | Descrição | Uso |
|---------|-----------|-----|
| **Pratos mais pedidos** | Ranking com frequência e última vez | Promoções direcionadas |
| **Categorias preferidas** | Bebidas, sobremesas, principais, etc | Segmentação de campanhas |
| **Frequência de visitas** | Por restaurante (weekly, monthly, etc) | Campanhas de reativação |
| **Ticket médio** | Valor médio gasto por visita | Upselling direcionado |
| **Horários preferidos** | Dia da semana + hora | Promoções em horários específicos |
| **Itens compartilhados vs individuais** | Comportamento de divisão | Ofertas de combos |
| **Métodos de pagamento** | PIX, crédito, débito | Ofertas de cashback |
| **Combinações frequentes** | Sempre pede X com Y | Sugestão de combos |

#### Dados de Sessão

- Tempo médio na mesa
- Número médio de itens por pedido
- Padrão de reordenação (pede mais rodadas?)
- Taxa de split bill vs pagamento único

### 1.4 Schema Prisma

```prisma
model CustomerAnalytics {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  restaurantId    String?  @map("restaurant_id") // null = analytics global

  // Métricas agregadas
  totalOrders     Int      @default(0) @map("total_orders")
  totalSpent      Decimal  @default(0) @db.Decimal(10, 2) @map("total_spent")
  avgTicket       Decimal  @default(0) @db.Decimal(10, 2) @map("avg_ticket")
  lastVisit       DateTime? @map("last_visit")
  visitFrequency  String?  @map("visit_frequency") // WEEKLY, BIWEEKLY, MONTHLY, SPORADIC

  // Preferências (JSON para flexibilidade)
  topCategories   Json     @map("top_categories")  // [{categoryId, name, count, percentage}]
  topItems        Json     @map("top_items")       // [{itemId, name, count, lastOrdered}]
  preferredTimes  Json     @map("preferred_times") // [{dayOfWeek, hour, count}]
  combinations    Json?    // [{items: [id1, id2], count}]

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  user       User        @relation(fields: [userId], references: [id])
  restaurant Restaurant? @relation(fields: [restaurantId], references: [id])

  @@unique([userId, restaurantId])
  @@index([userId])
  @@index([restaurantId])
  @@map("customer_analytics")
}

model PushCampaign {
  id              String   @id @default(uuid())
  restaurantId    String   @map("restaurant_id")
  name            String
  type            CampaignType // PROMO, NEW_ITEM, REMINDER, CUSTOM

  // Segmentação
  targetCriteria  Json     @map("target_criteria") // {topCategories: ['BEBIDAS'], minOrders: 5, etc}
  targetCount     Int      @map("target_count")    // Quantos clientes matcharam

  // Conteúdo
  title           String
  message         String   @db.Text
  imageUrl        String?  @map("image_url")
  actionUrl       String?  @map("action_url")

  // Agendamento
  scheduledAt     DateTime? @map("scheduled_at")
  sentAt          DateTime? @map("sent_at")

  // Métricas
  sentCount       Int      @default(0) @map("sent_count")
  openedCount     Int      @default(0) @map("opened_count")
  clickedCount    Int      @default(0) @map("clicked_count")
  convertedCount  Int      @default(0) @map("converted_count") // Fez pedido após push

  // Billing
  costPerPush     Decimal  @db.Decimal(10, 4) @map("cost_per_push")
  totalCost       Decimal  @db.Decimal(10, 2) @map("total_cost")
  isPaid          Boolean  @default(false) @map("is_paid")

  status          CampaignStatus @default(DRAFT)
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  restaurant Restaurant @relation(fields: [restaurantId], references: [id])

  @@index([restaurantId])
  @@index([status])
  @@index([scheduledAt])
  @@map("push_campaigns")
}

enum CampaignType {
  PROMO        // Promoção
  NEW_ITEM     // Novo item no cardápio
  REMINDER     // Lembrete (faz tempo que não vem)
  CUSTOM       // Customizado
}

enum CampaignStatus {
  DRAFT        // Rascunho
  SCHEDULED    // Agendada
  SENDING      // Enviando
  SENT         // Enviada
  CANCELLED    // Cancelada
}

model PlatformAd {
  id              String   @id @default(uuid())
  advertiserId    String   @map("advertiser_id") // Pode ser restaurante ou empresa externa

  // Segmentação
  targetCriteria  Json     @map("target_criteria") // {topCategories: ['CERVEJA'], regions: ['SP']}

  // Conteúdo
  title           String
  description     String?  @db.Text
  imageUrl        String   @map("image_url")
  actionUrl       String   @map("action_url")

  // Posicionamento
  placement       AdPlacement // HOME_BANNER, MENU_SIDEBAR, CHECKOUT_FOOTER, POST_ORDER

  // Budget e Billing
  budgetDaily     Decimal  @db.Decimal(10, 2) @map("budget_daily")
  budgetTotal     Decimal  @db.Decimal(10, 2) @map("budget_total")
  costPerView     Decimal  @db.Decimal(10, 4) @map("cost_per_view")    // CPM
  costPerClick    Decimal  @db.Decimal(10, 4) @map("cost_per_click")   // CPC

  // Métricas
  impressions     Int      @default(0)
  clicks          Int      @default(0)
  spent           Decimal  @default(0) @db.Decimal(10, 2)

  // Período
  startsAt        DateTime @map("starts_at")
  endsAt          DateTime @map("ends_at")

  status          AdStatus @default(PENDING_REVIEW)
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  advertiser User @relation(fields: [advertiserId], references: [id])

  @@index([advertiserId])
  @@index([status])
  @@index([placement])
  @@index([startsAt, endsAt])
  @@map("platform_ads")
}

enum AdPlacement {
  HOME_BANNER      // Banner na home
  MENU_SIDEBAR     // Sidebar do menu
  CHECKOUT_FOOTER  // Footer no checkout
  POST_ORDER       // Após fazer pedido
  SEARCH_RESULTS   // Nos resultados de busca
}

enum AdStatus {
  PENDING_REVIEW   // Aguardando aprovação
  ACTIVE           // Ativo
  PAUSED           // Pausado pelo anunciante
  REJECTED         // Rejeitado
  COMPLETED        // Budget esgotado ou período encerrado
}
```

### 1.5 Endpoints da API

#### Customer Analytics

```typescript
// GET /api/analytics/customer/:userId
// Acesso: SUPER_ADMIN ou próprio usuário
// Retorna: analytics global do cliente
{
  userId: string;
  global: {
    totalOrders: number;
    totalSpent: number;
    avgTicket: number;
    restaurantsVisited: number;
    topCategories: Array<{categoryId: string; name: string; percentage: number}>;
    topItems: Array<{itemId: string; name: string; count: number}>;
  };
  byRestaurant: Array<CustomerAnalytics>;
}

// GET /api/analytics/customer/:userId/restaurant/:restaurantId
// Acesso: RESTAURANT_OWNER (seu restaurante) ou próprio usuário
// Retorna: analytics específico do restaurante

// POST /api/analytics/track-order
// Acesso: Interno (chamado após cada pedido)
// Body: { orderId: string }
// Atualiza analytics do cliente
```

#### Push Campaigns

```typescript
// POST /api/campaigns/push
// Acesso: RESTAURANT_OWNER
// Body: CreatePushCampaignDto
{
  name: string;
  type: CampaignType;
  targetCriteria: {
    topCategories?: string[];
    topItems?: string[];
    minOrders?: number;
    minSpent?: number;
    visitFrequency?: string[];
    lastVisitDaysAgo?: number;
  };
  title: string;
  message: string;
  imageUrl?: string;
  actionUrl?: string;
  scheduledAt?: Date;
}

// GET /api/campaigns/push
// Acesso: RESTAURANT_OWNER
// Retorna: campanhas do restaurante

// GET /api/campaigns/push/:id
// Acesso: RESTAURANT_OWNER
// Retorna: detalhes + métricas da campanha

// PATCH /api/campaigns/push/:id
// Acesso: RESTAURANT_OWNER
// Body: UpdatePushCampaignDto (apenas se status = DRAFT)

// POST /api/campaigns/push/:id/send
// Acesso: RESTAURANT_OWNER
// Envia ou agenda campanha

// GET /api/campaigns/audience-preview
// Acesso: RESTAURANT_OWNER
// Query: targetCriteria
// Retorna: quantos clientes matcham os critérios (preview antes de criar)
```

#### Platform Ads

```typescript
// POST /api/ads
// Acesso: Anunciante (RESTAURANT_OWNER ou empresa externa)
// Body: CreateAdDto
{
  targetCriteria: {
    topCategories?: string[];
    regions?: string[];
    ageRange?: [number, number];
    minTicket?: number;
  };
  title: string;
  description?: string;
  imageUrl: string;
  actionUrl: string;
  placement: AdPlacement;
  budgetDaily: number;
  budgetTotal: number;
  costPerView: number;
  costPerClick: number;
  startsAt: Date;
  endsAt: Date;
}

// GET /api/ads
// Acesso: Anunciante
// Retorna: anúncios do anunciante

// PATCH /api/ads/:id
// Acesso: Anunciante
// Body: { status: 'PAUSED' | 'ACTIVE' } ou UpdateAdDto (se DRAFT)

// GET /api/ads/:id/metrics
// Acesso: Anunciante
// Retorna: impressions, clicks, CTR, spent, etc
```

#### Admin (TabSync)

```typescript
// GET /api/admin/campaigns
// Acesso: SUPER_ADMIN
// Retorna: todas as campanhas push (paginado)

// GET /api/admin/ads
// Acesso: SUPER_ADMIN
// Retorna: todos os anúncios (paginado)

// PATCH /api/admin/ads/:id/review
// Acesso: SUPER_ADMIN
// Body: { status: 'ACTIVE' | 'REJECTED', reason?: string }

// GET /api/admin/revenue/push
// Acesso: SUPER_ADMIN
// Retorna: receita total de push marketing (por período)

// GET /api/admin/revenue/ads
// Acesso: SUPER_ADMIN
// Retorna: receita total de anúncios (por período)
```

### 1.6 Modelo de Receita

#### Push Marketing (B2B - Restaurantes)

| Pacote | Pushes | Preço | Custo por Push |
|--------|--------|-------|----------------|
| Starter | 1.000 | R$ 100 | R$ 0,10 |
| Growth | 5.000 | R$ 400 | R$ 0,08 |
| Pro | 10.000 | R$ 700 | R$ 0,07 |
| Enterprise | 50.000 | R$ 3.000 | R$ 0,06 |

**Segmentação Avançada (Add-on):**
- Targeting por comportamento: +30%
- Agendamento avançado: +20%
- A/B testing: +40%

#### Anúncios na Plataforma (B2B2C)

**Modelo CPM (Custo por Mil Impressões):**
- Home Banner: R$ 20 CPM
- Menu Sidebar: R$ 15 CPM
- Post-Order: R$ 25 CPM (alta conversão)

**Modelo CPC (Custo por Clique):**
- Média: R$ 0,50 por clique
- Segmentado: R$ 0,80 por clique

**Receita Projetada:**
- 100 restaurantes x 2 campanhas/mês x R$ 400 = **R$ 80.000/mês**
- 10 marcas x R$ 5.000/mês em anúncios = **R$ 50.000/mês**
- **Total: R$ 130.000/mês de receita adicional**

### 1.7 Privacidade e LGPD

#### Dados Coletados

- **Base legal**: Legítimo interesse (melhoria do serviço)
- **Consentimento**: Opt-in para push notifications e anúncios personalizados
- **Direitos**: Usuário pode solicitar exclusão de analytics (art. 18 LGPD)

#### Anonimização

- Anunciantes veem apenas agregados (não identificam clientes individualmente)
- Push campaigns enviam para IDs anônimos
- Dados sensíveis (CPF, cartão) NUNCA usados em analytics

#### Termo de Uso

Atualizar termos para incluir:
- Coleta de dados de pedidos para analytics
- Uso de dados para marketing segmentado
- Compartilhamento anonimizado com anunciantes

---

## 2. TABSYNC PAYMENT GATEWAY

### 2.1 Visão Geral

Gateway de pagamentos proprietário com parcerias diretas com bancos, substituindo Stripe/MercadoPago.

### 2.2 Vantagens Estratégicas

| Aspecto | Stripe/MercadoPago | TabSync Gateway |
|---------|-------------------|-----------------|
| **Taxas** | 3-5% + R$ 0,40 | 1.5-2.5% (margem 0.5-1%) |
| **Controle** | Limitado | Total |
| **Dados** | Parcialmente ocultos | 100% proprietários |
| **Margem** | Fixa | Negociável por merchant |
| **Antecipação** | Terceirizado | Próprio |
| **Crédito** | Não | Possível no futuro |

### 2.3 Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        TABSYNC GATEWAY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐      ┌──────────────┐      ┌─────────────┐ │
│   │   Cliente    │─────▶│   TabSync    │─────▶│   Banco     │ │
│   │   (App)      │      │   Gateway    │      │  Parceiro   │ │
│   └──────────────┘      └──────────────┘      └─────────────┘ │
│                                │                               │
│                                │                               │
│                                ▼                               │
│                         ┌──────────────┐                       │
│                         │   Webhook    │                       │
│                         │   Handler    │                       │
│                         └──────────────┘                       │
│                                │                               │
│                                ▼                               │
│                         ┌──────────────┐                       │
│                         │  Settlement  │                       │
│                         │   Engine     │                       │
│                         └──────────────┘                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  MÉTODOS SUPORTADOS:                                           │
│  ✓ PIX (QR Code dinâmico) - Banco parceiro                    │
│  ✓ Cartão de Crédito - Adquirente parceiro                    │
│  ✓ Cartão de Débito - Adquirente parceiro                     │
│  ○ Boleto (futuro)                                             │
│  ○ Wallet TabSync (futuro - saldo pré-pago)                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Fluxo de Pagamento PIX

```
1. Cliente seleciona PIX no checkout
         ↓
2. Backend gera txId único (UUID)
         ↓
3. Chama API do banco parceiro
   POST /api/v1/pix/qrcode
   {
     txId: "uuid",
     amount: 50.00,
     merchant: {
       pixKey: "chave-do-restaurante",
       name: "Restaurante X"
     },
     expiresIn: 900 // 15 minutos
   }
         ↓
4. Banco retorna QR Code
   {
     qrCode: "00020126580014BR.GOV.BCB.PIX...",
     qrCodeBase64: "data:image/png;base64,...",
     txId: "uuid"
   }
         ↓
5. Frontend exibe QR Code para cliente
         ↓
6. Cliente escaneia e paga no app do banco
         ↓
7. Banco envia webhook
   POST /api/gateway/webhooks/banco-x
   {
     event: "pix.paid",
     txId: "uuid",
     endToEndId: "E123456789202412301430...",
     amount: 50.00,
     paidAt: "2025-12-30T14:30:00Z"
   }
         ↓
8. Gateway processa webhook
   - Valida assinatura
   - Atualiza Transaction → status: PAID
   - Emite evento Socket.IO → payment-received
   - Atualiza Order → status: PAID
         ↓
9. D+1: Settlement automático
   - Agrupa transações do período
   - Calcula taxas
   - Transfere para conta do merchant
```

### 2.5 Schema Prisma

```prisma
// Contas dos restaurantes no gateway
model MerchantAccount {
  id              String   @id @default(uuid())
  restaurantId    String   @unique @map("restaurant_id")

  // Dados bancários
  bankCode        String   @map("bank_code")
  bankName        String   @map("bank_name")
  accountType     String   @map("account_type") // CHECKING, SAVINGS
  accountNumber   String   @map("account_number")
  accountDigit    String   @map("account_digit")
  branchNumber    String   @map("branch_number")
  branchDigit     String?  @map("branch_digit")

  // PIX
  pixKeyType      String?  @map("pix_key_type") // CPF, CNPJ, EMAIL, PHONE, RANDOM
  pixKey          String?  @map("pix_key")

  // Taxas negociadas (podem variar por merchant)
  feePixPercent   Decimal  @default(0.5) @db.Decimal(5, 4) @map("fee_pix_percent")
  feeCreditPercent Decimal @default(2.5) @db.Decimal(5, 4) @map("fee_credit_percent")
  feeDebitPercent Decimal  @default(1.5) @db.Decimal(5, 4) @map("fee_debit_percent")

  // Antecipação
  anticipationEnabled Boolean @default(false) @map("anticipation_enabled")
  anticipationFee     Decimal? @db.Decimal(5, 4) @map("anticipation_fee")

  // Verificação
  status          MerchantStatus @default(PENDING_VERIFICATION)
  verifiedAt      DateTime? @map("verified_at")

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  restaurant   Restaurant    @relation(fields: [restaurantId], references: [id])
  transactions Transaction[]
  settlements  Settlement[]

  @@index([status])
  @@map("merchant_accounts")
}

enum MerchantStatus {
  PENDING_VERIFICATION
  ACTIVE
  SUSPENDED
  BLOCKED
}

// Transações do gateway
model Transaction {
  id              String   @id @default(uuid())
  merchantId      String   @map("merchant_id")
  orderId         String?  @map("order_id")
  splitPaymentId  String?  @map("split_payment_id")

  // Valor
  amount          Decimal  @db.Decimal(10, 2)
  fee             Decimal  @db.Decimal(10, 2) // Taxa cobrada
  netAmount       Decimal  @db.Decimal(10, 2) @map("net_amount") // Valor líquido

  // Método
  method          PaymentMethod

  // PIX específico
  pixQrCode       String?  @db.Text @map("pix_qr_code")
  pixQrCodeBase64 String?  @db.Text @map("pix_qr_code_base64")
  pixTxId         String?  @unique @map("pix_tx_id")
  pixEndToEnd     String?  @map("pix_end_to_end")

  // Cartão específico
  cardBrand       String?  @map("card_brand")
  cardLast4       String?  @map("card_last4")
  cardHolderName  String?  @map("card_holder_name")
  installments    Int      @default(1)

  // Status
  status          TransactionStatus @default(PENDING)

  // Banco parceiro
  bankReference   String?  @map("bank_reference")
  bankResponse    Json?    @map("bank_response")

  // Timestamps
  createdAt       DateTime @default(now()) @map("created_at")
  paidAt          DateTime? @map("paid_at")
  failedAt        DateTime? @map("failed_at")
  refundedAt      DateTime? @map("refunded_at")

  // Liquidação
  settlementId    String?  @map("settlement_id")
  settledAt       DateTime? @map("settled_at")

  merchant    MerchantAccount @relation(fields: [merchantId], references: [id])
  settlement  Settlement?     @relation(fields: [settlementId], references: [id])

  @@index([merchantId])
  @@index([orderId])
  @@index([status])
  @@index([method])
  @@index([pixTxId])
  @@index([createdAt(sort: Desc)])
  @@map("transactions")
}

enum TransactionStatus {
  PENDING          // Aguardando pagamento
  PROCESSING       // Processando
  PAID             // Pago
  FAILED           // Falhou
  CANCELLED        // Cancelado
  REFUNDED         // Estornado
  PARTIALLY_REFUNDED // Estorno parcial
  CHARGEBACK       // Contestação
}

// Liquidações (repasse para merchants)
model Settlement {
  id              String   @id @default(uuid())
  merchantId      String   @map("merchant_id")

  // Período
  periodStart     DateTime @map("period_start")
  periodEnd       DateTime @map("period_end")

  // Valores
  grossAmount     Decimal  @db.Decimal(10, 2) @map("gross_amount")
  totalFees       Decimal  @db.Decimal(10, 2) @map("total_fees")
  netAmount       Decimal  @db.Decimal(10, 2) @map("net_amount")

  // Antecipação
  anticipatedAmount Decimal? @db.Decimal(10, 2) @map("anticipated_amount")
  anticipationFee   Decimal? @db.Decimal(10, 2) @map("anticipation_fee")

  // Transações incluídas
  transactionCount Int @map("transaction_count")

  // Transferência
  bankTransferId  String?  @map("bank_transfer_id")
  transferredAt   DateTime? @map("transferred_at")

  status          SettlementStatus @default(PENDING)
  createdAt       DateTime @default(now()) @map("created_at")

  merchant     MerchantAccount @relation(fields: [merchantId], references: [id])
  transactions Transaction[]

  @@index([merchantId])
  @@index([status])
  @@index([periodEnd])
  @@map("settlements")
}

enum SettlementStatus {
  PENDING          // Aguardando liquidação
  PROCESSING       // Processando transferência
  SETTLED          // Liquidado
  FAILED           // Falha na transferência
}

// Webhooks recebidos dos bancos
model GatewayWebhook {
  id              String   @id @default(uuid())
  source          String   // BANCO_X, BANCO_Y
  eventType       String   @map("event_type")
  payload         Json

  // Processamento
  processed       Boolean  @default(false)
  processedAt     DateTime? @map("processed_at")
  error           String?  @db.Text

  // Referência
  transactionId   String?  @map("transaction_id")

  receivedAt      DateTime @default(now()) @map("received_at")

  @@index([source, eventType])
  @@index([processed])
  @@index([transactionId])
  @@map("gateway_webhooks")
}
```

### 2.6 Endpoints da API

#### Transações

```typescript
// POST /api/gateway/transactions/pix
// Acesso: CUSTOMER (próprio pedido) ou RESTAURANT_OWNER
// Body: CreatePixTransactionDto
{
  orderId?: string;
  splitPaymentId?: string;
  amount: number;
  expiresIn?: number; // segundos (default: 900)
}
// Retorna: Transaction com QR Code

// POST /api/gateway/transactions/card
// Acesso: CUSTOMER (próprio pedido) ou RESTAURANT_OWNER
// Body: CreateCardTransactionDto
{
  orderId?: string;
  splitPaymentId?: string;
  amount: number;
  cardNumber: string; // tokenizado no frontend
  cardHolderName: string;
  cardExpiry: string;
  cardCvv: string; // tokenizado no frontend
  installments: number;
}
// Retorna: Transaction

// GET /api/gateway/transactions/:id
// Acesso: Dono da transação ou RESTAURANT_OWNER
// Retorna: Transaction com status atualizado

// POST /api/gateway/transactions/:id/refund
// Acesso: RESTAURANT_OWNER ou SUPER_ADMIN
// Body: { amount?: number, reason: string }
// Retorna: Transaction atualizada
```

#### Webhooks (Bancos Parceiros)

```typescript
// POST /api/gateway/webhooks/banco-x
// Acesso: IP whitelistado + assinatura HMAC
// Body: payload do banco
// Processa evento e atualiza transação

// POST /api/gateway/webhooks/banco-y
// Acesso: IP whitelistado + assinatura HMAC
// Body: payload do banco
```

#### Merchant Account

```typescript
// GET /api/gateway/merchant/balance
// Acesso: RESTAURANT_OWNER (própria conta)
// Retorna: saldo disponível e a liquidar

// GET /api/gateway/merchant/transactions
// Acesso: RESTAURANT_OWNER (própria conta)
// Query: { startDate?, endDate?, status?, method?, page, limit }
// Retorna: extrato de transações

// GET /api/gateway/merchant/settlements
// Acesso: RESTAURANT_OWNER (própria conta)
// Retorna: liquidações (histórico de repasses)

// POST /api/gateway/merchant/anticipate
// Acesso: RESTAURANT_OWNER (se habilitado)
// Body: { amount: number }
// Retorna: Settlement antecipada
```

#### Admin (TabSync)

```typescript
// GET /api/admin/gateway/transactions
// Acesso: SUPER_ADMIN
// Query: { merchantId?, status?, method?, startDate?, endDate?, page, limit }
// Retorna: todas as transações

// GET /api/admin/gateway/settlements
// Acesso: SUPER_ADMIN
// Query: { merchantId?, status?, startDate?, endDate?, page, limit }
// Retorna: todas as liquidações

// GET /api/admin/gateway/revenue
// Acesso: SUPER_ADMIN
// Query: { startDate?, endDate?, groupBy? }
// Retorna: receita total do gateway (taxas)

// PATCH /api/admin/gateway/merchants/:id
// Acesso: SUPER_ADMIN
// Body: { feePixPercent?, feeCreditPercent?, feeDebitPercent?, anticipationEnabled? }
// Atualiza taxas do merchant
```

### 2.7 Modelo de Receita do Gateway

#### Taxas por Método de Pagamento

| Método | Taxa Banco | Taxa TabSync | Margem TabSync |
|--------|-----------|--------------|----------------|
| **PIX** | 0.2% | 0.5 - 1.0% | 0.3 - 0.8% |
| **Crédito à vista** | 1.8% | 2.5 - 3.5% | 0.7 - 1.7% |
| **Crédito parcelado** | 2.5% | 3.5 - 4.5% | 1.0 - 2.0% |
| **Débito** | 1.0% | 1.5 - 2.0% | 0.5 - 1.0% |

#### Serviços Premium

| Serviço | Descrição | Pricing |
|---------|-----------|---------|
| **Antecipação D+0** | Recebe no mesmo dia | Taxa de 2.5% sobre valor antecipado |
| **Antecipação D+1** | Recebe no dia seguinte | Taxa de 1.5% sobre valor antecipado |
| **Parcelamento estendido** | Até 12x sem juros | +0.5% por transação |
| **Link de pagamento** | Venda sem mesa | +0.2% por transação |
| **API avançada** | Integrações customizadas | R$ 500/mês |

#### Projeção de Receita

**Cenário: 100 restaurantes ativos**

| Métrica | Valor |
|---------|-------|
| Ticket médio por pedido | R$ 80 |
| Pedidos por restaurante/mês | 300 |
| Total de pedidos/mês | 30.000 |
| GMV (Gross Merchandise Value) | R$ 2.400.000 |
| **Mix de pagamentos:** | |
| PIX (60%) | R$ 1.440.000 × 0.6% = **R$ 8.640** |
| Crédito (30%) | R$ 720.000 × 1.2% = **R$ 8.640** |
| Débito (10%) | R$ 240.000 × 0.8% = **R$ 1.920** |
| **Receita Gateway/mês** | **R$ 19.200** |
| **Receita Gateway/ano** | **R$ 230.400** |

**Com 500 restaurantes:**
- R$ 96.000/mês
- R$ 1.152.000/ano

**Serviços Premium (estimativa 20% adoção):**
- R$ 20.000/mês adicional
- **Total: R$ 116.000/mês**

### 2.8 Segurança e Compliance

#### PCI-DSS Compliance

- **Nunca armazenar CVV**
- **Tokenização** de cartões no frontend (uso de biblioteca certificada)
- **Criptografia AES-256** para dados sensíveis
- **TLS 1.3** obrigatório em todas as conexões
- **Auditoria** de todas as transações

#### Validações Obrigatórias

```typescript
// Webhook signature validation
function validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// IP whitelist
const ALLOWED_IPS = [
  '192.168.1.1', // Banco X
  '10.0.0.1',    // Banco Y
];

function isAllowedIP(ip: string): boolean {
  return ALLOWED_IPS.includes(ip);
}

// Amount validation (sempre do backend)
function validateTransactionAmount(transaction: Transaction, order: Order): boolean {
  return transaction.amount === order.total;
}
```

#### Idempotência

- Todos os endpoints de criação de transação aceitam `idempotencyKey`
- Evita duplicação de cobranças em retry

```typescript
// Header: X-Idempotency-Key: uuid-v4
// Se já existe transação com essa key → retorna a existente
```

---

## 3. INTEGRAÇÃO COM SISTEMA EXISTENTE

### 3.1 Pontos de Integração

#### Analytics ao Criar Pedido

```typescript
// backend/src/modules/orders/orders.service.ts

async createOrder(data: CreateOrderDto, userId: string) {
  const order = await this.prisma.order.create({ data });

  // NOVO: Chamar analytics service
  await this.analyticsService.trackOrder(order.id);

  return order;
}
```

#### Gateway ao Processar Pagamento

```typescript
// backend/src/modules/payments/payments.service.ts

async processSplitPayment(splitPaymentId: string, token: string) {
  const payment = await this.findByToken(token);

  // ANTIGO: Chamar Stripe
  // const charge = await stripe.charges.create({ ... });

  // NOVO: Chamar TabSync Gateway
  const transaction = await this.gatewayService.createPixTransaction({
    splitPaymentId,
    amount: payment.amount,
  });

  return transaction;
}
```

### 3.2 Migração de Dados

#### Analytics Histórico

```typescript
// backend/scripts/migrate-analytics.ts

async function migrateHistoricalOrders() {
  const orders = await prisma.order.findMany({
    where: { status: 'DELIVERED' },
    include: { items: { include: { menuItem: true } } }
  });

  for (const order of orders) {
    await analyticsService.trackOrder(order.id);
  }
}
```

#### Gateway Migration

- **Fase 1**: Implementar gateway em paralelo (0-3 meses)
- **Fase 2**: A/B test 10% do tráfego (3-4 meses)
- **Fase 3**: Migração gradual 50% → 100% (4-6 meses)
- **Fase 4**: Deprecar Stripe (6+ meses)

### 3.3 Feature Flags

```typescript
// backend/src/config/features.ts

export const FEATURES = {
  ANALYTICS_ENABLED: process.env.FEATURE_ANALYTICS === 'true',
  PUSH_CAMPAIGNS_ENABLED: process.env.FEATURE_PUSH_CAMPAIGNS === 'true',
  PLATFORM_ADS_ENABLED: process.env.FEATURE_PLATFORM_ADS === 'true',
  TABSYNC_GATEWAY_ENABLED: process.env.FEATURE_TABSYNC_GATEWAY === 'true',
  GATEWAY_PERCENTAGE: Number(process.env.GATEWAY_PERCENTAGE || '0'), // 0-100
};
```

---

## 4. ROADMAP DE IMPLEMENTAÇÃO

### 4.1 Fase 1: Customer Behavior Analytics (Q1 2026)

#### Sprint 1-2: Schema + Backend (4 semanas)

- [ ] Criar models `CustomerAnalytics`, `PushCampaign`, `PlatformAd`
- [ ] Implementar `AnalyticsService` para tracking de pedidos
- [ ] Criar endpoints GET `/api/analytics/customer/:userId`
- [ ] Script de migração de dados históricos
- [ ] Testes unitários + integração

#### Sprint 3-4: Push Campaigns (4 semanas)

- [ ] Implementar `CampaignsService`
- [ ] Endpoints CRUD de campanhas
- [ ] Sistema de segmentação (target criteria)
- [ ] Integração com Firebase Cloud Messaging (FCM)
- [ ] Dashboard para restaurantes (frontend)
- [ ] Testes E2E

#### Sprint 5-6: Platform Ads (4 semanas)

- [ ] Implementar `AdsService`
- [ ] Endpoints CRUD de anúncios
- [ ] Sistema de review de anúncios (admin)
- [ ] Componentes de exibição (frontend)
- [ ] Tracking de impressions/clicks
- [ ] Billing automático

### 4.2 Fase 2: TabSync Payment Gateway (Q2-Q3 2026)

#### Sprint 7-8: Infraestrutura + PIX (4 semanas)

- [ ] Criar models `MerchantAccount`, `Transaction`, `Settlement`
- [ ] Negociação com banco parceiro (PIX)
- [ ] Implementar `GatewayService` - PIX
- [ ] Webhook handler + signature validation
- [ ] Testes com sandbox do banco
- [ ] Certificação PCI-DSS (início)

#### Sprint 9-10: Cartão de Crédito/Débito (4 semanas)

- [ ] Negociação com adquirente
- [ ] Implementar tokenização frontend (PCI)
- [ ] `GatewayService` - Cartão
- [ ] Webhook handler - Cartão
- [ ] Testes com sandbox
- [ ] Certificação PCI-DSS (conclusão)

#### Sprint 11-12: Settlement Engine (4 semanas)

- [ ] Implementar `SettlementService`
- [ ] Cron job para liquidação D+1
- [ ] Integração com TED/DOC/PIX para repasse
- [ ] Dashboard de saldo para restaurantes
- [ ] Relatórios de transações
- [ ] Testes E2E completo

#### Sprint 13-14: Antecipação de Recebíveis (4 semanas)

- [ ] `AnticipationService`
- [ ] Cálculo de taxas
- [ ] Aprovação de crédito (regras)
- [ ] Endpoint de solicitação
- [ ] Dashboard de antecipação
- [ ] Testes

### 4.3 Fase 3: Otimização + Scale (Q4 2026)

#### Sprint 15-16: Performance

- [ ] Índices otimizados em analytics
- [ ] Cache de segmentação (Redis)
- [ ] Batch processing de webhooks
- [ ] Monitoramento de latência

#### Sprint 17-18: Admin Dashboard

- [ ] Métricas de receita de push/ads
- [ ] Métricas de receita de gateway
- [ ] Relatórios financeiros
- [ ] Gestão de merchants

### 4.4 Métricas de Sucesso

| KPI | Target Q1 | Target Q2 | Target Q4 |
|-----|-----------|-----------|-----------|
| **Analytics Coverage** | 80% dos clientes | 95% | 100% |
| **Push Campaigns Adoption** | 20% restaurantes | 40% | 60% |
| **Platform Ads Revenue** | R$ 10k/mês | R$ 30k/mês | R$ 50k/mês |
| **Gateway GMV** | 10% do total | 50% | 100% |
| **Gateway Uptime** | - | 99.5% | 99.9% |
| **Settlement Success Rate** | - | 95% | 99% |

---

## 5. CONSIDERAÇÕES FINAIS

### 5.1 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Resistência a analytics** | Média | Baixo | Opt-in transparente + valor claro |
| **Baixa adoção de push** | Alta | Médio | Período free trial + tutoriais |
| **Gateway downtime** | Baixa | Alto | Multi-banco redundancy + fallback |
| **Fraude em pagamentos** | Média | Alto | Anti-fraud engine + 3DS |
| **Compliance (PCI/LGPD)** | Média | Alto | Auditoria externa + certificações |

### 5.2 Dependências Externas

- **Banco parceiro PIX**: Negociação + contrato + integração técnica
- **Adquirente cartão**: Negociação + compliance PCI-DSS
- **Firebase/OneSignal**: Push notifications infrastructure
- **Certificadora PCI**: Auditoria obrigatória para cartões

### 5.3 Próximos Passos

1. **Aprovação executiva** deste documento
2. **Negociação com bancos** (início imediato)
3. **Contratação especialista PCI** (se necessário)
4. **Criação de tasks no backlog** (sprints detalhados)
5. **Kick-off Fase 1** (Analytics)

---

**Documento criado em:** 2025-12-30
**Versão:** 1.0
**Autor:** TabSync Product Team
**Status:** Aguardando aprovação
