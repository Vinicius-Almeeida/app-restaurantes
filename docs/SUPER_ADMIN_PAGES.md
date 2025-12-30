# Super Admin - Documentacao das Paginas

> Documentacao completa de todas as paginas do painel Super Admin do TabSync.

## Visao Geral

O painel Super Admin fornece controle total sobre a plataforma TabSync, permitindo gerenciar restaurantes, usuarios, planos, assinaturas, monitoramento e configuracoes.

## Estrutura de Paginas

```
/super-admin/
├── dashboard/           # Dashboard principal com metricas
├── restaurants/         # Gestao de restaurantes
│   ├── [id]/           # Detalhes do restaurante
│   └── onboarding/     # Processo de onboarding
├── users/              # Gestao de usuarios
├── plans/              # Gestao de planos
├── subscriptions/      # Gestao de assinaturas
├── billing/            # Billing overview
│   └── invoices/       # Faturas e cobrancas
├── consultants/        # Gestao de consultores
├── support/            # Reclamacoes escaladas
├── operations/         # Monitoramento
│   ├── realtime/       # Tempo real
│   ├── health/         # Saude do sistema
│   └── alerts/         # Alertas e incidentes
└── settings/           # Configuracoes da plataforma
```

---

## Paginas Detalhadas

### 1. Dashboard (`/super-admin/dashboard`)

**Arquivo:** `app/super-admin/dashboard/page.tsx`

**Funcionalidades:**
- Metricas principais: MRR, ARR, Total Restaurantes, Total Usuarios
- Graficos de receita e crescimento
- Atividade recente
- Overview de assinaturas

**Roles:** `ADMIN`, `SUPER_ADMIN`

---

### 2. Restaurantes (`/super-admin/restaurants`)

**Arquivo:** `app/super-admin/restaurants/page.tsx`

**Funcionalidades:**
- Lista paginada de restaurantes
- Filtros: status (ativo/inativo), plano, busca por nome
- Badges de status com cores
- Clique para ver detalhes

**API:** `adminApi.listRestaurants()`

**Roles:** `ADMIN`, `SUPER_ADMIN`

---

### 3. Detalhes do Restaurante (`/super-admin/restaurants/[id]`)

**Arquivo:** `app/super-admin/restaurants/[id]/page.tsx`

**Funcionalidades:**
- Informacoes completas do restaurante
- Dados do proprietario
- Plano e assinatura atual
- Metricas: pedidos, itens do cardapio, staff, reviews, mesas
- Receita total e NPS score

**API:** `adminApi.getRestaurantDetails(id)`

**Roles:** `ADMIN`, `SUPER_ADMIN`

---

### 4. Onboarding (`/super-admin/restaurants/onboarding`)

**Arquivo:** `app/super-admin/restaurants/onboarding/page.tsx`

**Funcionalidades:**
- Acompanhamento do processo de setup
- Estagios: Pendente, Em Andamento, Concluido, Parado
- Progresso visual por restaurante
- Timeline de etapas:
  1. Conta Criada
  2. Perfil Completo
  3. Plano Ativo
  4. Cardapio Configurado
  5. Mesas Criadas
  6. Equipe Cadastrada
  7. Configuracoes
  8. Primeiro Pedido
- Alertas para onboardings parados

**Roles:** `ADMIN`, `SUPER_ADMIN`, `CONSULTANT`

---

### 5. Usuarios (`/super-admin/users`)

**Arquivo:** `app/super-admin/users/page.tsx`

**Funcionalidades:**
- Lista paginada de usuarios
- Filtros: role, busca por email/nome
- Badges de role com cores:
  - SUPER_ADMIN: roxo
  - ADMIN: roxo
  - CONSULTANT: azul
  - RESTAURANT_OWNER: laranja
  - WAITER: verde
  - KITCHEN: amarelo
  - CUSTOMER: cinza
- Indicador de email verificado

**API:** `listUsers()`

**Roles:** `ADMIN`, `SUPER_ADMIN`

---

### 6. Planos (`/super-admin/plans`)

**Arquivo:** `app/super-admin/plans/page.tsx`

**Funcionalidades:**
- CRUD completo de planos
- Cards com:
  - Nome e preco
  - Periodo (mensal/anual)
  - Limites: mesas, itens, staff
  - Features
- Acoes: Editar, Ativar/Desativar
- Dialog para criar/editar plano

**API:**
- `adminApi.listPlans()`
- `adminApi.createPlan()`
- `adminApi.updatePlan()`

**Roles:** `ADMIN`, `SUPER_ADMIN`

---

### 7. Assinaturas (`/super-admin/subscriptions`)

**Arquivo:** `app/super-admin/subscriptions/page.tsx`

**Funcionalidades:**
- Lista paginada de assinaturas
- Filtros: status, plano
- Status badges:
  - ACTIVE: verde
  - TRIALING: azul
  - PAST_DUE: amarelo
  - CANCELED: vermelho
- Dias restantes com cores de alerta
- Edicao de plano/status via dialog

**API:**
- `adminApi.listSubscriptions()`
- `adminApi.updateSubscription()`

**Roles:** `ADMIN`, `SUPER_ADMIN`

---

### 8. Billing (`/super-admin/billing`)

**Arquivo:** `app/super-admin/billing/page.tsx`

**Funcionalidades:**
- Tabs: Planos e Assinaturas
- Visao consolidada de billing
- Cards de planos com features
- Tabela de assinaturas

**Roles:** `ADMIN`, `SUPER_ADMIN`

---

### 9. Faturas (`/super-admin/billing/invoices`)

**Arquivo:** `app/super-admin/billing/invoices/page.tsx`

**Funcionalidades:**
- Lista de faturas
- Stats: Total Recebido, Pendente, Atrasado
- Filtros: status, busca
- Status badges:
  - paid: verde
  - pending: amarelo
  - overdue: vermelho
  - cancelled: cinza
- Dialog de detalhes com itens
- Download PDF (placeholder)

**Roles:** `ADMIN`, `SUPER_ADMIN`

---

### 10. Consultores (`/super-admin/consultants`)

**Arquivo:** `app/super-admin/consultants/page.tsx`

**Funcionalidades:**
- Cards de consultores
- Stats: Total, Restaurantes Onboarded, Comissao Media
- Informacoes por consultor:
  - Nome e email
  - Porcentagem de comissao
  - Restaurantes onboarded
  - Data de cadastro

**API:** `adminApi.listConsultants()`

**Roles:** `ADMIN`, `SUPER_ADMIN`

---

### 11. Suporte (`/super-admin/support`)

**Arquivo:** `app/super-admin/support/page.tsx`

**Funcionalidades:**
- Reclamacoes escaladas
- Filtros: status, prioridade
- Prioridade badges:
  - LOW: azul
  - MEDIUM: amarelo
  - HIGH: laranja
  - CRITICAL: vermelho
- Status badges:
  - OPEN: vermelho
  - IN_PROGRESS: amarelo
  - RESOLVED: verde
  - CLOSED: cinza
- Cards com info do restaurante e usuario

**API:** `adminApi.getEscalatedComplaints()`

**Roles:** `ADMIN`, `SUPER_ADMIN`

---

### 12. Operations (`/super-admin/operations`)

**Arquivo:** `app/super-admin/operations/page.tsx`

**Funcionalidades:**
- Status geral do sistema
- Links rapidos: Tempo Real, Saude, Alertas
- Status dos servicos: API, Database, Cache, WebSocket
- Metricas: CPU, Memoria, Disco
- Performance: Conexoes ativas, Req/min, Tempo de resposta
- Alertas recentes

**Roles:** `ADMIN`, `SUPER_ADMIN`

---

### 13. Tempo Real (`/super-admin/operations/realtime`)

**Arquivo:** `app/super-admin/operations/realtime/page.tsx`

**Funcionalidades:**
- Monitoramento ao vivo
- Stats em tempo real:
  - Restaurantes ativos
  - Sessoes ativas
  - Pedidos em andamento
  - Pagamentos processando
  - GMV hoje
  - Pedidos hoje
- Pedidos recentes com status
- Pagamentos recentes
- Timeline de atividade
- Toggle pause/resume

**Roles:** `ADMIN`, `SUPER_ADMIN`

---

### 14. Saude do Sistema (`/super-admin/operations/health`)

**Arquivo:** `app/super-admin/operations/health/page.tsx`

**Funcionalidades:**
- Status detalhado de todos os servicos
- Categorias: Core Services, Database, Infrastructure, Integracao, Seguranca
- Metricas por servico:
  - Status (healthy/degraded/down)
  - Uptime percentage
  - Latencia
  - Regiao
  - Versao
- Historico de uptime (30 dias)

**Roles:** `ADMIN`, `SUPER_ADMIN`

---

### 15. Alertas (`/super-admin/operations/alerts`)

**Arquivo:** `app/super-admin/operations/alerts/page.tsx`

**Funcionalidades:**
- Gerenciamento de alertas e incidentes
- Stats: Criticos, Ativos, Reconhecidos, Resolvidos
- Filtros: tipo, status, busca
- Tipos: critical, error, warning, info
- Acoes: Reconhecer, Resolver
- Dialog para resolucao com descricao

**Roles:** `ADMIN`, `SUPER_ADMIN`

---

### 16. Configuracoes (`/super-admin/settings`)

**Arquivo:** `app/super-admin/settings/page.tsx`

**Funcionalidades:**
- Tabs de configuracao:

**Geral:**
- Nome e email da plataforma
- Email de suporte
- Max restaurantes por owner
- Moeda e idioma padrao
- Modo manutencao
- Permitir novos cadastros
- Verificacao de email obrigatoria

**Billing:**
- Taxa da plataforma (%)
- Dias de trial

**Email:**
- Servidor SMTP
- Porta, usuario, senha
- Nome e email do remetente

**Notificacoes:**
- Canais: Push, Email, SMS
- Eventos: Novo restaurante, Nova assinatura, Pagamento falhou

**Seguranca:**
- Politica de senhas (tamanho, maiusculas, numeros, especiais)
- Timeout de sessao
- Max tentativas de login
- Duracao de bloqueio

**Roles:** `SUPER_ADMIN` (apenas)

---

## Componentes Compartilhados

Todas as paginas utilizam:

- `ProtectedRoute` - Controle de acesso por role
- `Card`, `CardContent`, `CardHeader`, `CardTitle` - Layout
- `Button`, `Badge`, `Input` - UI basica
- `Select`, `SelectContent`, `SelectItem` - Filtros
- `Dialog`, `DialogContent`, `DialogHeader` - Modais
- `Tabs`, `TabsContent`, `TabsList` - Navegacao
- `toast` (sonner) - Notificacoes

---

## Padroes Seguidos

- TypeScript strict (zero `any`)
- Validacao de arrays: `Array.isArray(data) ? data : []`
- Formatacao pt-BR para datas e moedas
- Loading states com spinner
- Empty states com mensagens claras
- Error handling com try/catch
- Componentes shadcn/ui

---

## API Client

Todas as chamadas de API estao em `lib/api/admin.ts`:

```typescript
export const adminApi = {
  getDashboardMetrics,
  listRestaurants,
  getRestaurantDetails,
  listUsers,
  listPlans,
  createPlan,
  updatePlan,
  listSubscriptions,
  updateSubscription,
  listConsultants,
  createConsultant,
  updateConsultant,
  getConsultantPerformance,
  getEscalatedComplaints,
};
```

---

## Proximos Passos

1. Conectar Operations pages com metricas reais do backend
2. Implementar Socket.IO para atualizacoes em tempo real
3. Criar pagina de Analytics (referenciada no sidebar)
4. Implementar export de relatorios em PDF/Excel
