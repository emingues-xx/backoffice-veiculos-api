# Teste CRUD de Vendas em Produção
# URL: https://backoffice-veiculos-api-production.up.railway.app

Write-Host "=== TESTE CRUD VENDAS EM PRODUÇÃO ===" -ForegroundColor Green
Write-Host "URL: https://backoffice-veiculos-api-production.up.railway.app" -ForegroundColor Yellow

# 1. LOGIN - Obter token JWT
Write-Host "`n1. LOGIN (obter token):" -ForegroundColor Cyan
Write-Host "curl -X POST 'https://backoffice-veiculos-api-production.up.railway.app/api/users/login' \" -ForegroundColor White
Write-Host "  -H 'Content-Type: application/json' \" -ForegroundColor White
Write-Host "  -d '{\"email\": \"admin@backoffice.com\", \"password\": \"Admin123!@#\"}'" -ForegroundColor White

# 2. LISTAR VENDAS
Write-Host "`n2. LISTAR VENDAS:" -ForegroundColor Cyan
Write-Host "curl -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/sales' \" -ForegroundColor White
Write-Host "  -H 'Authorization: Bearer SEU_TOKEN_AQUI'" -ForegroundColor White

# 3. CRIAR VENDA
Write-Host "`n3. CRIAR VENDA:" -ForegroundColor Cyan
Write-Host "curl -X POST 'https://backoffice-veiculos-api-production.up.railway.app/api/sales' \" -ForegroundColor White
Write-Host "  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \" -ForegroundColor White
Write-Host "  -H 'Content-Type: application/json' \" -ForegroundColor White
Write-Host "  -d '{ \" -ForegroundColor White
Write-Host "    \"vehicleId\": \"68ee5c09fd0539a2cf4e5f6b\", \" -ForegroundColor White
Write-Host "    \"buyer\": { \" -ForegroundColor White
Write-Host "      \"name\": \"João Silva\", \" -ForegroundColor White
Write-Host "      \"email\": \"joao@email.com\", \" -ForegroundColor White
Write-Host "      \"phone\": \"11999999999\", \" -ForegroundColor White
Write-Host "      \"document\": \"12345678900\" \" -ForegroundColor White
Write-Host "    }, \" -ForegroundColor White
Write-Host "    \"salePrice\": 95000, \" -ForegroundColor White
Write-Host "    \"paymentMethod\": \"cash\", \" -ForegroundColor White
Write-Host "    \"notes\": \"Venda de teste em produção\", \" -ForegroundColor White
Write-Host "    \"commission\": 0 \" -ForegroundColor White
Write-Host "  }'" -ForegroundColor White

# 4. BUSCAR VENDA POR ID
Write-Host "`n4. BUSCAR VENDA POR ID:" -ForegroundColor Cyan
Write-Host "curl -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/sales/ID_DA_VENDA' \" -ForegroundColor White
Write-Host "  -H 'Authorization: Bearer SEU_TOKEN_AQUI'" -ForegroundColor White

# 5. ATUALIZAR VENDA
Write-Host "`n5. ATUALIZAR VENDA:" -ForegroundColor Cyan
Write-Host "curl -X PUT 'https://backoffice-veiculos-api-production.up.railway.app/api/sales/ID_DA_VENDA' \" -ForegroundColor White
Write-Host "  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \" -ForegroundColor White
Write-Host "  -H 'Content-Type: application/json' \" -ForegroundColor White
Write-Host "  -d '{ \" -ForegroundColor White
Write-Host "    \"status\": \"completed\", \" -ForegroundColor White
Write-Host "    \"notes\": \"Venda finalizada com sucesso\" \" -ForegroundColor White
Write-Host "  }'" -ForegroundColor White

# 6. ESTATÍSTICAS DE VENDAS
Write-Host "`n6. ESTATÍSTICAS DE VENDAS:" -ForegroundColor Cyan
Write-Host "curl -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/sales/stats' \" -ForegroundColor White
Write-Host "  -H 'Authorization: Bearer SEU_TOKEN_AQUI'" -ForegroundColor White

# 7. VENDAS DO VENDEDOR
Write-Host "`n7. VENDAS DO VENDEDOR:" -ForegroundColor Cyan
Write-Host "curl -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/sales/my-sales' \" -ForegroundColor White
Write-Host "  -H 'Authorization: Bearer SEU_TOKEN_AQUI'" -ForegroundColor White

Write-Host "`n=== INSTRUÇÕES ===" -ForegroundColor Green
Write-Host "1. Execute o comando de LOGIN primeiro" -ForegroundColor Yellow
Write-Host "2. Copie o token retornado" -ForegroundColor Yellow
Write-Host "3. Substitua 'SEU_TOKEN_AQUI' pelo token obtido" -ForegroundColor Yellow
Write-Host "4. Execute os outros comandos em sequência" -ForegroundColor Yellow
Write-Host "5. Para criar uma venda, use um vehicleId válido da listagem de veículos" -ForegroundColor Yellow
