# Script para testar endpoints de sales
Write-Host "=== TESTANDO ENDPOINTS DE SALES ==="

# 1. Login
Write-Host "`n1. LOGIN"
$loginData = '{"email": "admin@backoffice.com", "password": "Admin123!@#"}'
try {
    $loginResponse = Invoke-WebRequest -Uri "https://backoffice-veiculos-api-production.up.railway.app/api/users/login" -Method POST -Body $loginData -ContentType "application/json"
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    $token = $loginResult.data.token
    Write-Host "✅ LOGIN: Token obtido"
} catch {
    Write-Host "❌ ERRO no login: $($_.Exception.Message)"
    exit 1
}

# 2. Testar GET /sales
Write-Host "`n2. GET /sales"
$headers = @{ "Authorization" = "Bearer $token" }
try {
    $salesResponse = Invoke-WebRequest -Uri "https://backoffice-veiculos-api-production.up.railway.app/api/sales" -Method GET -Headers $headers
    $salesData = $salesResponse.Content | ConvertFrom-Json
    Write-Host "✅ GET /sales: Sucesso! Total: $($salesData.pagination.total)"
} catch {
    Write-Host "❌ ERRO GET /sales: $($_.Exception.Message)"
}

# 3. Testar GET /sales/stats
Write-Host "`n3. GET /sales/stats"
try {
    $statsResponse = Invoke-WebRequest -Uri "https://backoffice-veiculos-api-production.up.railway.app/api/sales/stats" -Method GET -Headers $headers
    $statsData = $statsResponse.Content | ConvertFrom-Json
    Write-Host "✅ GET /sales/stats: Sucesso! Total: $($statsData.data.totalSales)"
} catch {
    Write-Host "❌ ERRO GET /sales/stats: $($_.Exception.Message)"
}

# 4. Testar GET /sales/my-sales
Write-Host "`n4. GET /sales/my-sales"
try {
    $mySalesResponse = Invoke-WebRequest -Uri "https://backoffice-veiculos-api-production.up.railway.app/api/sales/my-sales" -Method GET -Headers $headers
    $mySalesData = $mySalesResponse.Content | ConvertFrom-Json
    Write-Host "✅ GET /sales/my-sales: Sucesso! Total: $($mySalesData.pagination.total)"
} catch {
    Write-Host "❌ ERRO GET /sales/my-sales: $($_.Exception.Message)"
}

# 5. Obter veículo para criar venda
Write-Host "`n5. OBTENDO VEÍCULO PARA VENDA"
try {
    $vehiclesResponse = Invoke-WebRequest -Uri "https://backoffice-veiculos-api-production.up.railway.app/api/vehicles" -Method GET -Headers $headers
    $vehiclesData = $vehiclesResponse.Content | ConvertFrom-Json
    
    if ($vehiclesData.data.Count -gt 0) {
        $vehicleId = $vehiclesData.data[0]._id
        Write-Host "✅ Veículo encontrado: $vehicleId"
        Write-Host "Status do veículo: $($vehiclesData.data[0].status)"
        
        # 6. Criar venda
        Write-Host "`n6. CRIANDO VENDA"
        $saleData = @{
            vehicleId = $vehicleId
            buyer = @{
                name = "João Silva"
                email = "joao.silva@email.com"
                phone = "11999999999"
                document = "12345678900"
            }
            salePrice = 50000
            paymentMethod = "cash"
            notes = "Venda de teste via API"
        } | ConvertTo-Json -Depth 3
        
        Write-Host "Dados da venda: $saleData"
        
        try {
            $createSaleResponse = Invoke-WebRequest -Uri "https://backoffice-veiculos-api-production.up.railway.app/api/sales" -Method POST -Body $saleData -ContentType "application/json" -Headers $headers
            $createSaleResult = $createSaleResponse.Content | ConvertFrom-Json
            Write-Host "✅ VENDA CRIADA: $($createSaleResult.data._id)"
            $saleId = $createSaleResult.data._id
            
            # 7. Testar GET /sales/:id
            Write-Host "`n7. GET /sales/$saleId"
            try {
                $getSaleResponse = Invoke-WebRequest -Uri "https://backoffice-veiculos-api-production.up.railway.app/api/sales/$saleId" -Method GET -Headers $headers
                $getSaleData = $getSaleResponse.Content | ConvertFrom-Json
                Write-Host "✅ GET /sales/:id: Sucesso! Preço: R$ $($getSaleData.data.salePrice)"
            } catch {
                Write-Host "❌ ERRO GET /sales/:id: $($_.Exception.Message)"
            }
            
            # 8. Testar PUT /sales/:id
            Write-Host "`n8. PUT /sales/$saleId"
            $updateData = '{"status": "completed", "notes": "Venda finalizada"}'
            try {
                $updateSaleResponse = Invoke-WebRequest -Uri "https://backoffice-veiculos-api-production.up.railway.app/api/sales/$saleId" -Method PUT -Body $updateData -ContentType "application/json" -Headers $headers
                $updateSaleResult = $updateSaleResponse.Content | ConvertFrom-Json
                Write-Host "✅ PUT /sales/:id: Sucesso! Status: $($updateSaleResult.data.status)"
            } catch {
                Write-Host "❌ ERRO PUT /sales/:id: $($_.Exception.Message)"
            }
            
        } catch {
            Write-Host "❌ ERRO ao criar venda: $($_.Exception.Message)"
            if ($_.Exception.Response) {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorBody = $reader.ReadToEnd()
                Write-Host "Detalhes do erro: $errorBody"
            }
        }
    } else {
        Write-Host "❌ Nenhum veículo disponível"
    }
} catch {
    Write-Host "❌ ERRO ao obter veículos: $($_.Exception.Message)"
}

Write-Host "`n=== TESTE CONCLUÍDO ==="
