# 🚀 TabSync - Guia de Início Rápido

## ⚡ Start em 3 Passos

### 1️⃣ Backend

```bash
cd backend

# Instalar dependências (se necessário)
npm install

# Configurar .env (já existe com valores de desenvolvimento)
# Edite se quiser mudar DATABASE_URL

# Gerar Prisma Client
npm run prisma:generate

# IMPORTANTE: Se quiser usar banco de dados real
# Execute as migrations:
npm run prisma:migrate

# Iniciar backend
npm run dev
```

**Backend rodando em**: http://localhost:4000

### 2️⃣ Frontend

```bash
cd frontend-web

# Instalar dependências (se necessário)
npm install

# .env.local já está configurado

# Iniciar frontend
npm run dev
```

**Frontend rodando em**: http://localhost:3000

### 3️⃣ Testar

1. Abra http://localhost:3000
2. Veja a landing page
3. Backend API está em http://localhost:4000/api

---

## 📡 Testar API Direto

### Health Check
```bash
curl http://localhost:4000/health
```

### Registrar Usuário
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "Senha123",
    "fullName": "Usuário Teste",
    "role": "CUSTOMER"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "Senha123"
  }'
```

---

## 🎯 O que Você Pode Fazer Agora

### **Backend (100% Funcional)**

✅ Criar usuários (clientes e donos de restaurante)
✅ Criar restaurantes
✅ Criar cardápios e itens
✅ Criar pedidos
✅ **Rachar conta** (3 métodos)
✅ Processar pagamentos
✅ 35+ endpoints prontos

### **Frontend (Base Pronta)**

✅ Ver landing page
⚠️ Páginas restantes precisam ser implementadas

Ver `frontend-web/README.md` para lista completa.

---

## 📚 Documentação Completa

- **API**: `backend/API_DOCUMENTATION.md`
- **Backend**: `backend/README.md`
- **Frontend**: `frontend-web/README.md`
- **Schema DB**: `DATABASE_SCHEMA.md`
- **Arquitetura**: `ARCHITECTURE.md`

---

## 🔥 Testar Split Bill (Feature Principal)

1. Criar pedido com múltiplos itens
2. Adicionar participantes ao pedido
3. Solicitar divisão de conta:

```bash
POST /api/payments/split/:orderId
{
  "splitMethod": "BY_ITEM",
  "participants": [
    {
      "userId": "uuid-1",
      "userEmail": "joao@example.com",
      "userName": "João"
    },
    {
      "userId": "uuid-2",
      "userEmail": "maria@example.com",
      "userName": "Maria"
    }
  ]
}
```

4. Cada participante recebe um link único
5. Acessar link para pagar individualmente

Ver exemplos completos em `backend/API_DOCUMENTATION.md`

---

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se a porta 4000 está livre
- Verifique o .env (DATABASE_URL)

### Frontend não conecta ao backend
- Certifique-se que o backend está rodando
- Verifique .env.local (NEXT_PUBLIC_API_URL)

### Erro de migrations do Prisma
- O backend funciona mesmo sem banco configurado (para testes)
- Para usar banco real: configure DATABASE_URL e rode `npm run prisma:migrate`

---

## 💡 Dica

Para desenvolvimento rápido sem banco de dados:
- O backend está configurado para funcionar
- As rotas estão todas implementadas
- Use Postman/Insomnia para testar API

**Status**: ✅ Backend 100% funcional | ⚡ Frontend base pronta
