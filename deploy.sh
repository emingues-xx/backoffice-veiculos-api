#!/bin/bash

# 🚀 Script de Deploy para Railway - Backoffice Veículos API

echo "🚀 Iniciando processo de deploy para Railway..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar se o git está configurado
if [ ! -d ".git" ]; then
    echo "❌ Erro: Este não é um repositório Git"
    exit 1
fi

# Build do projeto
echo "📦 Fazendo build do projeto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build. Verifique os erros acima."
    exit 1
fi

echo "✅ Build concluído com sucesso!"

# Verificar se há mudanças para commit
if [ -z "$(git status --porcelain)" ]; then
    echo "ℹ️  Nenhuma mudança para commit"
else
    echo "📝 Fazendo commit das mudanças..."
    git add .
    git commit -m "feat: prepare for Railway deployment"
fi

# Push para o repositório
echo "⬆️  Fazendo push para o repositório..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Erro no push. Verifique sua conexão e permissões."
    exit 1
fi

echo "✅ Push concluído com sucesso!"
echo ""
echo "🎉 Deploy preparado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse https://railway.app"
echo "2. Conecte seu repositório GitHub"
echo "3. Configure as variáveis de ambiente:"
echo "   - NODE_ENV=production"
echo "   - JWT_SECRET=seu-jwt-secret-seguro"
echo "   - DATABASE_URL=sua-connection-string-mongodb"
echo "4. O deploy será automático!"
echo ""
echo "📚 Consulte o arquivo RAILWAY_DEPLOY.md para instruções detalhadas"
