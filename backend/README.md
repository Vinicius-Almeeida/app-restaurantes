# TabSync Backend API

Backend API para o sistema TabSync de pedidos e pagamentos em restaurantes.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (opcional, para cache)

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# Iniciar servidor de desenvolvimento
npm run dev
```

## 📁 Estrutura

```
backend/
├── src/
│   ├── modules/          # Módulos da aplicação
│   │   ├── auth/         # Autenticação
│   │   ├── users/        # Usuários
│   │   ├── restaurants/  # Restaurantes
│   │   ├── menu/         # Cardápios
│   │   ├── orders/       # Pedidos
│   │   ├── payments/     # Pagamentos e Split Bill 🔥
│   │   └── analytics/    # Analytics
│   ├── config/           # Configurações
│   ├── middlewares/      # Middlewares
│   ├── utils/            # Utilitários
│   └── server.ts         # Servidor principal
├── prisma/
│   └── schema.prisma     # Schema do banco
└── package.json
```

## 🛠️ Scripts Disponíveis

```bash
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Compila TypeScript
npm start                # Inicia servidor de produção

npm run prisma:generate  # Gera Prisma Client
npm run prisma:migrate   # Executa migrations
npm run prisma:studio    # Abre Prisma Studio
npm run prisma:push      # Push schema para DB (dev)
```

## 🔐 Variáveis de Ambiente

Ver `.env.example` para todas as variáveis necessárias.

Principais:
- `DATABASE_URL`: String de conexão PostgreSQL
- `JWT_SECRET`: Secret para tokens JWT
- `PORT`: Porta do servidor (padrão: 4000)

## 📡 Endpoints

API base: `http://localhost:4000`

- `GET /health` - Health check
- `GET /api` - Informações da API
- `/api/auth` - Autenticação
- `/api/restaurants` - Restaurantes
- `/api/menu` - Cardápios
- `/api/orders` - Pedidos
- `/api/payments` - Pagamentos e Split Bill 🔥

## 🔥 Features Principais

1. **Sistema de Rachar Conta** - Divisão inteligente de contas
2. **Pagamentos Integrados** - Stripe & Mercado Pago
3. **Real-time** - Socket.IO para atualizações
4. **Analytics** - Métricas e insights

## 🧪 Desenvolvimento

O servidor usa:
- **tsx** para hot reload no desenvolvimento
- **TypeScript** para type safety
- **Prisma** para ORM
- **Zod** para validação

## 📄 Licença

MIT
