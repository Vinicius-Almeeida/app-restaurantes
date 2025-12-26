# 📡 TabSync API Documentation

> **Backend API completa para gerenciamento de restaurantes, pedidos e pagamentos com sistema de divisão de conta**

**Base URL**: `http://localhost:4000/api`

---

## 🔐 Autenticação

Todos os endpoints protegidos requerem um token JWT no header:

```
Authorization: Bearer {token}
```

### Endpoints

#### **POST /auth/register**
Registrar novo usuário

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "fullName": "João Silva",
  "phone": "+5511999999999",
  "role": "CUSTOMER" // ou "RESTAURANT_OWNER"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### **POST /auth/login**
Login de usuário

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### **POST /auth/refresh**
Renovar token de acesso

**Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### **GET /auth/profile**
Obter perfil do usuário autenticado (requer autenticação)

---

## 🏪 Restaurantes

### Endpoints

#### **POST /restaurants**
Criar restaurante (requer role: RESTAURANT_OWNER)

**Body:**
```json
{
  "name": "Pizzaria do Zé",
  "slug": "pizzaria-do-ze",
  "description": "As melhores pizzas da cidade",
  "phone": "+5511999999999",
  "email": "contato@pizzariadoze.com",
  "addressStreet": "Rua das Pizzas, 123",
  "addressCity": "São Paulo",
  "addressState": "SP",
  "addressZip": "01234-567",
  "operatingHours": {
    "monday": { "open": "18:00", "close": "23:00" },
    "tuesday": { "open": "18:00", "close": "23:00" }
  }
}
```

#### **GET /restaurants**
Listar restaurantes (requer autenticação)

#### **GET /restaurants/:id**
Obter restaurante por ID (requer autenticação)

#### **GET /restaurants/slug/:slug**
Obter restaurante por slug (público)

#### **PUT /restaurants/:id**
Atualizar restaurante (requer ownership)

#### **DELETE /restaurants/:id**
Deletar restaurante (requer ownership)

#### **PATCH /restaurants/:id/toggle-active**
Ativar/desativar restaurante

#### **PATCH /restaurants/:id/toggle-orders**
Habilitar/desabilitar pedidos

---

## 🍕 Menu (Cardápio)

### Categorias

#### **POST /menu/categories**
Criar categoria (requer role: RESTAURANT_OWNER)

**Body:**
```json
{
  "restaurantId": "uuid",
  "name": "Pizzas",
  "description": "Nossas deliciosas pizzas",
  "displayOrder": 1
}
```

#### **GET /menu/restaurant/:restaurantId/categories**
Listar categorias de um restaurante (público)

#### **GET /menu/categories/:id**
Obter categoria por ID (público)

#### **PUT /menu/categories/:id**
Atualizar categoria

#### **DELETE /menu/categories/:id**
Deletar categoria

### Itens do Menu

#### **POST /menu/items**
Criar item do menu (requer role: RESTAURANT_OWNER)

**Body:**
```json
{
  "restaurantId": "uuid",
  "categoryId": "uuid",
  "name": "Pizza Margherita",
  "description": "Molho de tomate, mussarela e manjericão",
  "price": 45.90,
  "imageUrl": "https://example.com/pizza.jpg",
  "calories": 850,
  "allergens": ["glúten", "lactose"],
  "customizations": {
    "tamanho": ["Pequena", "Média", "Grande"],
    "borda": ["Tradicional", "Catupiry", "Cheddar"]
  },
  "displayOrder": 1
}
```

#### **GET /menu/restaurant/:restaurantId/items**
Listar itens do menu de um restaurante (público)

Query params:
- `includeUnavailable=true` - Incluir itens indisponíveis

#### **GET /menu/items/:id**
Obter item do menu por ID (público)

#### **GET /menu/restaurant/:restaurantId/full**
Obter menu completo com categorias e itens (público)

#### **PUT /menu/items/:id**
Atualizar item do menu

#### **DELETE /menu/items/:id**
Deletar item do menu

#### **PATCH /menu/items/:id/toggle-availability**
Marcar item como disponível/indisponível

---

## 🛒 Pedidos (Orders)

#### **POST /orders**
Criar pedido (requer autenticação)

**Body:**
```json
{
  "restaurantId": "uuid",
  "tableNumber": "Mesa 5",
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 2,
      "customizations": {
        "tamanho": "Média",
        "borda": "Catupiry"
      },
      "notes": "Sem cebola",
      "isShared": false
    }
  ],
  "taxAmount": 5.00,
  "discountAmount": 0,
  "notes": "Entregar rápido"
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "data": {
    "id": "uuid",
    "orderNumber": "PED-250105-0001",
    "status": "PENDING",
    "totalAmount": 96.80,
    ...
  }
}
```

#### **GET /orders**
Listar pedidos (filtrado por role e usuário)

Query params:
- `restaurantId=uuid` - Filtrar por restaurante (para donos)

#### **GET /orders/:id**
Obter pedido por ID

#### **POST /orders/:id/items**
Adicionar item ao pedido

**Body:**
```json
{
  "menuItemId": "uuid",
  "quantity": 1,
  "customizations": {},
  "notes": "Bem passado"
}
```

#### **PATCH /orders/:id/status**
Atualizar status do pedido (requer role: RESTAURANT_OWNER)

**Body:**
```json
{
  "status": "CONFIRMED" // PENDING | CONFIRMED | PREPARING | READY | DELIVERED | CANCELLED
}
```

#### **POST /orders/:id/participants**
Adicionar participante ao pedido

**Body:**
```json
{
  "userId": "uuid", // OU
  "guestName": "Maria Silva",
  "guestEmail": "maria@example.com"
}
```

---

## 💳 Pagamentos & Split Bill 🔥

### Split Bill (Divisão de Conta) - CORE FEATURE

#### **POST /payments/split/:orderId**
Criar divisão de conta (requer autenticação)

**Body (Método EQUAL - dividir igualmente):**
```json
{
  "splitMethod": "EQUAL",
  "participants": [
    {
      "userId": "uuid-1",
      "userEmail": "joao@example.com",
      "userName": "João Silva"
    },
    {
      "userId": "uuid-2",
      "userEmail": "maria@example.com",
      "userName": "Maria Santos"
    }
  ]
}
```

**Body (Método BY_ITEM - cada um paga o que consumiu):**
```json
{
  "splitMethod": "BY_ITEM",
  "participants": [
    {
      "userId": "uuid-1",
      "userEmail": "joao@example.com",
      "userName": "João Silva"
    },
    {
      "userId": "uuid-2",
      "userEmail": "maria@example.com",
      "userName": "Maria Santos"
    }
  ]
}
```

**Body (Método CUSTOM - valores customizados):**
```json
{
  "splitMethod": "CUSTOM",
  "participants": [
    {
      "userId": "uuid-1",
      "userEmail": "joao@example.com",
      "userName": "João Silva",
      "amountDue": 60.00
    },
    {
      "userId": "uuid-2",
      "userEmail": "maria@example.com",
      "userName": "Maria Santos",
      "amountDue": 36.80
    }
  ]
}
```

**Response:**
```json
{
  "message": "Bill split created successfully",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid-1",
      "userEmail": "joao@example.com",
      "userName": "João Silva",
      "amountDue": 48.40,
      "paymentStatus": "PENDING",
      "paymentLink": "http://localhost:3000/pay/abc123...",
      "paymentToken": "abc123...",
      "expiresAt": "2025-01-06T10:00:00.000Z"
    },
    {
      "id": "uuid",
      "userId": "uuid-2",
      "userEmail": "maria@example.com",
      "userName": "Maria Santos",
      "amountDue": 48.40,
      "paymentStatus": "PENDING",
      "paymentLink": "http://localhost:3000/pay/def456...",
      "paymentToken": "def456...",
      "expiresAt": "2025-01-06T10:00:00.000Z"
    }
  ]
}
```

#### **GET /payments/split/order/:orderId**
Obter divisões de pagamento de um pedido (requer autenticação)

#### **GET /payments/split/token/:token**
Obter informações de pagamento por token (público - para link de pagamento)

**Response:**
```json
{
  "message": "Split payment retrieved successfully",
  "data": {
    "id": "uuid",
    "amountDue": 48.40,
    "paymentStatus": "PENDING",
    "userName": "João Silva",
    "order": {
      "orderNumber": "PED-250105-0001",
      "restaurant": {
        "name": "Pizzaria do Zé",
        "logoUrl": "..."
      }
    }
  }
}
```

#### **POST /payments/split/:splitPaymentId/process**
Processar pagamento individual (público - para link de pagamento)

**Body:**
```json
{
  "method": "CREDIT_CARD", // CREDIT_CARD | DEBIT_CARD | PIX
  "gateway": "stripe", // stripe | mercadopago
  "paymentToken": "tok_from_gateway",
  "metadata": {
    "cardLast4": "1234"
  }
}
```

**Response:**
```json
{
  "message": "Payment processed successfully",
  "data": {
    "id": "uuid",
    "paymentStatus": "PAID",
    "paidAt": "2025-01-05T10:30:00.000Z",
    "payment": {
      "id": "uuid",
      "transactionId": "stripe_...",
      "status": "COMPLETED"
    }
  }
}
```

### Pagamentos Regulares

#### **POST /payments**
Criar pagamento regular (requer autenticação)

**Body:**
```json
{
  "orderId": "uuid",
  "method": "CREDIT_CARD",
  "amount": 96.80,
  "gateway": "stripe",
  "metadata": {}
}
```

#### **GET /payments/order/:orderId**
Listar pagamentos de um pedido

---

## 🎯 Fluxo de Uso Completo

### 1. Dono de Restaurante

```bash
# 1. Registrar como RESTAURANT_OWNER
POST /auth/register

# 2. Criar restaurante
POST /restaurants

# 3. Criar categorias do menu
POST /menu/categories

# 4. Adicionar itens ao menu
POST /menu/items

# 5. Monitorar pedidos
GET /orders?restaurantId=uuid

# 6. Atualizar status dos pedidos
PATCH /orders/:id/status
```

### 2. Cliente - Pedido com Split Bill

```bash
# 1. Registrar como CUSTOMER
POST /auth/register

# 2. Ver menu do restaurante
GET /menu/restaurant/:restaurantId/full

# 3. Criar pedido
POST /orders

# 4. Adicionar participantes ao pedido
POST /orders/:id/participants

# 5. Cada participante adiciona seus itens
POST /orders/:id/items

# 6. Solicitar divisão de conta
POST /payments/split/:orderId
# Retorna links de pagamento para cada participante

# 7. Cada participante acessa seu link e paga
GET /payments/split/token/:token
POST /payments/split/:splitPaymentId/process
```

---

## 🔥 Diferenciais Implementados

### 1. **Sistema de Split Bill Inteligente**
- ✅ Divisão igualitária (EQUAL)
- ✅ Divisão por item consumido (BY_ITEM)
- ✅ Divisão customizada (CUSTOM)
- ✅ Links de pagamento únicos e seguros
- ✅ Expiração automática de links (24h)
- ✅ Rastreamento individual de pagamentos

### 2. **Itens Compartilhados**
- Marcar itens como compartilhados entre participantes
- Divisão automática do valor entre quem compartilhou

### 3. **Abstração de Payment Gateway**
- Interface única para múltiplos gateways
- Fácil troca entre Stripe e Mercado Pago
- Preparado para produção (requer apenas adicionar SDKs)

### 4. **Real-time Ready**
- Socket.IO configurado
- Pronto para notificações de status de pedido
- Notificações de pagamentos concluídos

---

## 🚀 Próximos Passos (Produção)

1. **Integrar Payment Gateways Reais**
   - Instalar Stripe SDK: `npm install stripe`
   - Instalar Mercado Pago SDK: `npm install mercadopago`
   - Substituir implementações mock

2. **Configurar Banco de Dados**
   - Executar: `npm run prisma:migrate`
   - Configurar DATABASE_URL no .env

3. **Implementar Webhooks**
   - Stripe webhook handler
   - Mercado Pago IPN handler

4. **Adicionar Notificações**
   - Email (SendGrid/Resend)
   - SMS/Push (Firebase/OneSignal)

5. **Deploy**
   - Backend: Railway/Render
   - Database: Neon/Supabase
   - Cache: Upstash Redis

---

**🍽️ TabSync Backend - Versão 0.1.0**
