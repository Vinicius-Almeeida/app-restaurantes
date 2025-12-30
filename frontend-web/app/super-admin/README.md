# Super Admin Dashboard

Dashboard administrativo para gerenciamento da plataforma TabSync.

## Estrutura de Arquivos

```
super-admin/
├── components/
│   ├── index.ts                 # Barrel export
│   ├── metrics-card.tsx         # Componente de card de métricas
│   └── sidebar.tsx              # Sidebar de navegação
├── dashboard/
│   └── page.tsx                 # Página principal do dashboard
└── README.md                    # Esta documentação
```

## Componentes

### MetricsCard

Exibe métricas-chave com ícone, valor, tendência e descrição.

**Props:**
- `title: string` - Título da métrica
- `value: string | number` - Valor a ser exibido
- `icon: LucideIcon` - Ícone do Lucide React
- `description?: string` - Descrição opcional
- `trend?: { value: number, isPositive: boolean }` - Tendência opcional
- `className?: string` - Classes CSS adicionais

**Exemplo:**
```tsx
<MetricsCard
  title="MRR"
  value="R$ 45.230,00"
  icon={DollarSign}
  trend={{ value: 12.5, isPositive: true }}
/>
```

### SuperAdminSidebar

Barra lateral de navegação com links para todas as seções administrativas.

**Props:**
- `onLogout?: () => void` - Callback para logout

**Rotas:**
- `/super-admin/dashboard` - Dashboard principal
- `/super-admin/restaurants` - Gestão de restaurantes
- `/super-admin/users` - Gestão de usuários
- `/super-admin/plans` - Planos de assinatura
- `/super-admin/subscriptions` - Assinaturas ativas
- `/super-admin/consultants` - Consultores de suporte
- `/super-admin/support` - Tickets de suporte
- `/super-admin/settings` - Configurações do sistema

## Dashboard Principal

### Métricas Exibidas

1. **MRR** (Monthly Recurring Revenue) - Receita mensal recorrente
2. **ARR** (Annual Recurring Revenue) - Receita anual recorrente
3. **GMV** (Gross Merchandise Volume) - Volume total transacionado
4. **Total de Restaurantes** - Restaurantes cadastrados na plataforma
5. **Total de Usuários** - Usuários ativos na plataforma
6. **Taxa de Churn** - Percentual de cancelamentos

### Seções

#### Últimos Restaurantes Cadastrados
Lista dos 3 restaurantes mais recentes com:
- Nome e slug
- Status (ACTIVE, INACTIVE, SUSPENDED)
- Nome do proprietário
- Data de cadastro

#### Reclamações Escaladas
Tickets de suporte escalados com prioridade:
- **CRITICAL** - Vermelho
- **HIGH** - Laranja
- **MEDIUM** - Amarelo
- **LOW** - Azul

#### Distribuição de Planos
Gráfico de barras mostrando:
- Número de restaurantes por plano
- Percentual de cada plano
- Visual progress bar

## Dados Mock

Atualmente o dashboard usa dados mockados. Para integração com API real, substitua a função `fetchDashboardData()` pelos seguintes endpoints:

```typescript
// Métricas gerais
GET /api/super-admin/metrics
Response: { mrr, arr, totalRestaurants, totalUsers, churnRate, gmv }

// Restaurantes recentes
GET /api/super-admin/restaurants/recent
Response: Array<RecentRestaurant>

// Reclamações escaladas
GET /api/super-admin/support/escalated
Response: Array<EscalatedComplaint>

// Distribuição de planos
GET /api/super-admin/plans/distribution
Response: Array<PlanDistribution>
```

## Permissões

Apenas usuários com role `ADMIN` podem acessar esta área.

## Tecnologias

- **Next.js 14.2+** - App Router
- **React 18.3+** - Hooks e componentes funcionais
- **TypeScript 5.7+** - Strict mode
- **Tailwind CSS 3.4+** - Estilização
- **shadcn/ui** - Componentes base (Card, Button, Badge)
- **Lucide React** - Ícones
- **Zustand** - State management (auth)
- **Sonner** - Toast notifications

## Performance

- Lazy loading de dados
- Loading states adequados
- Memoization de cálculos complexos
- Otimização de re-renders

## Acessibilidade

- Semantic HTML
- ARIA labels adequados
- Keyboard navigation
- Color contrast WCAG AA
- Screen reader friendly

## TODO Backend

- [ ] Implementar endpoint `/api/super-admin/metrics`
- [ ] Implementar endpoint `/api/super-admin/restaurants/recent`
- [ ] Implementar endpoint `/api/super-admin/support/escalated`
- [ ] Implementar endpoint `/api/super-admin/plans/distribution`
- [ ] Adicionar middleware de autenticação ADMIN
- [ ] Implementar rate limiting específico
- [ ] Adicionar logs de acesso ao painel
