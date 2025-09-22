# 🚀 Instruções de Deploy - Railway

## ✅ Status: Pronto para Deploy!

Sua API está **100% configurada** para deploy no Railway. Todos os arquivos necessários foram criados e testados.

## 🎯 Deploy Rápido (3 passos)

### 1. **Acesse o Railway**
- Vá para [railway.app](https://railway.app)
- Faça login com sua conta GitHub
- Clique em **"New Project"**
- Selecione **"Deploy from GitHub repo"**
- Escolha o repositório `backoffice-veiculos-api`

### 2. **Configure as Variáveis de Ambiente**
No painel do Railway, vá em **Variables** e adicione:

```env
NODE_ENV=production
JWT_SECRET=seu-jwt-secret-super-seguro-com-pelo-menos-32-caracteres
DATABASE_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/backoffice-veiculos
```

### 3. **Configure o MongoDB Atlas**
- Acesse [MongoDB Atlas](https://cloud.mongodb.com)
- Crie um cluster gratuito
- Configure usuário e senha
- Adicione IP `0.0.0.0/0` nas Network Access
- Copie a connection string para `DATABASE_URL`

## 🔧 Arquivos de Configuração Criados

✅ **railway.json** - Configuração do Railway
✅ **nixpacks.toml** - Build otimizado
✅ **.railwayignore** - Arquivos ignorados no deploy
✅ **deploy.ps1** - Script de deploy para Windows
✅ **deploy.sh** - Script de deploy para Linux/Mac
✅ **RAILWAY_DEPLOY.md** - Documentação completa

## 🚀 Comandos Úteis

### Deploy Local (teste)
```bash
# Windows
.\deploy.ps1

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### Build Local
```bash
npm run build
npm start
```

## 📊 Endpoints que Funcionarão

Após o deploy, sua API estará disponível em:
- `https://seu-projeto.railway.app/health` - Health check
- `https://seu-projeto.railway.app/docs` - Documentação Swagger
- `https://seu-projeto.railway.app/api/vehicles` - API de veículos
- `https://seu-projeto.railway.app/api/users` - API de usuários
- `https://seu-projeto.railway.app/api/sales` - API de vendas

## 🔐 Variáveis de Ambiente Recomendadas

```env
# Obrigatórias
NODE_ENV=production
JWT_SECRET=seu-jwt-secret-muito-seguro
DATABASE_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/backoffice-veiculos

# Opcionais
CORS_ORIGIN=https://seu-frontend.com
RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL=info
```

## 🎉 Pronto!

Sua API está configurada com:
- ✅ TypeScript compilando
- ✅ Build funcionando
- ✅ Configurações de produção
- ✅ Health checks
- ✅ Documentação automática
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Logs estruturados

**Apenas conecte ao Railway e faça o deploy!** 🚀
