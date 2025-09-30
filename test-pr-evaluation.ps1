# Script para testar a API de avaliação de PR localmente

param(
    [Parameter(Mandatory=$true)]
    [string]$PrUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$WebhookSecret = "DF94AEC11B7255BA28B4934259186",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiUrl = "https://claude-webhook-production.up.railway.app/evaluate-pullrequest"
)

Write-Host "🤖 Testando PR Evaluation API..." -ForegroundColor Cyan
Write-Host ""

# Extrair informações do PR URL
if ($PrUrl -match "github\.com/([^/]+)/([^/]+)/pull/(\d+)") {
    $owner = $matches[1]
    $repo = $matches[2]
    $prNumber = $matches[3]
    
    Write-Host "📋 Informações do PR:" -ForegroundColor Yellow
    Write-Host "  Owner: $owner"
    Write-Host "  Repo: $repo"
    Write-Host "  Number: $prNumber"
    Write-Host "  URL: $PrUrl"
    Write-Host ""
} else {
    Write-Host "❌ URL do PR inválida. Use o formato: https://github.com/owner/repo/pull/123" -ForegroundColor Red
    exit 1
}

# Dados para enviar para a API
$requestBody = @{
    prUrl = $PrUrl
    prNumber = [int]$prNumber
    prTitle = "Test PR - API Evaluation"
    prAuthor = "test-user"
    prBranch = "feature/test-branch"
    baseBranch = "main"
    repository = "$owner/$repo"
} | ConvertTo-Json -Depth 3

Write-Host "🚀 Enviando requisição para a API..." -ForegroundColor Green
Write-Host "📍 API URL: $ApiUrl" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $ApiUrl -Method POST -Body $requestBody -ContentType "application/json" -Headers @{"X-Webhook-Secret" = $WebhookSecret}
    
    Write-Host "✅ Resposta da API recebida com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # Exibir resposta formatada
    Write-Host "📊 Resultado da Avaliação:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    if ($response.evaluation) {
        $eval = $response.evaluation
        
        Write-Host "🎯 Score: $($eval.score)/10" -ForegroundColor Yellow
        Write-Host "📈 Status: $($eval.status)" -ForegroundColor Yellow
        Write-Host ""
        
        if ($eval.recommendations -and $eval.recommendations.Count -gt 0) {
            Write-Host "💡 Recomendações:" -ForegroundColor Green
            for ($i = 0; $i -lt $eval.recommendations.Count; $i++) {
                Write-Host "  $($i + 1). $($eval.recommendations[$i])" -ForegroundColor White
            }
            Write-Host ""
        }
        
        if ($eval.issues -and $eval.issues.Count -gt 0) {
            Write-Host "⚠️ Problemas Encontrados:" -ForegroundColor Red
            for ($i = 0; $i -lt $eval.issues.Count; $i++) {
                Write-Host "  $($i + 1). $($eval.issues[$i])" -ForegroundColor White
            }
            Write-Host ""
        }
    } else {
        Write-Host "📄 Resposta completa:" -ForegroundColor White
        $response | ConvertTo-Json -Depth 5 | Write-Host
    }
    
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "✅ Teste concluído com sucesso!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erro ao chamar a API:" -ForegroundColor Red
    Write-Host "  Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "  Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Response Body: $responseBody" -ForegroundColor Red
    }
    
    exit 1
}

Write-Host ""
Write-Host "🔗 Para testar com um PR real, use:" -ForegroundColor Cyan
Write-Host "  .\test-pr-evaluation.ps1 -PrUrl https://github.com/owner/repo/pull/123" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Para usar uma API customizada:" -ForegroundColor Cyan
Write-Host "  .\test-pr-evaluation.ps1 -PrUrl https://github.com/owner/repo/pull/123 -ApiUrl https://sua-api.com/evaluate" -ForegroundColor White
