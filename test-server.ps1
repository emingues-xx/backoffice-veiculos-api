# Script de teste para verificar se o servidor está funcionando
Write-Host "=== TESTE REGRESSIVO - BACKOFFICE VEÍCULOS API ===" -ForegroundColor Green
Write-Host ""

# Configurar variáveis de ambiente
$env:CORS_ORIGIN="*"
$env:DATABASE_URL="mongodb://mongo:DBwIgawgLoPFnGSwbVPTdUiyaKPCtvUc@mainline.proxy.rlwy.net:16290"
$env:JWT_SECRET="63f3ad853e32818c80e7c4f9374d70ac3370a166c7bc8b64bebd67c690e55b46"
$env:LOG_LEVEL="info"
$env:NODE_ENV="production"
$env:RATE_LIMIT_MAX_REQUESTS="1000"
$env:REDIS_URL="redis://default:LBPOBzVCbGHEhcOtQRd-pzC2kJgCmjK0@redis.railway.internal:6379"
$env:ALERTING_ENABLED="true"
$env:ALERT_RESPONSE_TIME_WARNING="500"
$env:ALERT_RESPONSE_TIME_CRITICAL="1000"
$env:ALERT_ERROR_RATE_WARNING="2.0"
$env:ALERT_ERROR_RATE_CRITICAL="5.0"
$env:ALERT_MEMORY_WARNING="80.0"
$env:ALERT_MEMORY_CRITICAL="90.0"
$env:PORT="3016"

Write-Host "Variáveis de ambiente configuradas" -ForegroundColor Yellow
Write-Host ""

# Iniciar servidor em background
Write-Host "Iniciando servidor na porta 3016..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden

# Aguardar servidor inicializar
Write-Host "Aguardando servidor inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Função para testar endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [string]$Description
    )
    
    try {
        Write-Host "Testando: $Description" -ForegroundColor Cyan
        $response = Invoke-WebRequest -Uri $Url -Method $Method -TimeoutSec 10
        Write-Host "✅ $Description - Status: $($response.StatusCode)" -ForegroundColor Green
        
        if ($response.Content) {
            $json = $response.Content | ConvertFrom-Json
            if ($json.success) {
                Write-Host "   Response: Success" -ForegroundColor Green
            } else {
                Write-Host "   Response: Error - $($json.error)" -ForegroundColor Red
            }
        }
        Write-Host ""
        return $true
    }
    catch {
        Write-Host "❌ $Description - Erro: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Testar endpoints básicos
Write-Host "=== TESTANDO ENDPOINTS BÁSICOS ===" -ForegroundColor Green
$basicTests = @(
    @{Url="http://localhost:3016/"; Description="Root endpoint"},
    @{Url="http://localhost:3016/health"; Description="Health check básico"},
    @{Url="http://localhost:3016/health/detailed"; Description="Health check detalhado"},
    @{Url="http://localhost:3016/health/ready"; Description="Readiness check"},
    @{Url="http://localhost:3016/health/live"; Description="Liveness check"},
    @{Url="http://localhost:3016/metrics"; Description="Métricas Prometheus"}
)

$basicResults = @()
foreach ($test in $basicTests) {
    $result = Test-Endpoint -Url $test.Url -Description $test.Description
    $basicResults += $result
}

# Testar endpoints de monitoramento
Write-Host "=== TESTANDO ENDPOINTS DE MONITORAMENTO ===" -ForegroundColor Green
$monitoringTests = @(
    @{Url="http://localhost:3016/api/monitoring/status"; Description="Status do monitoramento"},
    @{Url="http://localhost:3016/api/monitoring/jobs/statistics"; Description="Estatísticas de jobs"},
    @{Url="http://localhost:3016/api/monitoring/jobs/history"; Description="Histórico de execuções"},
    @{Url="http://localhost:3016/api/monitoring/jobs/running"; Description="Jobs em execução"},
    @{Url="http://localhost:3016/api/monitoring/jobs/performance"; Description="Métricas de performance"}
)

$monitoringResults = @()
foreach ($test in $monitoringTests) {
    $result = Test-Endpoint -Url $test.Url -Description $test.Description
    $monitoringResults += $result
}

# Resumo dos testes
Write-Host "=== RESUMO DOS TESTES ===" -ForegroundColor Green
$basicPassed = ($basicResults | Where-Object { $_ -eq $true }).Count
$basicTotal = $basicResults.Count
$monitoringPassed = ($monitoringResults | Where-Object { $_ -eq $true }).Count
$monitoringTotal = $monitoringResults.Count

Write-Host "Endpoints Básicos: $basicPassed/$basicTotal passaram" -ForegroundColor $(if($basicPassed -eq $basicTotal) {"Green"} else {"Yellow"})
Write-Host "Endpoints de Monitoramento: $monitoringPassed/$monitoringTotal passaram" -ForegroundColor $(if($monitoringPassed -eq $monitoringTotal) {"Green"} else {"Yellow"})

$totalPassed = $basicPassed + $monitoringPassed
$totalTests = $basicTotal + $monitoringTotal

Write-Host ""
Write-Host "TOTAL: $totalPassed/$totalTests testes passaram" -ForegroundColor $(if($totalPassed -eq $totalTests) {"Green"} else {"Yellow"})

if ($totalPassed -eq $totalTests) {
    Write-Host ""
    Write-Host "🎉 TODOS OS TESTES PASSARAM! Sistema pronto para produção!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Alguns testes falharam. Verifique os logs acima." -ForegroundColor Yellow
}

# Parar servidor
Write-Host ""
Write-Host "Parando servidor..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host ""
Write-Host "=== TESTE CONCLUÍDO ===" -ForegroundColor Green
