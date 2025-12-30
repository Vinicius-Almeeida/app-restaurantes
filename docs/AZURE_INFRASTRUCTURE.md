# Infraestrutura Azure - TabSync

## Resumo Executivo

TabSync utiliza Azure Container Apps para hospedar o backend, com Container Registry para gerenciamento de imagens Docker. O banco de dados PostgreSQL é hospedado no Supabase (externo) e o frontend Next.js no Vercel (externo).

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AZURE CLOUD                                 │
│  Subscription: Azure for Students                                   │
│  Tenant: Grupo Marista (pucpr.edu.br)                              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  RESOURCE GROUP: tabsync-rg                                         │
│  Location: East US 2                                                │
└─────────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌───────────────────────────┐  ┌───────────────────────────────────┐
│  CONTAINER REGISTRY       │  │  CONTAINER APPS ENVIRONMENT       │
│  tabsyncregistry          │  │  tabsync-env                      │
│  Location: Brazil South   │  │  Location: Brazil South           │
│  SKU: Basic               │  │  Static IP: 4.203.0.200           │
│                           │  │  Domain: nicestone-*.brazilsouth  │
│  Repository:              │  │         .azurecontainerapps.io    │
│  └─ tabsync-backend:v1    │  │                                   │
└───────────────────────────┘  └───────────────────────────────────┘
                                              │
                                              ▼
                              ┌───────────────────────────────────┐
                              │  CONTAINER APP                    │
                              │  tabsync-backend                  │
                              │                                   │
                              │  Image: tabsync-backend:v1        │
                              │  Port: 4000                       │
                              │  CPU: 0.25 cores                  │
                              │  Memory: 0.5Gi                    │
                              │  Replicas: 0-1 (auto-scale)       │
                              │                                   │
                              │  FQDN: tabsync-backend            │
                              │  .nicestone-*.brazilsouth         │
                              │  .azurecontainerapps.io           │
                              └───────────────────────────────────┘
                                              │
                              ┌───────────────┼───────────────┐
                              ▼               ▼               ▼
                    ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
                    │  SUPABASE   │  │   VERCEL    │  │   CLIENTS    │
                    │  PostgreSQL │  │   Frontend  │  │   (Browsers) │
                    │             │  │             │  │              │
                    │  Region:    │  │  URL:       │  │  Mobile Apps │
                    │  São Paulo  │  │  app-       │  │              │
                    │  (aws-1)    │  │  restaur... │  │              │
                    └─────────────┘  └─────────────┘  └──────────────┘

EXTERNAL SERVICES (não na Azure):
┌─────────────────────────────────────────────────────────────────────┐
│  Database: Supabase PostgreSQL (AWS São Paulo)                      │
│  Frontend: Vercel (https://app-restaurantes.vercel.app)            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. Azure Account

### Detalhes da Assinatura

| Item | Valor |
|------|-------|
| **Subscription Name** | Azure for Students |
| **Subscription ID** | `15c5f9f0-f28d-41fb-b53f-61c744e074ff` |
| **Tenant ID** | `8a1ef6c3-8324-4103-bf4a-1328c5dc3653` |
| **Tenant** | Grupo Marista (pucpr.edu.br) |
| **User** | vinicius.almeida2@pucpr.edu.br |
| **Tipo de Conta** | Estudante (créditos gratuitos) |

### Login na Azure

```bash
# Login interativo
az login

# Login com tenant específico
az login --tenant 8a1ef6c3-8324-4103-bf4a-1328c5dc3653

# Verificar assinatura ativa
az account show

# Definir assinatura padrão
az account set --subscription 15c5f9f0-f28d-41fb-b53f-61c744e074ff
```

---

## 2. Resource Group

### Detalhes

| Item | Valor |
|------|-------|
| **Name** | `tabsync-rg` |
| **Location** | East US 2 |
| **Purpose** | Agrupar todos os recursos do TabSync |

### Comandos

```bash
# Listar resource groups
az group list --output table

# Ver detalhes do resource group
az group show --name tabsync-rg

# Criar resource group (já existe)
az group create --name tabsync-rg --location eastus2

# Deletar resource group (CUIDADO: remove TODOS os recursos)
az group delete --name tabsync-rg --yes --no-wait
```

---

## 3. Container Registry (ACR)

### Detalhes

| Item | Valor |
|------|-------|
| **Name** | `tabsyncregistry` |
| **Login Server** | `tabsyncregistry.azurecr.io` |
| **Location** | Brazil South |
| **SKU** | Basic |
| **Admin Enabled** | true |
| **Repository** | `tabsync-backend` |
| **Tag Atual** | `v1` |
| **Created** | 2025-12-26T14:59:45 |

### Autenticação

```bash
# Login no ACR (usuário admin)
az acr login --name tabsyncregistry

# Login via Docker (se preferir)
docker login tabsyncregistry.azurecr.io

# Obter credenciais admin
az acr credential show --name tabsyncregistry

# Renovar senha (se necessário)
az acr credential renew --name tabsyncregistry --password-name password
```

### Gerenciamento de Imagens

```bash
# Listar repositórios
az acr repository list --name tabsyncregistry --output table

# Listar tags do repositório tabsync-backend
az acr repository show-tags --name tabsyncregistry \
  --repository tabsync-backend --output table

# Ver detalhes de uma imagem específica
az acr repository show --name tabsyncregistry \
  --repository tabsync-backend

# Deletar uma tag específica
az acr repository delete --name tabsyncregistry \
  --image tabsync-backend:v1 --yes
```

### Build e Push de Imagens

```bash
# Opção 1: Build local e push
cd backend
docker build -t tabsyncregistry.azurecr.io/tabsync-backend:v2 .
docker push tabsyncregistry.azurecr.io/tabsync-backend:v2

# Opção 2: Build direto no ACR (mais rápido)
az acr build --registry tabsyncregistry \
  --image tabsync-backend:v2 \
  --file Dockerfile \
  ./backend
```

---

## 4. Container Apps Environment

### Detalhes

| Item | Valor |
|------|-------|
| **Name** | `tabsync-env` |
| **Location** | Brazil South |
| **Default Domain** | `nicestone-9f661f17.brazilsouth.azurecontainerapps.io` |
| **Static IP** | `4.203.0.200` |
| **Workload Profile** | Consumption |
| **Log Analytics Customer ID** | `9973a3c4-4aa0-452d-a36a-5ed479536065` |
| **KEDA Version** | 2.17.2 |
| **Dapr Version** | 1.13.6-msft.6 |

### Comandos

```bash
# Ver detalhes do environment
az containerapp env show \
  --name tabsync-env \
  --resource-group tabsync-rg

# Listar todos os container apps no environment
az containerapp list \
  --environment tabsync-env \
  --resource-group tabsync-rg \
  --output table

# Ver logs do environment
az monitor log-analytics workspace show \
  --workspace-name tabsync-env-logs \
  --resource-group tabsync-rg
```

---

## 5. Container App (Backend)

### Detalhes

| Item | Valor |
|------|-------|
| **Name** | `tabsync-backend` |
| **Location** | Brazil South |
| **FQDN** | `tabsync-backend.nicestone-9f661f17.brazilsouth.azurecontainerapps.io` |
| **Image** | `tabsyncregistry.azurecr.io/tabsync-backend:v1` |
| **Target Port** | 4000 |
| **Status** | Running |
| **Revision** | `tabsync-backend--0000002` |

### Recursos

| Recurso | Valor |
|---------|-------|
| **CPU** | 0.25 cores |
| **Memory** | 0.5Gi |
| **Ephemeral Storage** | 1Gi |

### Scaling

| Configuração | Valor |
|--------------|-------|
| **Min Replicas** | 0 (scale to zero) |
| **Max Replicas** | 1 |
| **Cooldown** | 300 segundos |
| **Polling Interval** | 30 segundos |

### Environment Variables

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres.idhllxnfovognyowarbq:y5TB%25%409R5nt%40Zi%25@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
JWT_SECRET=tabsync-demo-jwt-secret-32chars!
JWT_REFRESH_SECRET=tabsync-demo-refresh-secret-32c!
CORS_ORIGIN=https://app-restaurantes.vercel.app
```

**⚠️ AVISO DE SEGURANÇA CRÍTICO:**
- Os secrets JWT atuais são valores de DEMONSTRAÇÃO
- **NUNCA** use esses valores em produção
- Gere secrets fortes com `openssl rand -base64 32`
- Armazene em Azure Key Vault em produção

### Comandos

```bash
# Ver detalhes do container app
az containerapp show \
  --name tabsync-backend \
  --resource-group tabsync-rg

# Ver status atual
az containerapp show \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --query "properties.runningStatus" -o tsv

# Reiniciar o container app
az containerapp revision restart \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --revision tabsync-backend--0000002

# Ver réplicas ativas
az containerapp replica list \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --output table
```

---

## 6. Processo de Deploy

### Passo 1: Preparar o Código

```bash
# Navegar para o diretório do backend
cd c:\Users\55489\Desktop\projeto-app-restaurantes\backend

# Verificar se o Dockerfile existe
ls Dockerfile

# Verificar .dockerignore
cat .dockerignore
```

### Passo 2: Autenticar no ACR

```bash
# Login no Azure
az login

# Definir subscription
az account set --subscription 15c5f9f0-f28d-41fb-b53f-61c744e074ff

# Login no ACR
az acr login --name tabsyncregistry
```

### Passo 3: Build e Push da Imagem

```bash
# Incrementar versão (exemplo: v1 -> v2)
NEW_VERSION="v2"

# Opção A: Build local
docker build -t tabsyncregistry.azurecr.io/tabsync-backend:$NEW_VERSION .
docker push tabsyncregistry.azurecr.io/tabsync-backend:$NEW_VERSION

# Opção B: Build no ACR (recomendado - mais rápido)
az acr build \
  --registry tabsyncregistry \
  --image tabsync-backend:$NEW_VERSION \
  --file Dockerfile \
  .
```

### Passo 4: Atualizar Container App

```bash
# Atualizar com nova imagem
az containerapp update \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --image tabsyncregistry.azurecr.io/tabsync-backend:$NEW_VERSION

# Verificar se a atualização foi bem-sucedida
az containerapp revision list \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --output table

# Ver logs em tempo real
az containerapp logs show \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --follow
```

### Passo 5: Validar Deploy

```bash
# Testar endpoint de health
curl https://tabsync-backend.nicestone-9f661f17.brazilsouth.azurecontainerapps.io/health

# Verificar status do container
az containerapp show \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --query "properties.{Status:runningStatus,Replicas:template.scale.minReplicas,Fqdn:configuration.ingress.fqdn}" \
  --output table
```

---

## 7. Atualizar Variáveis de Ambiente

### Adicionar ou Modificar Variável

```bash
# Atualizar variável existente
az containerapp update \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --set-env-vars "NODE_ENV=production"

# Adicionar múltiplas variáveis
az containerapp update \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --set-env-vars \
    "NODE_ENV=production" \
    "REDIS_URL=redis://redis.example.com:6379"

# Adicionar secret como variável (recomendado para senhas)
az containerapp update \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --secrets "jwt-secret=MeuNovoSecretSuperForte123" \
  --set-env-vars "JWT_SECRET=secretref:jwt-secret"
```

### Listar Variáveis Atuais

```bash
# Ver todas as variáveis de ambiente
az containerapp show \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --query "properties.template.containers[0].env" \
  --output table
```

### Remover Variável

```bash
# Remover variável específica
az containerapp update \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --remove-env-vars "VARIABLE_NAME"
```

---

## 8. Monitoramento e Logs

### Logs em Tempo Real

```bash
# Ver logs em tempo real
az containerapp logs show \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --follow

# Logs com filtro de texto
az containerapp logs show \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --follow \
  | grep "ERROR"

# Logs de revisão específica
az containerapp logs show \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --revision tabsync-backend--0000002
```

### Logs Históricos (Log Analytics)

```bash
# Instalar extensão (se necessário)
az extension add --name log-analytics

# Query Kusto para erros nas últimas 24h
az monitor log-analytics query \
  --workspace "9973a3c4-4aa0-452d-a36a-5ed479536065" \
  --analytics-query "ContainerAppConsoleLogs_CL | where TimeGenerated > ago(24h) | where Log_s contains 'ERROR' | project TimeGenerated, Log_s | order by TimeGenerated desc" \
  --output table
```

### Métricas

```bash
# Ver CPU usage
az monitor metrics list \
  --resource "/subscriptions/15c5f9f0-f28d-41fb-b53f-61c744e074ff/resourceGroups/tabsync-rg/providers/Microsoft.App/containerApps/tabsync-backend" \
  --metric "CpuUsage" \
  --start-time "2025-12-30T00:00:00Z" \
  --end-time "2025-12-30T23:59:59Z" \
  --interval PT1H

# Ver memória
az monitor metrics list \
  --resource "/subscriptions/15c5f9f0-f28d-41fb-b53f-61c744e074ff/resourceGroups/tabsync-rg/providers/Microsoft.App/containerApps/tabsync-backend" \
  --metric "MemoryUsage" \
  --start-time "2025-12-30T00:00:00Z" \
  --end-time "2025-12-30T23:59:59Z" \
  --interval PT1H

# Ver número de requisições
az monitor metrics list \
  --resource "/subscriptions/15c5f9f0-f28d-41fb-b53f-61c744e074ff/resourceGroups/tabsync-rg/providers/Microsoft.App/containerApps/tabsync-backend" \
  --metric "Requests" \
  --start-time "2025-12-30T00:00:00Z" \
  --end-time "2025-12-30T23:59:59Z" \
  --interval PT1H
```

---

## 9. Scaling

### Configuração Atual

- **Min Replicas:** 0 (scale to zero quando sem tráfego)
- **Max Replicas:** 1 (limita a 1 instância)
- **Cooldown:** 300 segundos (tempo antes de scale down)
- **Polling Interval:** 30 segundos (frequência de verificação)

### Atualizar Configuração de Scale

```bash
# Aumentar número máximo de réplicas
az containerapp update \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --min-replicas 1 \
  --max-replicas 5

# Scale to zero desabilitado (mínimo 1)
az containerapp update \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --min-replicas 1 \
  --max-replicas 3

# Scale baseado em HTTP requests
az containerapp update \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --scale-rule-name http-rule \
  --scale-rule-type http \
  --scale-rule-http-concurrency 100
```

### Aumentar Recursos do Container

```bash
# Aumentar CPU e memória
az containerapp update \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --cpu 0.5 \
  --memory 1.0Gi
```

---

## 10. Database (Supabase)

### Detalhes de Conexão

| Item | Valor |
|------|-------|
| **Provider** | Supabase (PostgreSQL) |
| **Host** | `aws-1-sa-east-1.pooler.supabase.com` |
| **Port** | 5432 |
| **Database** | `postgres` |
| **Project ID** | `idhllxnfovognyowarbq` |
| **Region** | São Paulo (aws-1-sa-east-1) |

### Connection String

```
postgresql://postgres.idhllxnfovognyowarbq:y5TB%25%409R5nt%40Zi%25@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
```

**⚠️ AVISO DE SEGURANÇA:**
- Senha contém caracteres especiais encoded (`%25` = `%`, `%40` = `@`)
- Nunca commite a senha no Git
- Use secrets do Azure em produção

### Migrations

```bash
# No backend local
cd backend

# Rodar migrations
npx prisma migrate deploy

# Ver status das migrations
npx prisma migrate status

# Gerar Prisma Client
npx prisma generate
```

### Backup

**Supabase faz backups automáticos:**
- Daily backups nos últimos 7 dias
- Point-in-time recovery disponível

**Backup manual via pg_dump:**

```bash
# Exportar schema completo
pg_dump "postgresql://postgres.idhllxnfovognyowarbq:PASSWORD@aws-1-sa-east-1.pooler.supabase.com:5432/postgres" > backup.sql

# Apenas schema (sem dados)
pg_dump --schema-only "postgresql://..." > schema.sql

# Apenas dados
pg_dump --data-only "postgresql://..." > data.sql
```

---

## 11. Frontend (Vercel)

### Detalhes

| Item | Valor |
|------|-------|
| **URL** | https://app-restaurantes.vercel.app |
| **Framework** | Next.js 14.2+ (App Router) |
| **Deploy** | Automático via Git push |
| **Branch** | `main` |

### Variáveis de Ambiente (Vercel)

```bash
# No Vercel Dashboard > Settings > Environment Variables
NEXT_PUBLIC_API_URL=https://tabsync-backend.nicestone-9f661f17.brazilsouth.azurecontainerapps.io
NEXT_PUBLIC_SOCKET_URL=https://tabsync-backend.nicestone-9f661f17.brazilsouth.azurecontainerapps.io
```

### Deploy Manual (se necessário)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend-web
vercel --prod
```

---

## 12. Troubleshooting

### Container App Não Inicia

```bash
# Ver logs de inicialização
az containerapp logs show \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --tail 100

# Ver eventos de revisão
az containerapp revision show \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --revision tabsync-backend--0000002

# Verificar health probes
az containerapp show \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --query "properties.template.containers[0].probes"
```

### Erro de Conexão com Database

```bash
# Testar conexão do container
az containerapp exec \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --command "sh"

# Dentro do container
nc -zv aws-1-sa-east-1.pooler.supabase.com 5432
```

### Build Falhando no ACR

```bash
# Ver logs de build
az acr task logs --registry tabsyncregistry

# Build com verbose
az acr build \
  --registry tabsyncregistry \
  --image tabsync-backend:debug \
  --file Dockerfile \
  --platform linux/amd64 \
  . --verbose
```

### 502 Bad Gateway

**Possíveis causas:**
1. App não está escutando na porta 4000
2. Health check falhando
3. App crashando no startup

**Solução:**

```bash
# Verificar porta configurada
az containerapp show \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --query "properties.template.containers[0].{Port:ingress.targetPort,EnvPort:env[?name=='PORT'].value}" \
  --output json

# Verificar se app está respondendo
az containerapp exec \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --command "curl localhost:4000/health"
```

### Scale to Zero Muito Agressivo

```bash
# Desabilitar scale to zero
az containerapp update \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --min-replicas 1
```

---

## 13. Custos

### Azure for Students

**Créditos disponíveis:**
- USD 100 (aproximadamente R$ 500)
- Válido por 12 meses

### Estimativa de Consumo Mensal

| Recurso | SKU | Custo Estimado |
|---------|-----|----------------|
| Container Registry | Basic | ~USD 5/mês |
| Container App | 0.25 vCPU, 0.5Gi | ~USD 10-20/mês* |
| Log Analytics | 5GB/mês | Gratuito** |
| **TOTAL** | | **~USD 15-25/mês** |

\* Depende do tráfego e tempo de execução
\** Primeiros 5GB/mês gratuitos

### Monitorar Custos

```bash
# Ver custos acumulados
az consumption usage list \
  --start-date 2025-12-01 \
  --end-date 2025-12-31 \
  --output table

# Cost Management no Portal
# https://portal.azure.com/#view/Microsoft_Azure_CostManagement
```

### Otimização de Custos

1. **Scale to Zero:** Mantém min replicas = 0 em dev
2. **ACR Basic:** Suficiente para pequenos projetos
3. **Delete unused images:** Limpar tags antigas do ACR
4. **Log retention:** Reduzir retenção de logs para 30 dias

```bash
# Deletar imagens antigas (manter apenas últimas 3 versões)
az acr repository show-tags \
  --name tabsyncregistry \
  --repository tabsync-backend \
  --orderby time_asc \
  --output tsv | head -n -3 | xargs -I % az acr repository delete \
  --name tabsyncregistry \
  --image tabsync-backend:% \
  --yes
```

---

## 14. Segurança

### Vulnerabilidades Atuais

**🔴 CRÍTICO - SECRETS FRACOS:**

```bash
# ATUAL (DEMO - INSEGURO)
JWT_SECRET=tabsync-demo-jwt-secret-32chars!
JWT_REFRESH_SECRET=tabsync-demo-refresh-secret-32c!
```

**✅ RECOMENDADO (PRODUÇÃO):**

```bash
# Gerar secrets fortes
openssl rand -base64 32  # Para JWT_SECRET
openssl rand -base64 32  # Para JWT_REFRESH_SECRET

# Armazenar no Azure Key Vault
az keyvault create \
  --name tabsync-keyvault \
  --resource-group tabsync-rg \
  --location brazilsouth

# Adicionar secret
az keyvault secret set \
  --vault-name tabsync-keyvault \
  --name jwt-secret \
  --value "SEU_SECRET_FORTE_AQUI"

# Referenciar no Container App
az containerapp update \
  --name tabsync-backend \
  --resource-group tabsync-rg \
  --secrets "jwt-secret=keyvaultref:https://tabsync-keyvault.vault.azure.net/secrets/jwt-secret" \
  --set-env-vars "JWT_SECRET=secretref:jwt-secret"
```

### Checklist de Segurança

- [ ] Substituir JWT secrets por valores fortes
- [ ] Usar Azure Key Vault para secrets
- [ ] Habilitar HTTPS only (já habilitado)
- [ ] Configurar WAF (Web Application Firewall)
- [ ] Habilitar Azure AD authentication
- [ ] Rotação automática de secrets
- [ ] Scan de vulnerabilidades em imagens Docker
- [ ] Network isolation (VNet)
- [ ] Rate limiting no Container App
- [ ] DDoS protection

### Scan de Vulnerabilidades

```bash
# Escanear imagem com Trivy (local)
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image \
  tabsyncregistry.azurecr.io/tabsync-backend:v1

# Habilitar scan no ACR (Microsoft Defender)
az security pricing create \
  --name ContainerRegistry \
  --tier Standard
```

---

## 15. CI/CD com GitHub Actions

### Workflow Sugerido

Criar arquivo `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to Azure

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
  workflow_dispatch:

env:
  ACR_NAME: tabsyncregistry
  RESOURCE_GROUP: tabsync-rg
  CONTAINER_APP: tabsync-backend

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Get ACR credentials
        id: acr
        run: |
          echo "username=$(az acr credential show -n ${{ env.ACR_NAME }} --query username -o tsv)" >> $GITHUB_OUTPUT
          echo "password=$(az acr credential show -n ${{ env.ACR_NAME }} --query passwords[0].value -o tsv)" >> $GITHUB_OUTPUT

      - name: Build and push image
        run: |
          VERSION=${{ github.sha }}
          az acr build \
            --registry ${{ env.ACR_NAME }} \
            --image tabsync-backend:$VERSION \
            --image tabsync-backend:latest \
            --file backend/Dockerfile \
            ./backend

      - name: Deploy to Container App
        run: |
          az containerapp update \
            --name ${{ env.CONTAINER_APP }} \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --image ${{ env.ACR_NAME }}.azurecr.io/tabsync-backend:${{ github.sha }}

      - name: Verify deployment
        run: |
          sleep 30
          curl -f https://tabsync-backend.nicestone-9f661f17.brazilsouth.azurecontainerapps.io/health
```

### Configurar Secrets no GitHub

```bash
# Criar Service Principal
az ad sp create-for-rbac \
  --name "tabsync-github-actions" \
  --role contributor \
  --scopes /subscriptions/15c5f9f0-f28d-41fb-b53f-61c744e074ff/resourceGroups/tabsync-rg \
  --sdk-auth

# Copiar output JSON e adicionar como secret AZURE_CREDENTIALS no GitHub
# Settings > Secrets and variables > Actions > New repository secret
```

---

## 16. Comandos Rápidos

### Painel Geral

```bash
# Ver status de tudo
az resource list --resource-group tabsync-rg --output table

# URL do backend
echo "https://tabsync-backend.nicestone-9f661f17.brazilsouth.azurecontainerapps.io"

# Logs em tempo real
az containerapp logs show -n tabsync-backend -g tabsync-rg --follow

# Reiniciar app
az containerapp revision restart -n tabsync-backend -g tabsync-rg

# Ver métricas rápidas
az containerapp show -n tabsync-backend -g tabsync-rg \
  --query "properties.{Status:runningStatus,Replicas:runningStatus,Fqdn:configuration.ingress.fqdn}"
```

### Deploy Rápido

```bash
# Build e deploy em um comando
cd backend && \
az acr build --registry tabsyncregistry --image tabsync-backend:$(date +%Y%m%d-%H%M%S) . && \
az containerapp update -n tabsync-backend -g tabsync-rg --image tabsyncregistry.azurecr.io/tabsync-backend:latest
```

---

## 17. Referências

### Documentação Oficial

- [Azure Container Apps](https://learn.microsoft.com/azure/container-apps/)
- [Azure Container Registry](https://learn.microsoft.com/azure/container-registry/)
- [Azure CLI Reference](https://learn.microsoft.com/cli/azure/)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)

### Ferramentas

- [Azure Portal](https://portal.azure.com)
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Prisma CLI](https://www.prisma.io/docs/reference/api-reference/command-reference)

### Support

- **Azure Support:** Portal > Help + support
- **Supabase Support:** Dashboard > Support
- **Vercel Support:** Dashboard > Help

---

## Changelog

| Data | Versão | Mudanças |
|------|--------|----------|
| 2025-12-26 | 1.0.0 | Setup inicial da infraestrutura |
| 2025-12-30 | 1.1.0 | Documentação completa criada |

---

**Última atualização:** 2025-12-30
**Mantido por:** Equipe TabSync
**Contato:** vinicius.almeida2@pucpr.edu.br
