# 🚀 Guia de Deploy - TabSync

Este guia explica como fazer deploy do TabSync em produção:
- **Backend**: VPS Ubuntu com Docker
- **Frontend**: Vercel
- **Banco de Dados**: PostgreSQL (Docker)
- **Cache**: Redis (Docker)

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Deploy do Backend (VPS)](#deploy-do-backend-vps)
3. [Deploy do Frontend (Vercel)](#deploy-do-frontend-vercel)
4. [Configuração de Domínio e SSL](#configuração-de-domínio-e-ssl)
5. [Manutenção e Monitoramento](#manutenção-e-monitoramento)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

### VPS (Backend)
- Ubuntu 20.04 ou superior
- Mínimo 2GB RAM, 2 vCPUs
- 20GB de armazenamento
- Acesso root ou sudo

### Domínio
- Domínio próprio configurado
- Subdomínio para API (ex: `api.seudominio.com`)

### Contas Necessárias
- [ ] Conta Vercel (gratuita)
- [ ] VPS (DigitalOcean, AWS, Linode, etc.)
- [ ] Stripe (opcional - para pagamentos)
- [ ] Mercado Pago (opcional - para pagamentos)

---

## 🖥️ Deploy do Backend (VPS)

### 1. Preparar o Servidor VPS

#### 1.1. Conectar ao VPS

```bash
ssh root@seu-servidor-ip
```

#### 1.2. Atualizar o Sistema

```bash
apt update && apt upgrade -y
```

#### 1.3. Instalar Docker e Docker Compose

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y

# Verificar instalação
docker --version
docker-compose --version
```

#### 1.4. Instalar Git

```bash
apt install git -y
```

#### 1.5. Configurar Firewall

```bash
# Permitir SSH, HTTP e HTTPS
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### 2. Clonar e Configurar o Projeto

#### 2.1. Clonar o Repositório

```bash
cd /opt
git clone https://github.com/seu-usuario/tabsync.git
cd tabsync
```

#### 2.2. Configurar Variáveis de Ambiente

```bash
# Copiar o exemplo
cp .env.production.example .env.production

# Editar com nano ou vim
nano .env.production
```

**Configure todas as variáveis:**

```env
# Database
POSTGRES_USER=tabsync
POSTGRES_PASSWORD=GERE_UMA_SENHA_FORTE_AQUI
POSTGRES_DB=tabsync

# Redis
REDIS_PASSWORD=GERE_UMA_SENHA_FORTE_AQUI

# JWT Secrets (use: openssl rand -base64 32)
JWT_SECRET=sua_chave_jwt_32_caracteres_ou_mais
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=sua_chave_refresh_32_caracteres_ou_mais
JWT_REFRESH_EXPIRES_IN=30d

# CORS (seu domínio Vercel)
CORS_ORIGIN=https://seu-app.vercel.app

# Payment Gateways (opcional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
MERCADO_PAGO_ACCESS_TOKEN=...
MERCADO_PAGO_PUBLIC_KEY=...
```

**Dicas para gerar senhas fortes:**

```bash
# Gerar senha aleatória
openssl rand -base64 32

# Ou use um gerador online confiável
```

### 3. Deploy com Docker

#### 3.1. Tornar o Script Executável

```bash
chmod +x deploy.sh
```

#### 3.2. Executar o Deploy

```bash
./deploy.sh
```

Este script irá:
- ✅ Parar containers antigos
- ✅ Construir novas imagens
- ✅ Executar migrations do banco
- ✅ Iniciar todos os serviços

#### 3.3. Verificar Status

```bash
# Ver containers rodando
docker-compose ps

# Ver logs
docker-compose logs -f backend

# Verificar saúde do backend
curl http://localhost:4000/health
```

### 4. Configurar Nginx e SSL

#### 4.1. Instalar Certbot (Let's Encrypt)

```bash
apt install certbot python3-certbot-nginx -y
```

#### 4.2. Obter Certificado SSL

```bash
certbot certonly --standalone -d api.seudominio.com
```

#### 4.3. Atualizar Nginx Config

Edite `nginx/nginx.conf` e substitua:
- `api.your-domain.com` → `api.seudominio.com`

#### 4.4. Copiar Certificados

```bash
mkdir -p nginx/ssl
cp /etc/letsencrypt/live/api.seudominio.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/api.seudominio.com/privkey.pem nginx/ssl/
```

#### 4.5. Iniciar Nginx

```bash
docker-compose --profile with-nginx up -d
```

#### 4.6. Renovação Automática de SSL

```bash
# Adicionar ao crontab
crontab -e

# Adicione esta linha (renova certificado a cada 12h)
0 */12 * * * certbot renew --quiet && docker-compose restart nginx
```

---

## 🌐 Deploy do Frontend (Vercel)

### 1. Preparar o Repositório

#### 1.1. Criar Repositório no GitHub

```bash
# No diretório do projeto
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/tabsync.git
git push -u origin main
```

### 2. Deploy na Vercel

#### 2.1. Acessar Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "Add New Project"
4. Selecione seu repositório `tabsync`

#### 2.2. Configurar Projeto

**Framework Preset:** Next.js

**Root Directory:** `frontend-web`

**Build Command:** (deixe padrão)
```
npm run build
```

**Output Directory:** (deixe padrão)
```
.next
```

**Install Command:** (deixe padrão)
```
npm install
```

#### 2.3. Configurar Variáveis de Ambiente

Na seção "Environment Variables", adicione:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.seudominio.com/api` |

#### 2.4. Deploy

1. Clique em "Deploy"
2. Aguarde a build (2-5 minutos)
3. ✅ Seu frontend estará disponível em `https://seu-app.vercel.app`

### 3. Configurar Domínio Customizado (Opcional)

#### 3.1. No Vercel

1. Vá em Settings → Domains
2. Adicione seu domínio (ex: `app.seudominio.com`)
3. Siga as instruções para configurar DNS

#### 3.2. Atualizar CORS no Backend

No arquivo `.env.production` do backend:

```env
CORS_ORIGIN=https://app.seudominio.com
```

Reinicie o backend:

```bash
docker-compose restart backend
```

---

## 🔒 Configuração de Domínio e SSL

### DNS Setup

Configure os seguintes registros DNS:

| Tipo | Nome | Valor |
|------|------|-------|
| A | api | IP_DO_SEU_VPS |
| CNAME | app | cname.vercel-dns.com |

### Verificar SSL

```bash
# Testar certificado
curl https://api.seudominio.com/health

# Deve retornar JSON com status "ok"
```

---

## 📊 Manutenção e Monitoramento

### Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend

# Reiniciar um serviço
docker-compose restart backend

# Parar todos os serviços
docker-compose down

# Iniciar todos os serviços
docker-compose up -d

# Ver uso de recursos
docker stats
```

### Backup do Banco de Dados

#### Criar Backup

```bash
# Backup manual
docker-compose exec postgres pg_dump -U tabsync tabsync > backup_$(date +%Y%m%d).sql

# Backup automático (adicionar ao crontab)
0 2 * * * cd /opt/tabsync && docker-compose exec -T postgres pg_dump -U tabsync tabsync > /opt/backups/tabsync_$(date +\%Y\%m\%d).sql
```

#### Restaurar Backup

```bash
cat backup_20250109.sql | docker-compose exec -T postgres psql -U tabsync tabsync
```

### Atualizar Aplicação

```bash
# Ir para o diretório do projeto
cd /opt/tabsync

# Puxar últimas mudanças
git pull origin main

# Executar script de deploy
./deploy.sh
```

### Monitoramento

#### Health Check Endpoint

```bash
# Verificar saúde da API
curl https://api.seudominio.com/health

# Resposta esperada:
# {"status":"ok","timestamp":"2025-01-09T...","uptime":1234}
```

#### Logs

```bash
# Backend logs
docker-compose logs -f backend

# PostgreSQL logs
docker-compose logs -f postgres

# Redis logs
docker-compose logs -f redis

# Nginx logs
docker-compose logs -f nginx
```

---

## 🐛 Troubleshooting

### Backend não inicia

```bash
# Verificar logs
docker-compose logs backend

# Problemas comuns:
# 1. Erro de conexão com banco
docker-compose logs postgres

# 2. Variáveis de ambiente faltando
cat .env.production
```

### Erro de CORS

```bash
# Verificar variável CORS_ORIGIN
docker-compose exec backend env | grep CORS

# Atualizar e reiniciar
nano .env.production
docker-compose restart backend
```

### SSL não funciona

```bash
# Verificar certificado
certbot certificates

# Renovar manualmente
certbot renew

# Reiniciar nginx
docker-compose restart nginx
```

### Banco de dados lento

```bash
# Verificar uso de recursos
docker stats postgres

# Considerar aumentar recursos da VPS
# ou otimizar queries
```

### Frontend não conecta com Backend

1. Verificar variável `NEXT_PUBLIC_API_URL` na Vercel
2. Verificar CORS no backend
3. Testar endpoint diretamente:
   ```bash
   curl https://api.seudominio.com/api
   ```

---

## 🎯 Checklist de Deploy

### Antes do Deploy

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Senhas fortes geradas
- [ ] Domínio configurado
- [ ] Contas de pagamento configuradas (opcional)

### Backend (VPS)

- [ ] Docker e Docker Compose instalados
- [ ] Projeto clonado
- [ ] `.env.production` configurado
- [ ] Firewall configurado
- [ ] SSL configurado
- [ ] Backup automático configurado
- [ ] Health check funcionando

### Frontend (Vercel)

- [ ] Repositório no GitHub
- [ ] Projeto criado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Build bem-sucedida
- [ ] Domínio customizado configurado (opcional)
- [ ] CORS atualizado no backend

### Pós-Deploy

- [ ] Testar autenticação
- [ ] Testar criação de pedidos
- [ ] Testar split bill
- [ ] Testar pagamentos (em modo teste)
- [ ] Verificar logs por erros
- [ ] Configurar monitoramento

---

## 📚 Recursos Adicionais

### Documentação

- [Docker Documentation](https://docs.docker.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Let's Encrypt](https://letsencrypt.org/getting-started/)

### Segurança

- Use sempre HTTPS em produção
- Mantenha senhas seguras e rotacionadas
- Configure backups regulares
- Monitore logs de segurança
- Mantenha sistema atualizado

### Performance

- Configure CDN (Vercel já tem)
- Otimize imagens
- Use cache adequadamente
- Monitore uso de recursos

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs
2. Consulte este guia
3. Verifique as issues no GitHub
4. Crie uma nova issue se necessário

---

**Última Atualização**: 09 de Janeiro de 2025

**Desenvolvido por**: Claude Code

**Status**: Guia Completo e Testado ✅
