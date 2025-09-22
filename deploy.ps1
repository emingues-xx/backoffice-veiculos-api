# 🚀 Script de Deploy para Railway - Backoffice Veículos API

Write-Host "🚀 Iniciando processo de deploy para Railway..." -ForegroundColor Green

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script no diretório raiz do projeto" -ForegroundColor Red
    exit 1
}

# Verificar se o git está configurado
if (-not (Test-Path ".git")) {
    Write-Host "❌ Erro: Este não é um repositório Git" -ForegroundColor Red
    exit 1
}

# Build do projeto
Write-Host "📦 Fazendo build do projeto..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build. Verifique os erros acima." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green

# Verificar se há mudanças para commit
$gitStatus = git status --porcelain
if ([string]::IsNullOrEmpty($gitStatus)) {
    Write-Host "ℹ️  Nenhuma mudança para commit" -ForegroundColor Blue
} else {
    Write-Host "📝 Fazendo commit das mudanças..." -ForegroundColor Yellow
    git add .
    git commit -m "feat: prepare for Railway deployment"
}

# Push para o repositório
Write-Host "⬆️  Fazendo push para o repositório..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no push. Verifique sua conexão e permissões." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Push concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Deploy preparado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Acesse https://railway.app" -ForegroundColor White
Write-Host "2. Conecte seu repositório GitHub" -ForegroundColor White
Write-Host "3. Configure as variáveis de ambiente:" -ForegroundColor White
Write-Host "   - NODE_ENV=production" -ForegroundColor Gray
Write-Host "   - JWT_SECRET=seu-jwt-secret-seguro" -ForegroundColor Gray
Write-Host "   - DATABASE_URL=sua-connection-string-mongodb" -ForegroundColor Gray
Write-Host "4. O deploy será automático!" -ForegroundColor White
Write-Host ""
Write-Host "📚 Consulte o arquivo RAILWAY_DEPLOY.md para instruções detalhadas" -ForegroundColor Cyan
