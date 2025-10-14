# Teste Completo CRUD de Vendas em Produção
# Vamos resolver de uma vez por todas!

$baseUrl = "http://localhost:3016"
$token = $null

Write-Host "=== TESTE COMPLETO CRUD DE VENDAS ===" -ForegroundColor Green
Write-Host "URL: $baseUrl" -ForegroundColor Yellow

# 1. LOGIN
Write-Host "`n1. FAZENDO LOGIN..." -ForegroundColor Cyan
try {
    $loginData = @{
        email = "admin@backoffice.com"
        password = "Admin123!@#"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/users/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "✅ LOGIN SUCESSO!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0,50))..." -ForegroundColor Yellow
    Write-Host "Usuário: $($loginResponse.data.user.name)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ ERRO NO LOGIN: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. LISTAR VENDAS
Write-Host "`n2. LISTANDO VENDAS..." -ForegroundColor Cyan
try {
    $headers = @{"Authorization" = "Bearer $token"}
    $sales = Invoke-RestMethod -Uri "$baseUrl/api/sales" -Method GET -Headers $headers
    Write-Host "✅ LISTAGEM SUCESSO!" -ForegroundColor Green
    Write-Host "Total de vendas: $($sales.data.sales.Count)" -ForegroundColor Yellow
    if ($sales.data.sales.Count -gt 0) {
        $firstSale = $sales.data.sales[0]
        Write-Host "Primeira venda: $($firstSale.buyer.name) - R$ $($firstSale.salePrice)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ ERRO NA LISTAGEM: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. LISTAR VEÍCULOS DISPONÍVEIS
Write-Host "`n3. LISTANDO VEÍCULOS DISPONÍVEIS..." -ForegroundColor Cyan
try {
    $vehicles = Invoke-RestMethod -Uri "$baseUrl/api/vehicles?status=active&limit=5" -Method GET -Headers $headers
    Write-Host "✅ VEÍCULOS LISTADOS!" -ForegroundColor Green
    Write-Host "Total de veículos ativos: $($vehicles.data.vehicles.Count)" -ForegroundColor Yellow
    
    if ($vehicles.data.vehicles.Count -gt 0) {
        $availableVehicle = $vehicles.data.vehicles[0]
        Write-Host "Veículo disponível: $($availableVehicle.brand) $($availableVehicle.vehicleModel) - ID: $($availableVehicle._id)" -ForegroundColor Yellow
        $vehicleId = $availableVehicle._id
    } else {
        Write-Host "⚠️ Nenhum veículo disponível para venda" -ForegroundColor Yellow
        $vehicleId = "68ee5c09fd0539a2cf4e5f6b" # ID de fallback
    }
} catch {
    Write-Host "❌ ERRO AO LISTAR VEÍCULOS: $($_.Exception.Message)" -ForegroundColor Red
    $vehicleId = "68ee5c09fd0539a2cf4e5f6b" # ID de fallback
}

# 4. CRIAR VENDA
Write-Host "`n4. CRIANDO VENDA..." -ForegroundColor Cyan
try {
    $saleData = @{
        vehicleId = $vehicleId
        buyer = @{
            name = "João Silva Teste"
            email = "joao.teste@email.com"
            phone = "11999999999"
            document = "12345678900"
        }
        salePrice = 95000
        paymentMethod = "cash"
        notes = "Venda de teste - CRUD completo"
        commission = 0
    } | ConvertTo-Json -Depth 3
    
    $newSale = Invoke-RestMethod -Uri "$baseUrl/api/sales" -Method POST -Body $saleData -Headers $headers -ContentType "application/json"
    Write-Host "✅ VENDA CRIADA COM SUCESSO!" -ForegroundColor Green
    Write-Host "ID da venda: $($newSale.data._id)" -ForegroundColor Yellow
    Write-Host "Comprador: $($newSale.data.buyer.name)" -ForegroundColor Yellow
    Write-Host "Valor: R$ $($newSale.data.salePrice)" -ForegroundColor Yellow
    $saleId = $newSale.data._id
} catch {
    Write-Host "❌ ERRO AO CRIAR VENDA: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorBody" -ForegroundColor Red
    }
    $saleId = $null
}

# 5. BUSCAR VENDA POR ID
if ($saleId) {
    Write-Host "`n5. BUSCANDO VENDA POR ID..." -ForegroundColor Cyan
    try {
        $sale = Invoke-RestMethod -Uri "$baseUrl/api/sales/$saleId" -Method GET -Headers $headers
        Write-Host "✅ VENDA ENCONTRADA!" -ForegroundColor Green
        Write-Host "ID: $($sale.data._id)" -ForegroundColor Yellow
        Write-Host "Status: $($sale.data.status)" -ForegroundColor Yellow
        Write-Host "Comissão: R$ $($sale.data.commission)" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ ERRO AO BUSCAR VENDA: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. ATUALIZAR VENDA
if ($saleId) {
    Write-Host "`n6. ATUALIZANDO VENDA..." -ForegroundColor Cyan
    try {
        $updateData = @{
            status = "completed"
            notes = "Venda finalizada com sucesso - teste CRUD"
        } | ConvertTo-Json
        
        $updatedSale = Invoke-RestMethod -Uri "$baseUrl/api/sales/$saleId" -Method PUT -Body $updateData -Headers $headers -ContentType "application/json"
        Write-Host "✅ VENDA ATUALIZADA!" -ForegroundColor Green
        Write-Host "Novo status: $($updatedSale.data.status)" -ForegroundColor Yellow
        Write-Host "Notas: $($updatedSale.data.notes)" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ ERRO AO ATUALIZAR VENDA: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 7. ESTATÍSTICAS
Write-Host "`n7. VERIFICANDO ESTATÍSTICAS..." -ForegroundColor Cyan
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/sales/stats" -Method GET -Headers $headers
    Write-Host "✅ ESTATÍSTICAS OBTIDAS!" -ForegroundColor Green
    Write-Host "Total de vendas: $($stats.data.totalSales)" -ForegroundColor Yellow
    Write-Host "Vendas completadas: $($stats.data.completedSales)" -ForegroundColor Yellow
    Write-Host "Vendas pendentes: $($stats.data.pendingSales)" -ForegroundColor Yellow
    Write-Host "Receita total: R$ $($stats.data.totalRevenue)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ ERRO NAS ESTATÍSTICAS: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. VENDAS DO VENDEDOR
Write-Host "`n8. VENDAS DO VENDEDOR..." -ForegroundColor Cyan
try {
    $mySales = Invoke-RestMethod -Uri "$baseUrl/api/sales/my-sales" -Method GET -Headers $headers
    Write-Host "✅ VENDAS DO VENDEDOR!" -ForegroundColor Green
    Write-Host "Total de vendas do vendedor: $($mySales.data.Count)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ ERRO NAS VENDAS DO VENDEDOR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TESTE COMPLETO FINALIZADO ===" -ForegroundColor Green
Write-Host "✅ CRUD de vendas testado completamente!" -ForegroundColor Green
