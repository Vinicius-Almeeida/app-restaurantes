# 🚀 Guia Completo de Deploy - TabSync

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Deploy do Backend (VPS + Docker)](#deploy-do-backend-vps--docker)
3. [Deploy do Frontend (Vercel)](#deploy-do-frontend-vercel)
4. [Configuração de Domínio e SSL](#configuração-de-domínio-e-ssl)
5. [Monitoramento e Logs](#monitoramento-e-logs)
6. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

### VPS (Backend)
- Ubuntu 20.04+ ou Debian 11+
- 2GB RAM mínimo (4GB recomendado)
- 20GB de disco
- Docker e Docker Compose instalados
- Acesso SSH root ou sudo

### Domínio
- Domínio registrado (ex: tabsync.app)
- Acesso ao painel DNS do domínio

### Contas de Serviços
- Conta Vercel (para frontend)
- Conta GitHub (para CI/CD)
- (Opcional) Stripe ou Mercado Pago

---

## Deploy do Backend (VPS + Docker)

### 1. Preparar VPS

Conecte via SSH e atualize o sistema:

```bash
ssh root@seu-servidor-ip

# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências
apt install -y curl git ufw

# Configurar firewall
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 4000/tcp # Backend (temporário, remover depois do nginx)
ufw enable
```

### 2. Instalar Docker

```bash
# Remover versões antigas (se houver)
apt remove docker docker-engine docker.io containerd runc

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

### 3. Clonar Repositório

```bash
# Criar diretório para aplicação
mkdir -p /opt/tabsync
cd /opt/tabsync

# Clonar repositório
git clone https://github.com/seu-usuario/tabsync.git .

# Dar permissões
chmod +x deploy.sh
```

### 4. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env na raiz do projeto
nano .env
```

Cole o seguinte conteúdo (ajuste os valores):

```env
# Database
POSTGRES_USER=tabsync
POSTGRES_PASSWORD=SuaSenhaSegura123!
POSTGRES_DB=tabsync

# Redis
REDIS_PASSWORD=SuaSenhaRedisSegura456!

# JWT
JWT_SECRET=uma-chave-super-secreta-e-longa-para-jwt-tokens-123456789
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=outra-chave-diferente-para-refresh-tokens-987654321
JWT_REFRESH_EXPIRES_IN=30d

# CORS (URL do frontend Vercel)
CORS_ORIGIN=https://seu-app.vercel.app

# Stripe (opcional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mercado Pago (opcional)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
MERCADO_PAGO_PUBLIC_KEY=APP_USR-...
```

**⚠️ IMPORTANTE:** Gere senhas fortes! Use este comando:

```bash
openssl rand -base64 32
```

### 5. Subir Containers

```bash
# Subir todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Aguardar containers ficarem healthy (30-60 segundos)
docker-compose logs -f backend
```

### 6. Rodar Migrations do Prisma

```bash
# Executar migrations no container
docker-compose exec backend npx prisma migrate deploy

# Verificar se funcionou
docker-compose exec backend npx prisma db seed
```

### 7. Verificar Backend

```bash
# Testar health check
curl http://localhost:4000/health

# Resposta esperada:
# {"status":"ok","timestamp":"..."}
```

### 8. (Opcional) Configurar Nginx + SSL

Se quiser usar Nginx como reverse proxy com SSL:

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Criar configuração Nginx
nano /etc/nginx/sites-available/tabsync
```

Cole:

```nginx
server {
    listen 80;
    server_name api.seu-dominio.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Ativar:

```bash
ln -s /etc/nginx/sites-available/tabsync /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Obter certificado SSL
certbot --nginx -d api.seu-dominio.com
```

---

## Deploy do Frontend (Vercel)

### 1. Preparar Repositório

Certifique-se que o código está no GitHub:

```bash
git add .
git commit -m "Deploy ready"
git push origin main
```

### 2. Importar Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New Project"**
3. Importe seu repositório GitHub
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend-web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Configurar Variáveis de Ambiente

Na Vercel, vá em **Settings > Environment Variables** e adicione:

```
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com/api
```

Ou, se ainda não configurou domínio no backend:

```
NEXT_PUBLIC_API_URL=http://ip-do-servidor:4000/api
```

### 4. Deploy

Clique em **Deploy**. O Vercel vai:
- Instalar dependências
- Executar build do Next.js
- Fazer deploy automático

Aguarde 2-5 minutos.

### 5. Configurar Domínio Customizado (Opcional)

1. Na Vercel, vá em **Settings > Domains**
2. Adicione seu domínio (ex: `app.seu-dominio.com`)
3. Configure DNS conforme instruções da Vercel
4. Aguarde propagação (5-30 minutos)

---

## Configuração de Domínio e SSL

### Configurar DNS

No painel do seu provedor de domínio (ex: GoDaddy, Namecheap, Cloudflare):

#### Para Backend
```
Tipo: A
Nome: api (ou @)
Valor: IP-DO-SEU-SERVIDOR
TTL: 3600
```

#### Para Frontend (Vercel)
Siga as instruções específicas da Vercel ao adicionar o domínio.

### SSL/HTTPS

**Backend:**
- Use Certbot (já configurado acima)
- Renovação automática: `certbot renew --dry-run`

**Frontend:**
- Vercel gera SSL automaticamente ✅

---

## Monitoramento e Logs

### Ver Logs do Backend

```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas banco de dados
docker-compose logs -f postgres

# Últimas 100 linhas
docker-compose logs --tail=100 backend
```

### Monitorar Recursos

```bash
# CPU, RAM, Disco
docker stats

# Espaço em disco
df -h

# Ver processos dos containers
docker-compose top
```

### Health Checks

```bash
# Backend
curl https://api.seu-dominio.com/health

# PostgreSQL (dentro do container)
docker-compose exec postgres pg_isready -U tabsync

# Redis (dentro do container)
docker-compose exec redis redis-cli ping
```

---

## Troubleshooting

### Backend não inicia

```bash
# Ver logs com detalhes
docker-compose logs backend

# Recriar container
docker-compose down
docker-compose up -d --force-recreate backend

# Verificar variáveis de ambiente
docker-compose exec backend env | grep -E "DATABASE|REDIS|JWT"
```

### Erro de conexão com banco de dados

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Ver logs do banco
docker-compose logs postgres

# Conectar manualmente ao banco
docker-compose exec postgres psql -U tabsync -d tabsync
```

### Frontend não conecta com backend

1. Verifique `NEXT_PUBLIC_API_URL` na Vercel
2. Confirme que CORS está configurado corretamente no backend
3. Teste a API diretamente:
   ```bash
   curl https://api.seu-dominio.com/api/health
   ```

### Problemas com OCR/Upload de Notas Fiscais

```bash
# Verificar se Sharp está instalado corretamente
docker-compose exec backend npm list sharp

# Verificar permissões de pasta de uploads
docker-compose exec backend ls -la /app/uploads

# Ver logs específicos de OCR
docker-compose logs backend | grep -i ocr
```

### Reiniciar Tudo

```bash
# Parar tudo
docker-compose down

# Limpar volumes (CUIDADO: apaga dados!)
docker-compose down -v

# Reconstruir e subir
docker-compose up -d --build

# Rodar migrations novamente
docker-compose exec backend npx prisma migrate deploy
```

---

## Backups

### Backup do Banco de Dados

```bash
# Criar backup
docker-compose exec postgres pg_dump -U tabsync tabsync > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup_20251109.sql | docker-compose exec -T postgres psql -U tabsync -d tabsync
```

### Backup Automático (Cron)

```bash
# Editar crontab
crontab -e

# Adicionar linha (backup diário às 2h da manhã)
0 2 * * * cd /opt/tabsync && docker-compose exec -T postgres pg_dump -U tabsync tabsync > /opt/backups/tabsync_$(date +\%Y\%m\%d).sql
```

---

## Atualizações

### Atualizar Backend

```bash
cd /opt/tabsync

# Puxar código atualizado
git pull origin main

# Reconstruir containers
docker-compose up -d --build backend

# Rodar novas migrations (se houver)
docker-compose exec backend npx prisma migrate deploy
```

### Atualizar Frontend

O Vercel faz deploy automático quando você dá push no GitHub! 🎉

```bash
git push origin main
# Vercel vai automaticamente fazer novo deploy
```

---

## Checklist de Deploy ✅

Backend (VPS):
- [ ] VPS configurada com Ubuntu/Debian
- [ ] Docker e Docker Compose instalados
- [ ] Repositório clonado
- [ ] `.env` configurado com senhas fortes
- [ ] Containers rodando (`docker-compose ps`)
- [ ] Migrations executadas
- [ ] Health check funcionando
- [ ] (Opcional) Nginx + SSL configurados
- [ ] Firewall configurado
- [ ] Backups automáticos agendados

Frontend (Vercel):
- [ ] Projeto importado na Vercel
- [ ] Root Directory configurado como `frontend-web`
- [ ] `NEXT_PUBLIC_API_URL` configurado
- [ ] Build bem-sucedido
- [ ] Domínio customizado (opcional)
- [ ] SSL automático ativo

Testes:
- [ ] Frontend carrega sem erros
- [ ] Login/registro funciona
- [ ] Pedidos podem ser criados
- [ ] Split bill funciona
- [ ] Upload de nota fiscal funciona
- [ ] OCR processa corretamente

---

## 🎉 Pronto!

Seu TabSync está no ar! 🚀

**URLs de Acesso:**
- Frontend: https://seu-app.vercel.app (ou seu domínio)
- Backend API: https://api.seu-dominio.com (ou http://ip:4000)

**Próximos Passos:**
1. Testar todas as funcionalidades
2. Configurar monitoramento (Sentry, LogRocket, etc.)
3. Configurar analytics (Google Analytics, Mixpanel, etc.)
4. Adicionar domínio customizado
5. Configurar emails transacionais
6. Preparar documentação para usuários

---

## 📞 Suporte

Problemas?
- Revise a seção [Troubleshooting](#troubleshooting)
- Verifique logs: `docker-compose logs backend`
- Abra uma issue no GitHub

**Status do Projeto:** ✅ Production Ready
**Versão:** 1.1.0
