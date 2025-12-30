# Plano de Evolucao do Banco de Dados - TabSync

## Sumario Executivo

Este documento descreve as alteracoes necessarias no schema Prisma para suportar as novas funcionalidades identificadas no prototipo `prototipo-app-restaurantes`, mantendo compatibilidade com o sistema existente e seguindo as diretrizes de arquitetura definidas em `CLAUDE.md`.

---

## 1. Analise do Estado Atual

### 1.1 Schema Existente (`backend/prisma/schema.prisma`)

O schema atual possui:

- **Users**: Usuarios com roles `CUSTOMER`, `RESTAURANT_OWNER`, `ADMIN`
- **Restaurants**: Dados do restaurante com relacao ao owner
- **Menu**: Categorias e itens de cardapio
- **Orders**: Pedidos com status flow completo
- **Payments**: Sistema de pagamentos com Split Bill
- **Inventory**: Gestao de estoque com OCR para notas fiscais
- **Analytics**: Eventos de analytics

### 1.2 Funcionalidades do Prototipo Nao Suportadas

| Funcionalidade | Status Atual | Acao Necessaria |
|----------------|--------------|-----------------|
| Perfil WAITER (Garcom) | Nao existe | Adicionar ao enum UserRole |
| Perfil KITCHEN (Cozinha) | Nao existe | Adicionar ao enum UserRole |
| Mesas com status | Apenas `tableNumber` em Order | Criar model Table |
| Chamados de garcom | Nao existe | Criar model WaiterCall |
| Taxa de servico configuravel | Nao existe | Adicionar campo em Restaurant |
| Favoritos do cliente | Nao existe | Criar model CustomerFavorite |
| Wi-Fi do restaurante | Nao existe | Adicionar campos em Restaurant |
| Historico expandido | Parcialmente existe | Ja coberto por OrderItem |

---

## 2. Alteracoes Propostas

### 2.1 Alteracao no Enum UserRole

```prisma
enum UserRole {
  CUSTOMER
  RESTAURANT_OWNER
  WAITER           // NOVO - Garcom
  KITCHEN          // NOVO - Cozinha
  ADMIN
}
```

**Justificativa**: O prototipo demonstra 4 perfis distintos com diferentes permissoes e interfaces:
- **WAITER**: Visualiza chamados, gerencia mesas, faz pedidos para clientes, entrega pedidos prontos
- **KITCHEN**: Visualiza pedidos, confirma recebimento, marca preparo, marca pronto

### 2.2 Novo Model: Table (Mesa)

```prisma
enum TableStatus {
  AVAILABLE       // Disponivel
  OCCUPIED        // Ocupada
  RESERVED        // Reservada
  CLEANING        // Em limpeza
}

model Table {
  id              String       @id @default(uuid())
  restaurantId    String       @map("restaurant_id")
  tableNumber     Int          @map("table_number")
  capacity        Int          @default(4)
  status          TableStatus  @default(AVAILABLE)
  currentOrderId  String?      @map("current_order_id")
  qrCodeUrl       String?      @map("qr_code_url") @db.Text

  // Posicionamento no layout do restaurante (opcional)
  positionX       Int?         @map("position_x")
  positionY       Int?         @map("position_y")

  isActive        Boolean      @default(true) @map("is_active")
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  // Relations
  restaurant      Restaurant   @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  orders          Order[]
  waiterCalls     WaiterCall[]

  @@unique([restaurantId, tableNumber])
  @@index([restaurantId])
  @@index([status])
  @@map("tables")
}
```

**Justificativa**:
- Permite gerenciamento visual de mesas (prototipo mostra grid de mesas)
- Suporta reservas futuras
- Armazena QR Code para cada mesa (fluxo principal do app)
- Campos de posicao permitem layout grafico futuro

### 2.3 Novo Model: WaiterCall (Chamado de Garcom)

```prisma
enum WaiterCallStatus {
  PENDING         // Aguardando
  ACKNOWLEDGED    // Garcom ciente
  ATTENDING       // Em atendimento
  COMPLETED       // Finalizado
  CANCELLED       // Cancelado
}

enum WaiterCallReason {
  UTENSILS        // Talheres
  WATER           // Agua
  QUESTION        // Duvida
  ORDER           // Fazer pedido
  BILL            // Conta
  OTHER           // Outro
}

model WaiterCall {
  id              String            @id @default(uuid())
  restaurantId    String            @map("restaurant_id")
  tableId         String            @map("table_id")
  customerId      String?           @map("customer_id")
  waiterId        String?           @map("waiter_id")

  reason          WaiterCallReason  @default(OTHER)
  reasonDetail    String?           @map("reason_detail") @db.Text
  status          WaiterCallStatus  @default(PENDING)

  createdAt       DateTime          @default(now()) @map("created_at")
  acknowledgedAt  DateTime?         @map("acknowledged_at")
  completedAt     DateTime?         @map("completed_at")

  // Relations
  restaurant      Restaurant        @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  table           Table             @relation(fields: [tableId], references: [id], onDelete: Cascade)
  customer        User?             @relation("CustomerCalls", fields: [customerId], references: [id])
  waiter          User?             @relation("WaiterCalls", fields: [waiterId], references: [id])

  @@index([restaurantId])
  @@index([tableId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@map("waiter_calls")
}
```

**Justificativa**:
- Prototipo mostra botao flutuante "Chamar Garcom" com motivos rapidos
- Garcom ve lista de chamados pendentes com botao "Atender"
- Permite rastreamento de tempo de resposta (SLA)

### 2.4 Novo Model: CustomerFavorite (Favoritos)

```prisma
model CustomerFavorite {
  id              String   @id @default(uuid())
  customerId      String   @map("customer_id")
  menuItemId      String   @map("menu_item_id")
  createdAt       DateTime @default(now()) @map("created_at")

  // Relations
  customer        User     @relation(fields: [customerId], references: [id], onDelete: Cascade)
  menuItem        MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Cascade)

  @@unique([customerId, menuItemId])
  @@index([customerId])
  @@index([menuItemId])
  @@map("customer_favorites")
}
```

**Justificativa**:
- Prototipo mostra filtro de favoritos no cardapio
- Melhora experiencia do cliente recorrente
- Permite analytics de pratos mais favoritados

### 2.5 Novo Model: RestaurantStaff (Equipe do Restaurante)

```prisma
model RestaurantStaff {
  id              String    @id @default(uuid())
  restaurantId    String    @map("restaurant_id")
  userId          String    @map("user_id")
  role            UserRole  // WAITER ou KITCHEN
  isActive        Boolean   @default(true) @map("is_active")
  hiredAt         DateTime  @default(now()) @map("hired_at")
  terminatedAt    DateTime? @map("terminated_at")

  // Relations
  restaurant      Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([restaurantId, userId])
  @@index([restaurantId])
  @@index([userId])
  @@index([isActive])
  @@map("restaurant_staff")
}
```

**Justificativa**:
- Permite que um usuario WAITER/KITCHEN trabalhe em multiplos restaurantes
- Admin pode ativar/desativar funcionarios (prototipo mostra toggle)
- Historico de contratacao

### 2.6 Alteracoes no Model Restaurant

```prisma
model Restaurant {
  // ... campos existentes ...

  // NOVOS CAMPOS - Configuracoes
  serviceFeePercent   Decimal   @default(10) @db.Decimal(5, 2) @map("service_fee_percent")

  // NOVOS CAMPOS - Wi-Fi
  wifiNetworkName     String?   @map("wifi_network_name")
  wifiPassword        String?   @map("wifi_password")

  // NOVOS CAMPOS - Operacao
  totalTables         Int       @default(20) @map("total_tables")

  // NOVAS RELATIONS
  tables              Table[]
  waiterCalls         WaiterCall[]
  staff               RestaurantStaff[]
}
```

### 2.7 Alteracoes no Model User

```prisma
model User {
  // ... campos existentes ...

  // NOVAS RELATIONS para WaiterCall
  customerCalls       WaiterCall[]      @relation("CustomerCalls")
  waiterCalls         WaiterCall[]      @relation("WaiterCalls")

  // NOVAS RELATIONS
  favorites           CustomerFavorite[]
  staffAssignments    RestaurantStaff[]
}
```

### 2.8 Alteracoes no Model Order

```prisma
model Order {
  // ... campos existentes ...

  // ALTERACAO: tableNumber agora referencia Table
  tableId         String?     @map("table_id")
  tableNumber     String?     @map("table_number") // Manter para compatibilidade

  // NOVO CAMPO - Garcom que atendeu
  waiterId        String?     @map("waiter_id")

  // NOVOS CAMPOS - Timestamps detalhados
  receivedAt      DateTime?   @map("received_at")    // Cozinha confirmou
  preparingAt     DateTime?   @map("preparing_at")   // Iniciou preparo
  readyAt         DateTime?   @map("ready_at")       // Pronto para servir
  deliveredAt     DateTime?   @map("delivered_at")   // Entregue ao cliente

  // NOVAS RELATIONS
  table           Table?      @relation(fields: [tableId], references: [id])
  waiter          User?       @relation("WaiterOrders", fields: [waiterId], references: [id])
}
```

### 2.9 Alteracoes no Model MenuItem

```prisma
model MenuItem {
  // ... campos existentes ...

  // NOVOS CAMPOS - Detalhes nutricionais expandidos
  prepTime          Int?        @map("prep_time")          // Tempo de preparo em minutos
  rating            Decimal?    @db.Decimal(2, 1)          // Rating medio (1.0 - 5.0)
  isPopular         Boolean     @default(false) @map("is_popular")
  isVegan           Boolean     @default(false) @map("is_vegan")
  isVegetarian      Boolean     @default(false) @map("is_vegetarian")
  isGlutenFree      Boolean     @default(false) @map("is_gluten_free")

  // NOVAS RELATIONS
  favorites         CustomerFavorite[]
}
```

---

## 3. Diagrama de Relacionamentos (ERD Simplificado)

```
                                    +------------------+
                                    |   Restaurant     |
                                    +------------------+
                                    | id               |
                                    | ownerId (FK)     |
                                    | serviceFeePercent|
                                    | wifiNetworkName  |
                                    | wifiPassword     |
                                    | totalTables      |
                                    +--------+---------+
                                             |
              +------------------------------+------------------------------+
              |                              |                              |
              v                              v                              v
    +------------------+           +------------------+           +------------------+
    |      Table       |           | RestaurantStaff  |           |   WaiterCall     |
    +------------------+           +------------------+           +------------------+
    | id               |           | id               |           | id               |
    | restaurantId(FK) |           | restaurantId(FK) |           | restaurantId(FK) |
    | tableNumber      |           | userId (FK)      |           | tableId (FK)     |
    | status           |           | role             |           | customerId (FK)  |
    | capacity         |           | isActive         |           | waiterId (FK)    |
    | qrCodeUrl        |           +------------------+           | reason           |
    +--------+---------+                    |                     | status           |
             |                              v                     +------------------+
             |                    +------------------+
             v                    |      User        |
    +------------------+          +------------------+
    |      Order       |          | id               |
    +------------------+          | role (enum)      |<------ CUSTOMER
    | id               |          | email            |        RESTAURANT_OWNER
    | tableId (FK)     |          | ...              |        WAITER (NOVO)
    | waiterId (FK)    |          +------------------+        KITCHEN (NOVO)
    | receivedAt       |                   |                  ADMIN
    | preparingAt      |                   |
    | readyAt          |                   v
    | deliveredAt      |          +------------------+
    +------------------+          |CustomerFavorite  |
                                  +------------------+
                                  | customerId (FK)  |
                                  | menuItemId (FK)  |
                                  +------------------+
                                           |
                                           v
                                  +------------------+
                                  |    MenuItem      |
                                  +------------------+
                                  | prepTime         |
                                  | rating           |
                                  | isPopular        |
                                  | isVegan          |
                                  +------------------+
```

---

## 4. Indices para Performance

### 4.1 Indices Criticos (Alta Frequencia de Consulta)

```prisma
// Table
@@index([restaurantId])              // Listar mesas do restaurante
@@index([status])                    // Filtrar por status
@@unique([restaurantId, tableNumber]) // Busca por numero da mesa

// WaiterCall
@@index([restaurantId, status])      // Chamados pendentes por restaurante
@@index([tableId])                   // Chamados por mesa
@@index([waiterId, status])          // Chamados do garcom
@@index([createdAt(sort: Desc)])     // Ordenacao por mais recente

// CustomerFavorite
@@index([customerId])                // Favoritos do cliente
@@index([menuItemId])                // Quantos favoritaram um item

// RestaurantStaff
@@index([restaurantId, isActive])    // Staff ativo do restaurante
@@index([userId])                    // Restaurantes de um funcionario

// Order (novos)
@@index([tableId])                   // Pedidos de uma mesa
@@index([waiterId])                  // Pedidos de um garcom
@@index([status, restaurantId])      // Pedidos por status (cozinha)
```

### 4.2 Indices Compostos para Queries Frequentes

```prisma
// Pedidos ativos de uma mesa
@@index([tableId, status])

// Chamados pendentes para a cozinha
@@index([restaurantId, status, createdAt])
```

---

## 5. Migracao de Dados

### 5.1 Estrategia de Migracao

1. **Fase 1 - Estrutural (Breaking Changes: NAO)**
   - Adicionar novos enums (WAITER, KITCHEN) ao UserRole
   - Criar novos models (Table, WaiterCall, CustomerFavorite, RestaurantStaff)
   - Adicionar campos opcionais aos models existentes

2. **Fase 2 - Dados Iniciais**
   - Criar registros em Table para restaurantes existentes baseado em `totalTables`
   - Migrar campo `tableNumber` de Order para referencia em Table

3. **Fase 3 - Limpeza (Opcional)**
   - Manter `tableNumber` em Order para compatibilidade retroativa

### 5.2 Script de Migracao

```sql
-- Fase 1: Criar tabela de mesas para restaurantes existentes
INSERT INTO tables (id, restaurant_id, table_number, status, created_at, updated_at)
SELECT
  gen_random_uuid(),
  r.id,
  generate_series(1, COALESCE(r.total_tables, 20)),
  'AVAILABLE',
  NOW(),
  NOW()
FROM restaurants r;

-- Fase 2: Atualizar orders existentes com table_id
UPDATE orders o
SET table_id = t.id
FROM tables t
WHERE t.restaurant_id = o.restaurant_id
  AND t.table_number = CAST(o.table_number AS INTEGER);
```

---

## 6. Alteracoes no RBAC

### 6.1 Matriz de Permissoes Atualizada

| Recurso | CUSTOMER | WAITER | KITCHEN | RESTAURANT_OWNER | ADMIN |
|---------|----------|--------|---------|------------------|-------|
| Ver cardapio | R | R | R | CRUD | CRUD |
| Fazer pedido | C | C | - | C | CRUD |
| Ver pedidos (proprios) | R | - | - | - | - |
| Ver pedidos (restaurante) | - | R | R | R | R |
| Atualizar status pedido | - | U (delivered) | U (status) | U | U |
| Chamar garcom | C | - | - | - | - |
| Atender chamado | - | U | - | U | U |
| Gerenciar mesas | - | R,U | - | CRUD | CRUD |
| Gerenciar staff | - | - | - | CRUD | CRUD |
| Favoritar item | C,D | - | - | - | - |
| Ver analytics | - | - | - | R | R |
| Configurar restaurante | - | - | - | U | CRUD |

**Legenda**: C=Create, R=Read, U=Update, D=Delete

---

## 7. Impacto nas APIs

### 7.1 Novos Endpoints Necessarios

```
# Tables
GET    /api/restaurants/:id/tables         # Listar mesas
POST   /api/restaurants/:id/tables         # Criar mesa
PATCH  /api/tables/:id                     # Atualizar status mesa
DELETE /api/tables/:id                     # Remover mesa

# Waiter Calls
POST   /api/waiter-calls                   # Cliente chama garcom
GET    /api/restaurants/:id/waiter-calls   # Listar chamados (garcom/admin)
PATCH  /api/waiter-calls/:id               # Atender/finalizar chamado

# Favorites
GET    /api/users/me/favorites             # Meus favoritos
POST   /api/users/me/favorites             # Adicionar favorito
DELETE /api/users/me/favorites/:menuItemId # Remover favorito

# Staff
GET    /api/restaurants/:id/staff          # Listar equipe
POST   /api/restaurants/:id/staff          # Adicionar funcionario
PATCH  /api/restaurants/:id/staff/:userId  # Ativar/desativar
DELETE /api/restaurants/:id/staff/:userId  # Remover funcionario
```

### 7.2 Alteracoes em Endpoints Existentes

```
# Orders - Novos campos
PATCH  /api/orders/:id/status
  - Adicionar timestamps (receivedAt, preparingAt, readyAt, deliveredAt)
  - Validar role para cada transicao de status

# Restaurants - Novos campos
PATCH  /api/restaurants/:id
  - serviceFeePercent
  - wifiNetworkName
  - wifiPassword
```

---

## 8. Consideracoes de Real-time (Socket.IO)

### 8.1 Novos Eventos

```typescript
// Chamados de garcom
'waiter-call:new'           // Cliente chamou
'waiter-call:acknowledged'  // Garcom aceitou
'waiter-call:completed'     // Atendimento finalizado

// Mesas
'table:status-changed'      // Status da mesa mudou
'table:order-linked'        // Pedido vinculado a mesa

// Cozinha
'order:received'            // Cozinha confirmou recebimento
'order:preparing'           // Iniciou preparo
'order:ready'               // Pronto para servir
```

### 8.2 Rooms por Contexto

```typescript
// Cada restaurante tem sua sala
`restaurant:${restaurantId}:kitchen`   // Eventos da cozinha
`restaurant:${restaurantId}:waiters`   // Eventos dos garcoms
`restaurant:${restaurantId}:tables`    // Eventos de mesas

// Cada mesa tem sua sala para o cliente
`table:${tableId}:customer`            // Eventos para o cliente na mesa
```

---

## 9. Cronograma Sugerido

| Fase | Descricao | Duracao Estimada | Dependencias |
|------|-----------|------------------|--------------|
| 1 | Implementar alteracoes no schema Prisma | 1 dia | - |
| 2 | Gerar e aplicar migracao | 0.5 dia | Fase 1 |
| 3 | Implementar endpoints de Tables | 1 dia | Fase 2 |
| 4 | Implementar endpoints de WaiterCalls | 1 dia | Fase 2 |
| 5 | Implementar endpoints de Favorites | 0.5 dia | Fase 2 |
| 6 | Implementar endpoints de Staff | 1 dia | Fase 2 |
| 7 | Atualizar autorizacao (RBAC) | 1 dia | Fase 3-6 |
| 8 | Implementar eventos Socket.IO | 1 dia | Fase 3-6 |
| 9 | Testes de integracao | 1 dia | Fase 7-8 |
| 10 | Atualizacao do frontend | 2-3 dias | Fase 9 |

**Total estimado**: 10-11 dias de desenvolvimento

---

## 10. Schema Prisma Completo (Proposta)

O arquivo completo com todas as alteracoes esta disponivel em:
`docs/database-schema-proposed.prisma`

---

## 11. Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| Conflito com dados existentes | Baixa | Alto | Migracao em etapas, backup antes |
| Performance em queries de mesa | Media | Medio | Indices adequados, cache Redis |
| Complexidade do RBAC | Alta | Medio | Testes extensivos, documentacao |
| Breaking changes na API | Media | Alto | Versionamento, deprecation period |

---

## 12. Proximos Passos

1. [ ] Revisar este documento com a equipe
2. [ ] Aprovar alteracoes propostas
3. [ ] Criar branch `feature/database-evolution`
4. [ ] Implementar alteracoes no schema
5. [ ] Executar testes de migracao em ambiente de staging
6. [ ] Deploy gradual em producao

---

**Autor**: Claude (Database Architect Agent)
**Data**: 2025-12-26
**Versao**: 1.0
