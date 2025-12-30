# TabSync - Plano de Migração do Protótipo para Next.js App Router

**Data**: 26/12/2025
**Objetivo**: Migrar o protótipo React (App.jsx) para a arquitetura Next.js App Router enterprise-level

---

## 1. ANÁLISE DO PROTÓTIPO

### 1.1 Estrutura Identificada

O protótipo em `prototipo-app-restaurantes/src/App.jsx` possui **4 perfis principais**:

1. **Cliente (Customer)** - 4 views principais
   - Menu/Cardápio (busca, filtros, categorias, favoritos)
   - Carrinho/Pedido (novo pedido, comanda, histórico)
   - Tracking (acompanhamento em tempo real)
   - Perfil (edição, favoritos, histórico, configurações)

2. **Garçom (Waiter)** - 3 views principais
   - Chamados (clientes chamando garçom)
   - Mesas (selecionar mesa, fazer pedidos, visualizar comanda, fechar mesa)
   - Prontos (pedidos prontos para entregar)

3. **Cozinha (Kitchen)** - Dashboard único
   - Pedidos pendentes (receber)
   - Pedidos recebidos (iniciar preparo)
   - Pedidos em preparo (marcar como pronto)

4. **Admin (Restaurant)** - 4 views principais
   - Dashboard (stats, pedidos recentes, chamados)
   - Cardápio (gestão de itens)
   - Garçons (gestão de funcionários)
   - Configurações (restaurante, operação, Wi-Fi, dados)

### 1.2 Features Principais do Protótipo

- **Dark Mode Elegante** com gradientes (var(--primary), --secondary, --success, etc)
- **Autenticação Multi-Role** (4 tipos de usuário)
- **Seleção de Mesa** (QR Code simulation)
- **Carrinho com Observações** (notas por item)
- **Tracking em Tempo Real** (5 estados: pending → received → preparing → ready → delivered)
- **Split Bill** (divisão de conta por número de pessoas)
- **Chamada de Garçom** (FAB button + modal)
- **Favoritos** (corações nos itens)
- **Bottom Navigation** (mobile-first)
- **Modals** (pagamento, sucesso, chamada, edição, detalhes)
- **Estados Vazios** (empty states bem desenhados)

### 1.3 Design System

```css
/* Cores do Protótipo */
--primary: #1E3A5F (azul escuro)
--primary-light: #2D5A8A
--secondary: #FF6B35 (laranja)
--secondary-light: #FF8F66
--success: #10B981 (verde)
--warning: #F59E0B (amarelo)
--danger: #EF4444 (vermelho)
--bg-dark: #0F1419
--bg-card: #1A2332
--bg-card-hover: #243044
--text-primary: #FFFFFF
--text-secondary: #94A3B8
--text-muted: #64748B
--border: #2D3F58
```

**Fontes**:
- `Outfit` (sans-serif) - corpo
- `Playfair Display` (serif) - títulos

---

## 2. ESTRUTURA ATUAL DO FRONTEND-WEB

### 2.1 Páginas Existentes

```
app/
├── page.tsx                    # Home (landing)
├── login/page.tsx              # Login
├── register/page.tsx           # Registro
├── restaurants/page.tsx        # Lista restaurantes
├── r/[slug]/page.tsx           # Cardápio público
├── mesa/[restaurantId]/[tableNumber]/page.tsx  # QR Code entry ✅
├── checkout/[restaurantId]/page.tsx            # Checkout
├── orders/page.tsx             # Meus pedidos
├── orders/[id]/page.tsx        # Detalhe pedido
├── split-bill/[orderId]/page.tsx               # Split bill ✅
├── pay/[token]/page.tsx        # Link pagamento ✅
└── dashboard/
    ├── page.tsx                # Dashboard owner
    ├── menu/page.tsx           # Gestão cardápio
    ├── orders/page.tsx         # Gestão pedidos
    └── inventory/
        ├── page.tsx            # Estoque
        ├── upload/page.tsx     # Upload OCR
        └── invoices/[id]/page.tsx  # Detalhe nota
```

### 2.2 Componentes Existentes

```
components/
├── ui/                         # shadcn/ui components
├── auth/
│   └── ProtectedRoute.tsx
├── common/
│   └── LoadingSpinner.tsx
├── layout/
│   ├── Header.tsx
│   └── Footer.tsx
├── restaurant/
│   └── RestaurantCard.tsx
├── menu/
│   └── MenuItemCard.tsx
├── order/
│   └── OrderStatusBadge.tsx
├── split-bill/
│   ├── SplitMethodSelector.tsx
│   └── ParticipantsList.tsx
└── dashboard/
    └── StatCard.tsx
```

### 2.3 Stores Zustand

```
lib/stores/
├── auth-store.ts              # Auth (user, tokens)
└── cart-store.ts              # Cart (items, restaurantId, tableNumber)
```

---

## 3. PLANO DE MIGRAÇÃO - PRIORIZAÇÃO

### FASE 1: FUNDAÇÃO (CRÍTICO) - 3-5 dias

**Objetivo**: Preparar infraestrutura base para suportar os 4 perfis

#### 3.1.1 Design System Migration
- [ ] Criar `app/globals-prototype.css` com CSS Variables do protótipo
- [ ] Integrar com Tailwind (config customizado)
- [ ] Testar dark mode com cores do protótipo

#### 3.1.2 Layout System
- [ ] Criar `components/layout/BottomNav.tsx` (navegação mobile)
- [ ] Criar `components/layout/PrototypeHeader.tsx` (header por perfil)
- [ ] Criar `components/layout/PageContainer.tsx` (wrapper padrão)

#### 3.1.3 Stores Zustand (Expandir)

**auth-store.ts** (expandir):
```typescript
interface AuthState {
  user: User | null;
  role: 'CUSTOMER' | 'WAITER' | 'KITCHEN' | 'RESTAURANT_OWNER' | null;
  selectedTable: number | null;
  setSelectedTable: (table: number | null) => void;
  // ... existing
}
```

**Criar `order-store.ts`**:
```typescript
interface OrderState {
  activeOrder: Order | null;
  orderStatus: OrderStatus;
  orderStatusIndex: number;
  statusTimestamps: Record<string, string>;
  setActiveOrder: (order: Order | null) => void;
  updateOrderStatus: (status: OrderStatus) => void;
}
```

**Criar `favorites-store.ts`**:
```typescript
interface FavoritesState {
  favorites: string[];
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
}
```

**Criar `waiter-calls-store.ts`**:
```typescript
interface WaiterCall {
  id: string;
  tableNumber: number;
  customerId: string;
  reason: string;
  createdAt: Date;
  status: 'PENDING' | 'ATTENDED';
}

interface WaiterCallsState {
  calls: WaiterCall[];
  addCall: (call: Omit<WaiterCall, 'id' | 'createdAt'>) => void;
  dismissCall: (callId: string) => void;
}
```

#### 3.1.4 Componentes Base (Reutilizáveis)

**UI Components** (`components/ui-prototype/`):
- [ ] `EmptyState.tsx` (ícone + título + descrição + ação)
- [ ] `StatCard.tsx` (cartão de estatística)
- [ ] `TimelineItem.tsx` (tracking timeline)
- [ ] `CategoryPill.tsx` (filtros de categoria)
- [ ] `SearchBar.tsx` (barra de busca)
- [ ] `TabPills.tsx` (tabs arredondadas)

**Menu Components** (`components/menu-prototype/`):
- [ ] `MenuCard.tsx` (cartão com imagem, badges, notas, adicionar)
- [ ] `MenuCardBadges.tsx` (Popular, Vegano, Indisponível)
- [ ] `MenuCardNotes.tsx` (input de observações)
- [ ] `CartItem.tsx` (item no carrinho com qty controls)

**Order Components** (`components/order-prototype/`):
- [ ] `OrderCard.tsx` (pedido com status)
- [ ] `OrderStatusBadge.tsx` (badge colorido por status)
- [ ] `TrackingTimeline.tsx` (linha do tempo completa)

**Modal Components** (`components/modals/`):
- [ ] `ModalBase.tsx` (overlay + modal base)
- [ ] `CallWaiterModal.tsx` (chamar garçom)
- [ ] `PaymentModal.tsx` (métodos de pagamento)
- [ ] `ItemDetailModal.tsx` (detalhes do prato)
- [ ] `EditProfileModal.tsx` (edição de perfil)

---

### FASE 2: CLIENTE APP (ALTA PRIORIDADE) - 5-7 dias

**Objetivo**: Migrar toda a experiência do cliente

#### 3.2.1 Estrutura de Páginas

**Criar `app/(customer)/` route group**:
```
app/(customer)/
├── layout.tsx              # Layout com BottomNav
├── select-table/page.tsx   # Seleção de mesa (se não vier de QR)
├── menu/page.tsx           # Cardápio principal
├── cart/page.tsx           # Carrinho/Comanda/Histórico (tabs)
├── tracking/page.tsx       # Tracking pedido ativo
└── profile/page.tsx        # Perfil + configurações
```

**Adaptar `app/mesa/[restaurantId]/[tableNumber]/page.tsx`**:
- Redirecionar para `/menu` após seleção
- Salvar mesa no store
- Verificar se mesa está disponível

#### 3.2.2 Menu Page (`app/(customer)/menu/page.tsx`)

Funcionalidades:
- [x] Busca em tempo real
- [x] Filtros por categoria (Todos, Favoritos, Entradas, Principais, Bebidas, Sobremesas)
- [x] Scroll horizontal de categorias
- [x] Grid responsivo de cards
- [x] Favoritar item (coração)
- [x] Observações inline no card
- [x] Adicionar ao carrinho
- [x] Modal de detalhes do item
- [x] Badges (Popular, Vegano, Indisponível)

Componentes:
```tsx
'use client';

import { useState } from 'react';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useFavoritesStore } from '@/lib/stores/favorites-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { SearchBar } from '@/components/ui-prototype/SearchBar';
import { CategoryPill } from '@/components/ui-prototype/CategoryPill';
import { MenuCard } from '@/components/menu-prototype/MenuCard';
import { ItemDetailModal } from '@/components/modals/ItemDetailModal';

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemDetail, setItemDetail] = useState(null);

  const { items, isLoading } = useMenuItems();
  const { favorites, toggleFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();

  const filteredItems = items.filter(/* ... */);

  return (
    <div>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <CategoryScroll
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <MenuGrid items={filteredItems} />
      {itemDetail && <ItemDetailModal item={itemDetail} />}
    </div>
  );
}
```

#### 3.2.3 Cart Page (`app/(customer)/cart/page.tsx`)

3 Tabs:
1. **Novo Pedido** (cart)
2. **Minha Comanda** (pedidos enviados + split bill + fechar conta)
3. **Histórico** (pedidos passados)

```tsx
'use client';

import { useState } from 'react';
import { TabPills } from '@/components/ui-prototype/TabPills';
import { CartList } from '@/components/order-prototype/CartList';
import { Comanda } from '@/components/order-prototype/Comanda';
import { OrderHistory } from '@/components/order-prototype/OrderHistory';

export default function CartPage() {
  const [activeTab, setActiveTab] = useState<'cart' | 'comanda' | 'history'>('cart');

  return (
    <div className="p-5">
      <h2 className="section-title">Pedido</h2>
      <TabPills
        tabs={[
          { id: 'cart', label: 'Novo Pedido', icon: Plus },
          { id: 'comanda', label: 'Minha Comanda', icon: Receipt },
          { id: 'history', label: 'Histórico', icon: History },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'cart' && <CartList />}
      {activeTab === 'comanda' && <Comanda />}
      {activeTab === 'history' && <OrderHistory />}
    </div>
  );
}
```

**Comanda Component** - Split Bill:
```tsx
// components/order-prototype/Comanda.tsx
import { SplitBillSelector } from './SplitBillSelector';

export function Comanda() {
  const { items, total } = useComanda();
  const [splitCount, setSplitCount] = useState(1);

  return (
    <>
      {/* Lista de itens */}
      <ComandaList items={items} />

      {/* Resumo */}
      <div className="cart-summary">
        <div>Subtotal: R$ {total}</div>
        <div>Taxa 10%: R$ {total * 0.1}</div>
        <div className="total">Total: R$ {total * 1.1}</div>
      </div>

      {/* Split Bill */}
      <SplitBillSelector
        count={splitCount}
        onChange={setSplitCount}
        total={total * 1.1}
      />

      {/* Botões */}
      <Button onClick={handlePayment}>Fechar Conta</Button>
    </>
  );
}
```

#### 3.2.4 Tracking Page (`app/(customer)/tracking/page.tsx`)

Tracking em tempo real:
```tsx
'use client';

import { useOrderStore } from '@/lib/stores/order-store';
import { TrackingTimeline } from '@/components/order-prototype/TrackingTimeline';

const ORDER_STATUS_FLOW = [
  { key: 'PENDING', label: 'Pedido Enviado', icon: Receipt, color: '#F59E0B' },
  { key: 'CONFIRMED', label: 'Recebido', icon: CheckCircle2, color: '#3B82F6' },
  { key: 'PREPARING', label: 'Em Preparo', icon: ChefHat, color: '#8B5CF6' },
  { key: 'READY', label: 'Pronto!', icon: UtensilsCrossed, color: '#10B981' },
  { key: 'DELIVERED', label: 'Entregue', icon: Check, color: '#6B7280' },
];

export default function TrackingPage() {
  const { activeOrder, orderStatus } = useOrderStore();

  if (!activeOrder) {
    return <EmptyState icon="📋" title="Nenhum pedido ativo" />;
  }

  const currentStatusIndex = ORDER_STATUS_FLOW.findIndex(s => s.key === orderStatus);
  const currentStatus = ORDER_STATUS_FLOW[currentStatusIndex];

  return (
    <div className="p-5">
      <h2 className="section-title">Acompanhar</h2>

      <div className="tracking-card">
        {/* Status atual com animação */}
        <div className="tracking-current-status">
          <div className="tracking-icon-container">
            <div className="tracking-icon-pulse" />
            <currentStatus.icon size={48} color={currentStatus.color} />
          </div>
          <h2 style={{ color: currentStatus.color }}>{currentStatus.label}</h2>
        </div>

        {/* Timeline */}
        <TrackingTimeline
          steps={ORDER_STATUS_FLOW}
          currentIndex={currentStatusIndex}
        />
      </div>
    </div>
  );
}
```

#### 3.2.5 Profile Page (`app/(customer)/profile/page.tsx`)

Seções:
1. Header com avatar + stats (pedidos, favoritos, total gasto)
2. Menu de ações (Editar Perfil, Favoritos, Histórico)
3. Informações do restaurante (Wi-Fi, telefone)
4. Ajuda
5. Logout

```tsx
export default function ProfilePage() {
  const { user } = useAuthStore();
  const { favorites } = useFavoritesStore();
  const stats = useCustomerStats();

  return (
    <div>
      <ProfileHeader user={user} stats={stats} />

      <MenuSection>
        <MenuItem icon={Edit} label="Editar Perfil" onClick={() => {}} />
        <MenuItem icon={Heart} label="Meus Favoritos" count={favorites.length} />
        <MenuItem icon={History} label="Histórico" count={stats.orderCount} />
      </MenuSection>

      <AboutSection />
      <HelpSection />

      <Button variant="danger" onClick={handleLogout}>Sair</Button>
    </div>
  );
}
```

#### 3.2.6 FAB - Call Waiter

Floating Action Button fixo:
```tsx
// components/customer/CallWaiterFAB.tsx
'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { CallWaiterModal } from '@/components/modals/CallWaiterModal';

export function CallWaiterFAB() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        className="call-waiter-fab"
        onClick={() => setShowModal(true)}
      >
        <Bell size={24} />
      </button>

      {showModal && (
        <CallWaiterModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCallWaiter}
        />
      )}
    </>
  );
}
```

---

### FASE 3: WAITER APP (ALTA PRIORIDADE) - 4-5 dias

**Objetivo**: Migrar app do garçom

#### 3.3.1 Estrutura

**Criar `app/(waiter)/` route group**:
```
app/(waiter)/
├── layout.tsx              # Layout com header waiter
├── calls/page.tsx          # Chamados
├── tables/page.tsx         # Lista de mesas
├── tables/[id]/page.tsx    # Mesa específica (comanda + novo pedido)
└── ready/page.tsx          # Pedidos prontos
```

#### 3.3.2 Waiter Layout

```tsx
// app/(waiter)/layout.tsx
export default function WaiterLayout({ children }) {
  const { user } = useAuthStore();
  const { calls } = useWaiterCallsStore();
  const readyOrders = useReadyOrders();

  return (
    <>
      <div className="waiter-header">
        <h2>👋 Olá, {user?.fullName}</h2>
        <p>Área do Garçom</p>
      </div>

      <TabPills
        tabs={[
          { id: 'calls', label: 'Chamados', badge: calls.length },
          { id: 'tables', label: 'Mesas' },
          { id: 'ready', label: 'Prontos', badge: readyOrders.length },
        ]}
      />

      <main>{children}</main>

      <LogoutButton />
    </>
  );
}
```

#### 3.3.3 Calls Page

```tsx
// app/(waiter)/calls/page.tsx
export default function CallsPage() {
  const { calls, dismissCall } = useWaiterCallsStore();

  if (!calls.length) {
    return (
      <EmptyState
        icon="✅"
        title="Nenhum chamado"
        description="Os chamados aparecerão aqui"
      />
    );
  }

  return (
    <div className="p-5">
      <h3 className="section-title">
        <Bell className="bell-ringing" /> Chamados Ativos
      </h3>
      {calls.map(call => (
        <WaiterCallCard
          key={call.id}
          call={call}
          onAttend={() => dismissCall(call.id)}
        />
      ))}
    </div>
  );
}
```

#### 3.3.4 Tables Page + Detail

```tsx
// app/(waiter)/tables/page.tsx
export default function TablesPage() {
  const { tables } = useRestaurant();
  const orders = useOrders();

  return (
    <div className="p-5">
      <div className="tables-grid">
        {tables.map(table => {
          const tableOrders = orders.filter(o => o.tableNumber === table.id);

          return (
            <Link href={`/tables/${table.id}`}>
              <TableButton
                number={table.id}
                status={table.status}
                ordersCount={tableOrders.length}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// app/(waiter)/tables/[id]/page.tsx
export default function TableDetailPage({ params }) {
  const tableId = parseInt(params.id);
  const [waiterCart, setWaiterCart] = useState([]);

  const comanda = useTableComanda(tableId);

  return (
    <div className="p-5">
      <BackButton href="/tables" />

      <h2 className="section-title">Mesa {tableId}</h2>

      {/* Comanda da Mesa */}
      {comanda.items.length > 0 && (
        <ComandaCard
          items={comanda.items}
          total={comanda.total}
          onClose={() => closeTable(tableId)}
        />
      )}

      {/* Novo Pedido */}
      {waiterCart.length > 0 && (
        <WaiterCartCard
          items={waiterCart}
          onSend={handleSendOrder}
        />
      )}

      {/* Cardápio Compacto */}
      <h4>Adicionar Itens</h4>
      <SearchBar />
      <CategoryPills />
      <MenuListCompact
        items={menuItems}
        onAdd={(item, notes) => setWaiterCart([...waiterCart, item])}
      />
    </div>
  );
}
```

#### 3.3.5 Ready Orders Page

```tsx
// app/(waiter)/ready/page.tsx
export default function ReadyOrdersPage() {
  const readyOrders = useOrders({ status: 'READY' });
  const { updateOrder } = useOrderMutations();

  if (!readyOrders.length) {
    return <EmptyState icon="✅" title="Tudo entregue!" />;
  }

  return (
    <div className="p-5">
      <h3 className="section-title">Pedidos Prontos</h3>
      {readyOrders.map(order => (
        <ReadyOrderCard
          key={order.id}
          order={order}
          onDeliver={() => updateOrder(order.id, { status: 'DELIVERED' })}
        />
      ))}
    </div>
  );
}
```

---

### FASE 4: KITCHEN APP (MÉDIA PRIORIDADE) - 2-3 dias

**Objetivo**: Migrar dashboard da cozinha

#### 3.4.1 Estrutura

**Criar `app/(kitchen)/page.tsx`** (página única):
```
app/(kitchen)/
└── page.tsx                # Dashboard completo
```

#### 3.4.2 Kitchen Dashboard

```tsx
// app/(kitchen)/page.tsx
export default function KitchenPage() {
  const { user } = useAuthStore();
  const pendingOrders = useOrders({ status: 'PENDING' });
  const confirmedOrders = useOrders({ status: 'CONFIRMED' });
  const preparingOrders = useOrders({ status: 'PREPARING' });

  return (
    <>
      {/* Alert de novos pedidos */}
      {pendingOrders.length > 0 && (
        <div className="new-order-alert">
          🔔 {pendingOrders.length} NOVO{pendingOrders.length > 1 ? 'S' : ''} PEDIDO{pendingOrders.length > 1 ? 'S' : ''}!
        </div>
      )}

      {/* Header */}
      <div className="kitchen-header">
        <h2>👨‍🍳 Cozinha</h2>
        <p>Olá, {user?.fullName}</p>
      </div>

      {/* Stats */}
      <div className="kitchen-stats">
        <KitchenStat label="Novos" value={pendingOrders.length} color="warning" />
        <KitchenStat label="Recebidos" value={confirmedOrders.length} color="info" />
        <KitchenStat label="Preparando" value={preparingOrders.length} color="purple" />
      </div>

      {/* Seções */}
      <div className="kitchen-section">
        {pendingOrders.length > 0 && (
          <KitchenSection
            title="Novos Pedidos"
            count={pendingOrders.length}
            orders={pendingOrders}
            action="Confirmar Recebimento"
            onAction={(id) => updateOrder(id, { status: 'CONFIRMED' })}
            variant="pending"
          />
        )}

        {confirmedOrders.length > 0 && (
          <KitchenSection
            title="Aguardando Preparo"
            orders={confirmedOrders}
            action="Iniciar Preparo"
            onAction={(id) => updateOrder(id, { status: 'PREPARING' })}
            variant="confirmed"
          />
        )}

        {preparingOrders.length > 0 && (
          <KitchenSection
            title="Em Preparo"
            orders={preparingOrders}
            action="Marcar como Pronto"
            onAction={(id) => updateOrder(id, { status: 'READY' })}
            variant="preparing"
          />
        )}

        {/* Empty state */}
        {!pendingOrders.length && !confirmedOrders.length && !preparingOrders.length && (
          <EmptyState icon="✅" title="Nenhum pedido no momento" />
        )}
      </div>

      <LogoutButton />
    </>
  );
}
```

**KitchenOrderCard**:
```tsx
// components/kitchen/KitchenOrderCard.tsx
export function KitchenOrderCard({ order, action, onAction, variant }) {
  return (
    <div className={`kitchen-order-card ${variant}`}>
      <div className="kitchen-order-header">
        <div className="kitchen-order-number">#{order.orderNumber}</div>
        <div className="kitchen-order-table">Mesa {order.tableNumber}</div>
      </div>

      <div className="kitchen-order-time">
        <Clock size={14} /> {formatTime(order.createdAt)}
      </div>

      <div className="kitchen-order-items">
        {order.orderItems.map(item => (
          <div key={item.id} className="kitchen-order-item">
            <div className="kitchen-item-qty">{item.quantity}</div>
            <div className="kitchen-item-info">
              <div className="kitchen-item-name">{item.menuItem.name}</div>
              {item.notes && (
                <div className="kitchen-item-notes">
                  <AlertCircle size={12} /> {item.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        className={`kitchen-btn kitchen-btn-${variant}`}
        onClick={() => onAction(order.id)}
      >
        {action}
      </button>
    </div>
  );
}
```

---

### FASE 5: ADMIN/RESTAURANT APP (MÉDIA PRIORIDADE) - 4-5 dias

**Objetivo**: Migrar painel administrativo

#### 3.5.1 Estrutura Expandida

**Expandir `app/dashboard/`**:
```
app/dashboard/
├── layout.tsx              # Layout com BottomNav admin
├── page.tsx                # Dashboard (stats + pedidos + chamados) ✅ expandir
├── menu/page.tsx           # Cardápio ✅ já existe
├── orders/page.tsx         # Pedidos ✅ já existe
├── waiters/page.tsx        # 🆕 Gestão garçons
├── settings/page.tsx       # 🆕 Configurações
└── inventory/...           # ✅ já existe
```

#### 3.5.2 Dashboard Page (expandir)

Adicionar:
- [ ] Seção de **Waiter Calls** (chamados de garçons)
- [ ] Stats cards (vendas, pedidos, ticket médio, mesas ativas)
- [ ] Pedidos recentes (filtrar por status !== DELIVERED)
- [ ] Ações rápidas de status

```tsx
// app/dashboard/page.tsx (expandir)
export default async function DashboardPage() {
  const session = await getServerSession();
  const waiterCalls = await getWaiterCalls({ status: 'PENDING' });
  const todayOrders = await getOrders({
    restaurantId: session.user.restaurantId,
    createdAt: { gte: startOfDay(new Date()) }
  });

  const stats = {
    sales: todayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    orders: todayOrders.length,
    avgTicket: stats.sales / stats.orders || 0,
    activeTables: await getActiveTables(session.user.restaurantId)
  };

  return (
    <div className="p-5">
      {/* Waiter Calls Alert */}
      {waiterCalls.length > 0 && (
        <WaiterCallsAlert calls={waiterCalls} />
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard icon={DollarSign} label="Vendas Hoje" value={formatCurrency(stats.sales)} color="success" />
        <StatCard icon={Package} label="Pedidos Hoje" value={stats.orders} color="secondary" />
        <StatCard icon={TrendingUp} label="Ticket Médio" value={formatCurrency(stats.avgTicket)} color="purple" />
        <StatCard icon={Eye} label="Mesas Ativas" value={stats.activeTables} color="warning" />
      </div>

      {/* Pedidos Recentes */}
      <h3 className="section-title">Pedidos Recentes</h3>
      <RecentOrders orders={todayOrders.filter(o => o.status !== 'DELIVERED')} />
    </div>
  );
}
```

#### 3.5.3 Waiters Management

```tsx
// app/dashboard/waiters/page.tsx
export default async function WaitersPage() {
  const waiters = await getWaiters();

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="section-title">Garçons</h2>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> Novo
        </Button>
      </div>

      {waiters.map(waiter => (
        <ManagementCard
          key={waiter.id}
          avatar="👤"
          title={waiter.name}
          subtitle={`${waiter.email} • ${waiter.active ? '✅ Ativo' : '❌ Inativo'}`}
          actions={
            <ToggleSwitch
              checked={waiter.active}
              onChange={(checked) => updateWaiter(waiter.id, { active: checked })}
            />
          }
        />
      ))}
    </div>
  );
}
```

#### 3.5.4 Settings Page

```tsx
// app/dashboard/settings/page.tsx
export default async function SettingsPage() {
  const restaurant = await getRestaurant();

  return (
    <div className="p-5">
      <h2 className="section-title">Configurações</h2>

      {/* Informações do Restaurante */}
      <SettingsSection icon={Store} title="Informações do Restaurante">
        <Input label="Nome" value={restaurant.name} />
        <Input label="Endereço" value={restaurant.address} />
        <Input label="Telefone" value={restaurant.phone} />
      </SettingsSection>

      {/* Operação */}
      <SettingsSection icon={Settings} title="Operação">
        <SettingRow
          label="Taxa de Serviço"
          description="Percentual sobre a conta"
          value={<Input type="number" value={10} suffix="%" />}
        />
        <SettingRow
          label="Total de Mesas"
          value={<span className="font-bold">{restaurant.tables.length}</span>}
        />
        <SettingRow
          label="Mesas Ocupadas"
          value={<span className="font-bold text-success">{restaurant.activeTables}</span>}
        />
      </SettingsSection>

      {/* Wi-Fi */}
      <SettingsSection icon={Wifi} title="Wi-Fi para Clientes">
        <Input label="Nome da Rede" defaultValue="Bistro_Guest" />
        <Input label="Senha" defaultValue="bemvindo123" />
      </SettingsSection>

      {/* Equipe Cozinha */}
      <SettingsSection icon={ChefHat} title="Equipe da Cozinha">
        {kitchenUsers.map(user => (
          <ManagementCard
            avatar="👨‍🍳"
            title={user.name}
            subtitle={`${user.role} • ${user.email}`}
            actions={<ToggleSwitch checked={user.active} />}
          />
        ))}
      </SettingsSection>

      {/* Dados */}
      <SettingsSection icon={Database} title="Dados">
        <Button variant="secondary" onClick={handleClearCache}>
          <Trash2 size={18} /> Limpar Cache Local
        </Button>
        <p className="text-xs text-muted-foreground">
          Isso irá apagar todos os dados salvos localmente
        </p>
      </SettingsSection>
    </div>
  );
}
```

#### 3.5.5 Admin Bottom Nav

```tsx
// app/dashboard/layout.tsx (atualizar)
export default function DashboardLayout({ children }) {
  const waiterCalls = useWaiterCalls();

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>

      <BottomNav
        items={[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: waiterCalls.length },
          { id: 'menu', label: 'Cardápio', icon: Menu },
          { id: 'waiters', label: 'Garçons', icon: UserCog },
          { id: 'settings', label: 'Config', icon: Settings },
        ]}
      />
    </>
  );
}
```

---

### FASE 6: INTEGRAÇÃO & POLIMENTO (CRÍTICO) - 3-4 dias

#### 3.6.1 Real-time (Socket.IO)

**Criar `lib/socket.ts`**:
```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocket(userId: string) {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: { userId }
    });

    socket.on('connect', () => console.log('Socket connected'));
    socket.on('disconnect', () => console.log('Socket disconnected'));
  }
  return socket;
}

export function getSocket() {
  return socket;
}

// Hooks
export function useSocketEvent(event: string, handler: (data: any) => void) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on(event, handler);
    return () => { socket.off(event, handler); };
  }, [event, handler]);
}
```

**Eventos importantes**:
- `new-order` (cozinha recebe)
- `order-status-changed` (cliente tracking)
- `waiter-call` (garçom + admin recebem)
- `payment-received` (admin)

#### 3.6.2 Hooks Customizados

```typescript
// hooks/useOrders.ts
export function useOrders(filters?: OrderFilters) {
  const { data, isLoading } = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => api.getOrders(filters)
  });

  // Subscribe to real-time updates
  useSocketEvent('order-status-changed', (data) => {
    queryClient.invalidateQueries(['orders']);
  });

  return { orders: data || [], isLoading };
}

// hooks/useMenuItems.ts
export function useMenuItems(restaurantId: string) {
  return useQuery({
    queryKey: ['menuItems', restaurantId],
    queryFn: () => api.getMenuItems(restaurantId)
  });
}

// hooks/useWaiterCalls.ts
export function useWaiterCalls() {
  const [calls, setCalls] = useState<WaiterCall[]>([]);

  useSocketEvent('waiter-call', (call) => {
    setCalls(prev => [call, ...prev]);
    // Notification sound
    playNotificationSound();
  });

  return { calls, dismissCall };
}
```

#### 3.6.3 Middleware & Auth

**Atualizar `middleware.ts`**:
```typescript
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access
  const user = await validateToken(token);

  if (pathname.startsWith('/dashboard') && user.role !== 'RESTAURANT_OWNER') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/(waiter)') && user.role !== 'WAITER') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/(kitchen)') && user.role !== 'KITCHEN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

#### 3.6.4 Notificações (Sonner)

```tsx
// lib/notifications.ts
import { toast } from 'sonner';

export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),

  orderReceived: (orderNumber: string) => {
    toast.success(`Pedido #${orderNumber} recebido!`, {
      icon: '🍽️',
      duration: 3000,
    });
  },

  waiterCalled: () => {
    toast.info('Garçom chamado! Aguarde...', {
      icon: '🔔',
    });
  },

  paymentSuccess: () => {
    toast.success('Pagamento confirmado!', {
      icon: '✅',
    });
  }
};
```

#### 3.6.5 Animations & Transitions

**Criar `lib/animations.ts`**:
```typescript
// Framer Motion variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

export const slideInFromRight = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 }
};
```

**Animações CSS do protótipo**:
- `trackingPulse` (ícone pulsando)
- `alertGlow` (chamados de garçom)
- `bellRing` (sino balançando)
- `modalIn` (modal aparecendo)
- `slideIn` (notificação)
- `spin` (loader)

---

## 4. CRONOGRAMA CONSOLIDADO

| Fase | Duração | Prioridade | Status |
|------|---------|------------|--------|
| 1. Fundação | 3-5 dias | CRÍTICO | 🔴 Pendente |
| 2. Cliente App | 5-7 dias | ALTA | 🔴 Pendente |
| 3. Waiter App | 4-5 dias | ALTA | 🔴 Pendente |
| 4. Kitchen App | 2-3 dias | MÉDIA | 🔴 Pendente |
| 5. Admin App | 4-5 dias | MÉDIA | 🔴 Pendente |
| 6. Integração & Polimento | 3-4 dias | CRÍTICO | 🔴 Pendente |
| **TOTAL** | **21-29 dias** | - | - |

---

## 5. COMPONENTES A CRIAR (CHECKLIST)

### 5.1 UI Components (`components/ui-prototype/`)

- [ ] `EmptyState.tsx`
- [ ] `StatCard.tsx`
- [ ] `TimelineItem.tsx`
- [ ] `CategoryPill.tsx`
- [ ] `SearchBar.tsx`
- [ ] `TabPills.tsx`
- [ ] `BottomNav.tsx`
- [ ] `ToggleSwitch.tsx`
- [ ] `BackButton.tsx`

### 5.2 Menu Components (`components/menu-prototype/`)

- [ ] `MenuCard.tsx`
- [ ] `MenuCardBadges.tsx`
- [ ] `MenuCardNotes.tsx`
- [ ] `CartItem.tsx`
- [ ] `MenuListCompact.tsx` (garçom)

### 5.3 Order Components (`components/order-prototype/`)

- [ ] `OrderCard.tsx`
- [ ] `OrderStatusBadge.tsx`
- [ ] `TrackingTimeline.tsx`
- [ ] `CartList.tsx`
- [ ] `Comanda.tsx`
- [ ] `OrderHistory.tsx`
- [ ] `SplitBillSelector.tsx`
- [ ] `ReadyOrderCard.tsx`

### 5.4 Waiter Components (`components/waiter/`)

- [ ] `WaiterCallCard.tsx`
- [ ] `TableButton.tsx`
- [ ] `ComandaCard.tsx`
- [ ] `WaiterCartCard.tsx`

### 5.5 Kitchen Components (`components/kitchen/`)

- [ ] `KitchenOrderCard.tsx`
- [ ] `KitchenSection.tsx`
- [ ] `KitchenStat.tsx`

### 5.6 Admin Components (`components/dashboard/`)

- [ ] `WaiterCallsAlert.tsx`
- [ ] `RecentOrders.tsx`
- [ ] `ManagementCard.tsx`
- [ ] `SettingsSection.tsx`
- [ ] `SettingRow.tsx`

### 5.7 Modals (`components/modals/`)

- [ ] `ModalBase.tsx`
- [ ] `CallWaiterModal.tsx`
- [ ] `PaymentModal.tsx`
- [ ] `ItemDetailModal.tsx`
- [ ] `EditProfileModal.tsx`
- [ ] `SuccessModal.tsx`

### 5.8 Customer Components (`components/customer/`)

- [ ] `CallWaiterFAB.tsx`
- [ ] `ProfileHeader.tsx`
- [ ] `MenuItem.tsx`
- [ ] `MenuSection.tsx`

---

## 6. STORES ZUSTAND A CRIAR

- [ ] `order-store.ts` (activeOrder, status, timestamps)
- [ ] `favorites-store.ts` (favorites, toggle, isFavorite)
- [ ] `waiter-calls-store.ts` (calls, addCall, dismissCall)
- [ ] `notifications-store.ts` (opcional, se não usar Sonner)

---

## 7. HOOKS CUSTOMIZADOS A CRIAR

- [ ] `useOrders(filters)` - React Query + Socket.IO
- [ ] `useMenuItems(restaurantId)`
- [ ] `useWaiterCalls()`
- [ ] `useCustomerStats()`
- [ ] `useTableComanda(tableId)`
- [ ] `useSocketEvent(event, handler)`
- [ ] `useOrderMutations()` - create, update, cancel

---

## 8. PÁGINAS A CRIAR/ADAPTAR

### Criar
- [ ] `app/(customer)/menu/page.tsx`
- [ ] `app/(customer)/cart/page.tsx`
- [ ] `app/(customer)/tracking/page.tsx`
- [ ] `app/(customer)/profile/page.tsx`
- [ ] `app/(customer)/select-table/page.tsx`
- [ ] `app/(waiter)/calls/page.tsx`
- [ ] `app/(waiter)/tables/page.tsx`
- [ ] `app/(waiter)/tables/[id]/page.tsx`
- [ ] `app/(waiter)/ready/page.tsx`
- [ ] `app/(kitchen)/page.tsx`
- [ ] `app/dashboard/waiters/page.tsx`
- [ ] `app/dashboard/settings/page.tsx`

### Adaptar/Expandir
- [ ] `app/mesa/[restaurantId]/[tableNumber]/page.tsx` (redirecionar para menu)
- [ ] `app/dashboard/page.tsx` (adicionar waiter calls + stats)
- [ ] `app/dashboard/layout.tsx` (adicionar BottomNav)

---

## 9. ESTILOS (CSS)

### 9.1 Criar `app/globals-prototype.css`

Copiar do protótipo:
- CSS Variables (cores, fontes)
- Classes base (`.menu-card`, `.cart-item`, `.order-card`, etc)
- Animações (`@keyframes`)
- Estados (hover, active, disabled)

### 9.2 Tailwind Config

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'primary': '#1E3A5F',
        'primary-light': '#2D5A8A',
        'secondary': '#FF6B35',
        'secondary-light': '#FF8F66',
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'bg-dark': '#0F1419',
        'bg-card': '#1A2332',
        'bg-card-hover': '#243044',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      keyframes: {
        trackingPulse: { /* ... */ },
        bellRing: { /* ... */ },
        alertGlow: { /* ... */ },
        // etc
      }
    }
  }
};
```

---

## 10. DECISÕES ARQUITETURAIS

### 10.1 Route Groups vs Flat Routes

**Escolha**: Route Groups `(customer)`, `(waiter)`, `(kitchen)`

**Motivo**:
- Layouts diferentes por perfil
- Middleware específico
- Organização clara
- Não afeta URL

### 10.2 Server Components vs Client Components

**Server Components** (default):
- Páginas de listagem (menu, orders, tables)
- Layouts
- Fetching inicial de dados

**Client Components** (`'use client'`):
- Componentes interativos (cart, modals, FAB)
- Stores Zustand
- Socket.IO listeners
- Animações complexas

### 10.3 Data Fetching Strategy

1. **Initial Load**: Server Components com `fetch` no servidor
2. **Mutations**: React Query useMutation
3. **Real-time**: Socket.IO + Query invalidation
4. **Optimistic Updates**: React Query optimistic updates

### 10.4 State Management

- **Zustand**: Auth, Cart, Favorites, Waiter Calls, Order Tracking
- **React Query**: Server state (orders, menu items, etc)
- **Local State**: UI state (modals, tabs, search)

### 10.5 TypeScript Strictness

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## 11. TESTES (PÓS-MIGRAÇÃO)

### 11.1 Unit Tests

- [ ] Stores Zustand
- [ ] Utility functions
- [ ] Hooks customizados

### 11.2 Integration Tests

- [ ] Fluxo completo cliente (menu → cart → tracking)
- [ ] Fluxo garçom (chamado → atender)
- [ ] Fluxo cozinha (receber → preparar → pronto)

### 11.3 E2E Tests (Playwright)

- [ ] Jornada cliente: QR Code → Pedido → Pagamento
- [ ] Jornada garçom: Login → Atender chamado → Fazer pedido
- [ ] Jornada cozinha: Login → Preparar pedido

---

## 12. CONSIDERAÇÕES FINAIS

### 12.1 O que NÃO migrar

- [ ] LocalStorage (substituir por banco de dados real)
- [ ] Mock data (usar API real)
- [ ] Senhas em plain text (usar bcryptjs)
- [ ] Emails hardcoded (usar sistema real de auth)

### 12.2 Melhorias vs Protótipo

- [ ] TypeScript strict (vs JavaScript)
- [ ] Validação Zod (vs validação manual)
- [ ] API real (vs localStorage)
- [ ] Auth JWT (vs sessão local)
- [ ] Rate limiting (novo)
- [ ] Ownership validation (novo)
- [ ] Error boundaries (novo)
- [ ] Loading states (melhorar)
- [ ] Accessibility (ARIA, keyboard nav)
- [ ] SEO (metadata, og tags)

### 12.3 Performance

- [ ] Image optimization (next/image)
- [ ] Code splitting (dynamic imports)
- [ ] Lazy loading (Suspense)
- [ ] Debouncing (busca, filters)
- [ ] Virtualization (listas grandes)
- [ ] Prefetching (next/link)

### 12.4 Mobile-First

- [ ] Touch gestures (swipe, long press)
- [ ] Viewport height (100vh → 100dvh)
- [ ] Safe areas (notch, home indicator)
- [ ] PWA (manifest, service worker)
- [ ] Offline support (cache, sync)

---

## 13. PRIORIDADE DE IMPLEMENTAÇÃO

### Sprint 1 (Semana 1): Fundação
- Design System + CSS
- Layouts base
- Stores Zustand
- Componentes UI base

### Sprint 2 (Semana 2): Cliente App
- Menu page
- Cart page
- Tracking page
- Profile page

### Sprint 3 (Semana 3): Waiter + Kitchen
- Waiter app completo
- Kitchen dashboard
- Real-time integration

### Sprint 4 (Semana 4): Admin + Polimento
- Admin pages (waiters, settings)
- Dashboard expandido
- Testes E2E
- Bug fixes

---

## 14. REFERÊNCIAS

- **Protótipo**: `prototipo-app-restaurantes/src/App.jsx`
- **Design System**: Linhas 61-1859 do App.jsx (CSS)
- **CLAUDE.md**: Diretrizes enterprise FAANG
- **Figma**: (se disponível)

---

## 15. COMANDOS ÚTEIS

```bash
# Criar componente
npx shadcn-ui@latest add [component]

# Run dev
npm run dev

# Build
npm run build

# Lint
npm run lint

# Test
npm run test

# E2E
npm run test:e2e
```

---

**Última atualização**: 26/12/2025
**Responsável**: Next.js Architecture Expert
**Status**: PLANO APROVADO - AGUARDANDO IMPLEMENTAÇÃO
