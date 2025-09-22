# 🚀 Deploy no Railway - Backoffice Veículos API

## 📋 Pré-requisitos

1. **Conta no Railway**: [railway.app](https://railway.app)
2. **Repositório no GitHub**: Código deve estar em um repositório público ou privado
3. **MongoDB Atlas**: Para banco de dados em produção

## 🛠️ Passo a Passo

### 1. Preparar o Repositório

```bash
# Fazer commit de todas as alterações
git add .
git commit -m "feat: prepare for Railway deployment"
git push origin main
```

### 2. Conectar ao Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Escolha o repositório `backoffice-veiculos-api`

### 3. Configurar Variáveis de Ambiente

No painel do Railway, vá em **Variables** e adicione:

```env
# Obrigatórias
NODE_ENV=production
JWT_SECRET=seu-jwt-secret-super-seguro-aqui
DATABASE_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/backoffice-veiculos

# Opcionais
CORS_ORIGIN=https://seu-frontend.vercel.app
RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL=info
```

### 4. Configurar MongoDB Atlas

1. Acesse [MongoDB Atlas](https://cloud.mongodb.com)
2. Crie um cluster gratuito
3. Configure um usuário de banco
4. Adicione o IP `0.0.0.0/0` nas Network Access (para permitir Railway)
5. Copie a connection string e use como `DATABASE_URL`

### 5. Deploy Automático

O Railway irá:
- Detectar automaticamente que é um projeto Node.js
- Instalar dependências com `npm ci`
- Executar build com `npm run build`
- Iniciar a aplicação com `npm start`

### 6. Verificar Deploy

Após o deploy, teste os endpoints:

```bash
# Health Check
curl https://seu-projeto.railway.app/health

# API Info
curl https://seu-projeto.railway.app/

# Documentação
# Acesse: https://seu-projeto.railway.app/docs
```

## 🔧 Configurações Específicas

### Railway.json
- Configurado para usar Nixpacks
- Health check no endpoint `/health`
- Restart automático em caso de falha

### Nixpacks.toml
- Build otimizado para Node.js
- Comando de start configurado

### Variáveis de Ambiente Recomendadas

```env
# Produção
NODE_ENV=production
PORT=3000

# Segurança
JWT_SECRET=seu-jwt-secret-muito-seguro-com-pelo-menos-32-caracteres

# Banco de Dados
DATABASE_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/backoffice-veiculos

# CORS (ajuste para seu domínio)
CORS_ORIGIN=https://seu-frontend.com

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=900000

# Logs
LOG_LEVEL=info
```

## 🚨 Troubleshooting

### Erro de Conexão com MongoDB
- Verifique se o IP do Railway está liberado no MongoDB Atlas
- Confirme se a connection string está correta
- Teste a conexão localmente primeiro

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme se o TypeScript está compilando localmente
- Verifique os logs do Railway

### Erro de CORS
- Configure `CORS_ORIGIN` com o domínio correto do frontend
- Para desenvolvimento, pode usar `*` (não recomendado para produção)

## 📊 Monitoramento

O Railway oferece:
- Logs em tempo real
- Métricas de performance
- Health checks automáticos
- Deploy automático a cada push

## 🔄 CI/CD

Para deploy automático:
1. Conecte o repositório GitHub ao Railway
2. A cada push na branch `main`, o deploy será automático
3. Configure webhooks se necessário

## 💰 Custos

- **Railway**: Plano gratuito disponível
- **MongoDB Atlas**: Cluster gratuito (512MB)
- **Domínio customizado**: Opcional

## 🎯 Próximos Passos

1. Configurar domínio customizado
2. Implementar CI/CD com GitHub Actions
3. Configurar monitoramento avançado
4. Implementar backup automático do banco
