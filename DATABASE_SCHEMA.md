# 🗄️ TabSync - Schema do Banco de Dados

> **PostgreSQL** com **Prisma ORM**

---

## 📋 Diagrama ER (Entity Relationship)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    Users    │◄────────│ Restaurants  │────────►│    Menu     │
│             │  owner  │              │         │   Items     │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │ participates          │ has                    │
       │                       │                        │
       ▼                       ▼                        │
┌─────────────┐         ┌──────────────┐               │
│   Orders    │◄────────│  Order Items │◄──────────────┘
│             │         │              │
└──────┬──────┘         └──────────────┘
       │
       │ has
       │
       ▼
┌─────────────┐         ┌──────────────────┐
│  Payments   │────────►│  Split Payments  │  🔥 DIFERENCIAL
│             │         │  (Rachar Conta)  │
└─────────────┘         └──────────────────┘
```

---

## 📊 Tabelas Detalhadas

### **1. Users (Usuários)**

```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) UNIQUE NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  full_name         VARCHAR(255) NOT NULL,
  phone             VARCHAR(20),
  role              VARCHAR(20) NOT NULL, -- 'customer', 'restaurant_owner', 'admin'
  avatar_url        TEXT,
  email_verified    BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Campos**:
- `id`: Identificador único
- `role`: Define permissões (cliente, dono de restaurante, admin)
- `email_verified`: Para validação de email futura

---

### **2. Restaurants (Restaurantes)**

```sql
CREATE TABLE restaurants (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  slug              VARCHAR(255) UNIQUE NOT NULL, -- URL amigável
  description       TEXT,
  logo_url          TEXT,
  cover_url         TEXT,

  -- Endereço
  address_street    VARCHAR(255),
  address_city      VARCHAR(100),
  address_state     VARCHAR(50),
  address_zip       VARCHAR(20),
  address_country   VARCHAR(50) DEFAULT 'Brasil',

  -- Contato
  phone             VARCHAR(20),
  email             VARCHAR(255),

  -- Configurações
  is_active         BOOLEAN DEFAULT TRUE,
  accepts_orders    BOOLEAN DEFAULT TRUE,
  currency          VARCHAR(3) DEFAULT 'BRL',

  -- Horários (JSON para flexibilidade)
  operating_hours   JSONB, -- {"monday": {"open": "11:00", "close": "23:00"}, ...}

  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_active ON restaurants(is_active);
```

---

### **3. Menu Categories (Categorias do Cardápio)**

```sql
CREATE TABLE menu_categories (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id     UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name              VARCHAR(100) NOT NULL,
  description       TEXT,
  display_order     INTEGER DEFAULT 0,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_menu_categories_restaurant ON menu_categories(restaurant_id);
```

---

### **4. Menu Items (Itens do Cardápio)**

```sql
CREATE TABLE menu_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id     UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id       UUID REFERENCES menu_categories(id) ON DELETE SET NULL,

  name              VARCHAR(255) NOT NULL,
  description       TEXT,
  image_url         TEXT,

  price             DECIMAL(10,2) NOT NULL, -- Em centavos: R$ 25,90 = 2590

  -- Informações nutricionais (opcional)
  calories          INTEGER,
  allergens         TEXT[], -- ['glúten', 'lactose', 'amendoim']

  -- Disponibilidade
  is_available      BOOLEAN DEFAULT TRUE,
  stock_quantity    INTEGER, -- NULL = ilimitado

  -- Customizações
  customizations    JSONB, -- {"tamanho": ["P", "M", "G"], "molho": ["barbecue", "mostarda"]}

  display_order     INTEGER DEFAULT 0,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
```

---

### **5. Orders (Pedidos)** 🔥

```sql
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id     UUID NOT NULL REFERENCES restaurants(id),

  -- Número do pedido (visível para cliente)
  order_number      VARCHAR(20) UNIQUE NOT NULL, -- Ex: "PED-001234"

  -- Mesa/Identificação
  table_number      VARCHAR(20), -- Mesa 5, Balcão, etc.

  -- Status do pedido
  status            VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'

  -- Financeiro
  subtotal          DECIMAL(10,2) NOT NULL,
  tax_amount        DECIMAL(10,2) DEFAULT 0, -- Taxa de serviço
  discount_amount   DECIMAL(10,2) DEFAULT 0,
  total_amount      DECIMAL(10,2) NOT NULL,

  -- Divisão de conta 🔥
  is_split          BOOLEAN DEFAULT FALSE,
  split_count       INTEGER DEFAULT 1, -- Quantas pessoas vão dividir

  -- Observações
  notes             TEXT,

  -- Timestamps
  created_at        TIMESTAMP DEFAULT NOW(),
  confirmed_at      TIMESTAMP,
  completed_at      TIMESTAMP,
  cancelled_at      TIMESTAMP
);

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE UNIQUE INDEX idx_orders_number ON orders(order_number);
```

---

### **6. Order Items (Itens do Pedido)**

```sql
CREATE TABLE order_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id      UUID NOT NULL REFERENCES menu_items(id),

  -- Quem pediu (para rachar conta) 🔥
  user_id           UUID REFERENCES users(id),

  quantity          INTEGER NOT NULL DEFAULT 1,
  unit_price        DECIMAL(10,2) NOT NULL, -- Preço na hora do pedido (pode mudar depois)

  -- Customizações escolhidas
  customizations    JSONB, -- {"tamanho": "G", "molho": "barbecue"}

  -- Observações específicas
  notes             TEXT, -- "Sem cebola", "Mal passado"

  -- Se é compartilhado 🔥
  is_shared         BOOLEAN DEFAULT FALSE,
  shared_with       UUID[], -- IDs dos usuários que compartilham

  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_user ON order_items(user_id);
```

---

### **7. Payments (Pagamentos)** 🔥

```sql
CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id),

  -- Tipo de pagamento
  payment_method    VARCHAR(50) NOT NULL, -- 'credit_card', 'debit_card', 'pix', 'cash'

  -- Gateway de pagamento
  gateway           VARCHAR(50), -- 'stripe', 'mercadopago', null (se cash)
  gateway_id        VARCHAR(255), -- ID da transação no gateway

  -- Valores
  amount            DECIMAL(10,2) NOT NULL,
  currency          VARCHAR(3) DEFAULT 'BRL',

  -- Status
  status            VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'processing', 'completed', 'failed', 'refunded'

  -- Metadados
  metadata          JSONB, -- Dados extras do gateway

  -- Timestamps
  created_at        TIMESTAMP DEFAULT NOW(),
  processed_at      TIMESTAMP,
  completed_at      TIMESTAMP
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_gateway_id ON payments(gateway_id);
```

---

### **8. Split Payments (Divisão de Pagamentos)** 🔥🔥 **CORE DIFERENCIAL**

```sql
CREATE TABLE split_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id),

  -- Participante
  user_id           UUID NOT NULL REFERENCES users(id),
  user_email        VARCHAR(255) NOT NULL, -- Email de quem vai pagar
  user_name         VARCHAR(255), -- Nome do participante

  -- Cálculo
  split_method      VARCHAR(20) NOT NULL,
  -- 'equal' (divide igualmente)
  -- 'by_item' (cada um paga o que pediu)
  -- 'custom' (valor customizado)
  -- 'percentage' (porcentagem do total)

  amount_due        DECIMAL(10,2) NOT NULL, -- Quanto essa pessoa deve pagar

  -- Status do pagamento individual
  payment_status    VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'paid', 'failed', 'cancelled'

  payment_id        UUID REFERENCES payments(id), -- Link para pagamento individual

  -- Link de pagamento
  payment_link      TEXT, -- URL única para essa pessoa pagar
  payment_token     VARCHAR(255) UNIQUE, -- Token para validação

  -- Timestamps
  created_at        TIMESTAMP DEFAULT NOW(),
  paid_at           TIMESTAMP,
  expires_at        TIMESTAMP -- Link expira após X horas
);

CREATE INDEX idx_split_payments_order ON split_payments(order_id);
CREATE INDEX idx_split_payments_user ON split_payments(user_id);
CREATE INDEX idx_split_payments_status ON split_payments(payment_status);
CREATE UNIQUE INDEX idx_split_payments_token ON split_payments(payment_token);
```

**Exemplo de uso**:
```json
// Pedido total: R$ 100
// 2 participantes: João e Maria

// Split Payment - João
{
  "order_id": "xxx",
  "user_id": "joao-id",
  "split_method": "by_item",
  "amount_due": 60.00, // João pediu R$ 60 em itens
  "payment_link": "https://tabsync.app/pay/abc123"
}

// Split Payment - Maria
{
  "order_id": "xxx",
  "user_id": "maria-id",
  "split_method": "by_item",
  "amount_due": 40.00, // Maria pediu R$ 40 em itens
  "payment_link": "https://tabsync.app/pay/def456"
}
```

---

### **9. Order Participants (Participantes do Pedido)** 🔥

```sql
CREATE TABLE order_participants (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id), -- Pode ser NULL (convidado)

  -- Se não estiver logado
  guest_name        VARCHAR(255),
  guest_email       VARCHAR(255),

  role              VARCHAR(20) DEFAULT 'participant', -- 'creator', 'participant'

  joined_at         TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_participants_order ON order_participants(order_id);
CREATE INDEX idx_order_participants_user ON order_participants(user_id);
```

---

### **10. Analytics Events (Eventos para Analytics)**

```sql
CREATE TABLE analytics_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id     UUID REFERENCES restaurants(id),
  user_id           UUID REFERENCES users(id),

  event_type        VARCHAR(50) NOT NULL,
  -- 'order_created', 'payment_completed', 'menu_viewed', 'item_added', etc.

  event_data        JSONB, -- Dados específicos do evento

  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_restaurant ON analytics_events(restaurant_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);
```

---

## 🔍 Queries Importantes (Exemplos)

### **Buscar pedido com split payments**
```sql
SELECT
  o.*,
  json_agg(sp.*) as split_payments
FROM orders o
LEFT JOIN split_payments sp ON sp.order_id = o.id
WHERE o.id = 'order-uuid'
GROUP BY o.id;
```

### **Calcular total a pagar por usuário (by_item)**
```sql
SELECT
  oi.user_id,
  SUM(oi.quantity * oi.unit_price) as amount_due
FROM order_items oi
WHERE oi.order_id = 'order-uuid'
GROUP BY oi.user_id;
```

### **Top 10 itens mais vendidos**
```sql
SELECT
  mi.name,
  COUNT(oi.id) as order_count,
  SUM(oi.quantity) as total_quantity
FROM order_items oi
JOIN menu_items mi ON mi.id = oi.menu_item_id
WHERE mi.restaurant_id = 'restaurant-uuid'
GROUP BY mi.id, mi.name
ORDER BY total_quantity DESC
LIMIT 10;
```

---

## 🚀 Prisma Schema (próximo passo)

Vou gerar o arquivo `schema.prisma` completo com todas essas tabelas!

---

**Status**: ✅ Modelagem completa
**Última atualização**: 2025-01-04
