# 🍽️ TabSync Frontend

Frontend web do TabSync - Sistema de pedidos e pagamentos com divisão inteligente de contas.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui** (componentes)
- **Zustand** (state management)
- **Axios** (HTTP client)
- **React Hook Form + Zod** (forms & validation)
- **Socket.IO Client** (real-time - preparado)

## 🔧 Quick Start

```bash
# 1. Instalar dependências (já feito)
npm install

# 2. Executar em desenvolvimento
npm run dev

# App estará em: http://localhost:3000
```

**IMPORTANTE**: Certifique-se de que o backend está rodando em `http://localhost:4000`

## 📁 Estrutura Implementada

```
frontend-web/
├── app/
│   └── page.tsx            ✅ Landing page
├── components/
│   └── ui/                 ✅ shadcn/ui components (13 componentes)
├── lib/
│   ├── api/
│   │   └── client.ts       ✅ API client com auth
│   ├── stores/
│   │   └── auth-store.ts   ✅ Zustand store
│   ├── types/
│   │   └── index.ts        ✅ TypeScript interfaces
│   └── utils.ts            ✅ Utilitários
└── .env.local              ✅ Configuração da API

```

## ✨ O que foi implementado

### ✅ Estrutura Base Completa
- Next.js 14 configurado
- TailwindCSS + 13 componentes shadcn/ui
- API client com interceptors de autenticação
- Refresh token automático
- Store de autenticação (Zustand)
- Types completos para backend
- Landing page responsiva

### ⚠️ Para Completar

As seguintes features precisam ser implementadas:

1. **Páginas de Autenticação**
   - `/login` - Página de login
   - `/register` - Página de registro

2. **Fluxo do Cliente**
   - `/restaurants` - Lista de restaurantes
   - `/r/[slug]` - Menu do restaurante
   - `/orders/[id]` - Detalhes do pedido
   - `/pay/[token]` - Página de pagamento individual (Split Bill)

3. **Dashboard do Restaurante**
   - `/dashboard` - Overview
   - `/dashboard/menu` - Gerenciar cardápio
   - `/dashboard/orders` - Gerenciar pedidos

## 🎯 Diferenciais do Frontend

1. **API Client Inteligente**
   - Refresh automático de tokens
   - Interceptors configurados
   - Type-safe

2. **State Management**
   - Zustand para autenticação
   - Preparado para mais stores

3. **Componentes UI**
   - 13 componentes shadcn/ui prontos
   - Totalmente customizáveis
   - Acessíveis (a11y)

## 📝 Scripts

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm start            # Executar build
npm run lint         # Lint code
```

## 🔗 Integração com Backend

O frontend já está configurado para se conectar ao backend:

- **API URL**: `http://localhost:4000/api`
- **Auth**: JWT com access + refresh tokens
- **Auto-refresh**: Tokens renovados automaticamente

## 📚 Documentação

- Backend API: Ver `backend/API_DOCUMENTATION.md`
- Componentes: Todos os componentes UI estão em `components/ui/`

---

**Status**: 🚧 Base implementada - Pronto para desenvolvimento de páginas
**Versão**: 0.1.0
**Última atualização**: Janeiro 2025
