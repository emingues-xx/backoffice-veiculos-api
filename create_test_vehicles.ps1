# Script para criar massa de teste de veículos via API de produção

# Obter token de autenticação
Write-Host "Obtendo token de autenticação..."
$loginBody = @{
    email = "admin@test.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "https://backoffice-veiculos-api-production.up.railway.app/api/users/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
$tokenData = $loginResponse.Content | ConvertFrom-Json
$token = $tokenData.data.token
Write-Host "Token obtido com sucesso!"

# Headers para as requisições
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Dados dos veículos (ajustados para o schema da API)
$vehicles = @(
    @{
        brand = "Toyota"
        vehicleModel = "Corolla Cross"
        year = 2023
        price = 145000
        mileage = 15000
        fuelType = "gasoline"
        color = "branco"
        transmission = "automatic"
        doors = 4
        category = "car"
        condition = "used"
        description = "Toyota Corolla Cross 2023, automático, completo, único dono"
        images = @("https://www.webmotors.com.br/carros/estoque/toyota/corolla-cross")
        location = @{
            city = "São Paulo"
            state = "SP"
            zipCode = "01310-100"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Honda"
        vehicleModel = "Civic"
        year = 2022
        price = 135000
        mileage = 25000
        fuelType = "gasoline"
        color = "prata"
        transmission = "automatic"
        doors = 4
        category = "car"
        condition = "used"
        description = "Honda Civic 2022, automático, completo, bem conservado"
        images = @("https://www.webmotors.com.br/carros/estoque/honda/civic")
        location = @{
            city = "Rio de Janeiro"
            state = "RJ"
            zipCode = "20000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Volkswagen"
        vehicleModel = "Golf"
        year = 2021
        price = 125000
        mileage = 35000
        fuelType = "gasoline"
        color = "azul"
        transmission = "manual"
        doors = 4
        category = "car"
        condition = "used"
        description = "Volkswagen Golf 2021, manual, completo, revisado"
        images = @("https://www.webmotors.com.br/carros/estoque/volkswagen/golf")
        location = @{
            city = "Belo Horizonte"
            state = "MG"
            zipCode = "30000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Ford"
        vehicleModel = "Focus"
        year = 2020
        price = 85000
        mileage = 45000
        fuelType = "gasoline"
        color = "preto"
        transmission = "automatic"
        doors = 4
        category = "car"
        condition = "used"
        description = "Ford Focus 2020, automático, completo, único dono"
        images = @("https://www.webmotors.com.br/carros/estoque/ford/focus")
        location = @{
            city = "Salvador"
            state = "BA"
            zipCode = "40000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Chevrolet"
        vehicleModel = "Onix"
        year = 2023
        price = 75000
        mileage = 10000
        fuelType = "gasoline"
        color = "vermelho"
        transmission = "automatic"
        doors = 4
        category = "car"
        condition = "used"
        description = "Chevrolet Onix 2023, automático, completo, seminovo"
        images = @("https://www.webmotors.com.br/carros/estoque/chevrolet/onix")
        location = @{
            city = "Brasília"
            state = "DF"
            zipCode = "70000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Fiat"
        vehicleModel = "Argo"
        year = 2022
        price = 65000
        mileage = 20000
        fuelType = "gasoline"
        color = "branco"
        transmission = "manual"
        doors = 4
        category = "car"
        condition = "used"
        description = "Fiat Argo 2022, manual, completo, bem conservado"
        images = @("https://www.webmotors.com.br/carros/estoque/fiat/argo")
        location = @{
            city = "Fortaleza"
            state = "CE"
            zipCode = "60000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Hyundai"
        vehicleModel = "HB20"
        year = 2021
        price = 70000
        mileage = 30000
        fuelType = "gasoline"
        color = "prata"
        transmission = "automatic"
        doors = 4
        category = "car"
        condition = "used"
        description = "Hyundai HB20 2021, automático, completo, revisado"
        images = @("https://www.webmotors.com.br/carros/estoque/hyundai/hb20")
        location = @{
            city = "Manaus"
            state = "AM"
            zipCode = "69000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Nissan"
        vehicleModel = "Versa"
        year = 2020
        price = 80000
        mileage = 40000
        fuelType = "gasoline"
        color = "azul"
        transmission = "automatic"
        doors = 4
        category = "car"
        condition = "used"
        description = "Nissan Versa 2020, automático, completo, único dono"
        images = @("https://www.webmotors.com.br/carros/estoque/nissan/versa")
        location = @{
            city = "Curitiba"
            state = "PR"
            zipCode = "80000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Renault"
        vehicleModel = "Logan"
        year = 2019
        price = 55000
        mileage = 50000
        fuelType = "gasoline"
        color = "preto"
        transmission = "manual"
        doors = 4
        category = "car"
        condition = "used"
        description = "Renault Logan 2019, manual, completo, bem conservado"
        images = @("https://www.webmotors.com.br/carros/estoque/renault/logan")
        location = @{
            city = "Recife"
            state = "PE"
            zipCode = "50000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Peugeot"
        vehicleModel = "208"
        year = 2022
        price = 75000
        mileage = 18000
        fuelType = "gasoline"
        color = "vermelho"
        transmission = "automatic"
        doors = 4
        category = "car"
        condition = "used"
        description = "Peugeot 208 2022, automático, completo, seminovo"
        images = @("https://www.webmotors.com.br/carros/estoque/peugeot/208")
        location = @{
            city = "Porto Alegre"
            state = "RS"
            zipCode = "90000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Honda"
        vehicleModel = "CB 600F"
        year = 2021
        price = 35000
        mileage = 15000
        fuelType = "gasoline"
        color = "vermelho"
        transmission = "manual"
        doors = 0
        category = "motorcycle"
        condition = "used"
        description = "Honda CB 600F 2021, manual, completa, bem conservada"
        images = @("https://www.webmotors.com.br/motos/estoque/honda/cb-600f")
        location = @{
            city = "São Paulo"
            state = "SP"
            zipCode = "01310-100"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Yamaha"
        vehicleModel = "MT-07"
        year = 2022
        price = 45000
        mileage = 8000
        fuelType = "gasoline"
        color = "azul"
        transmission = "manual"
        doors = 0
        category = "motorcycle"
        condition = "used"
        description = "Yamaha MT-07 2022, manual, completa, seminova"
        images = @("https://www.webmotors.com.br/motos/estoque/yamaha/mt-07")
        location = @{
            city = "Rio de Janeiro"
            state = "RJ"
            zipCode = "20000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Kawasaki"
        vehicleModel = "Ninja 650"
        year = 2020
        price = 40000
        mileage = 20000
        fuelType = "gasoline"
        color = "verde"
        transmission = "manual"
        doors = 0
        category = "motorcycle"
        condition = "used"
        description = "Kawasaki Ninja 650 2020, manual, completa, revisada"
        images = @("https://www.webmotors.com.br/motos/estoque/kawasaki/ninja-650")
        location = @{
            city = "Belo Horizonte"
            state = "MG"
            zipCode = "30000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Volkswagen"
        vehicleModel = "Delivery"
        year = 2021
        price = 95000
        mileage = 25000
        fuelType = "diesel"
        color = "branco"
        transmission = "manual"
        doors = 2
        category = "truck"
        condition = "used"
        description = "Volkswagen Delivery 2021, manual, diesel, bem conservado"
        images = @("https://www.webmotors.com.br/caminhoes/estoque/volkswagen/delivery")
        location = @{
            city = "Salvador"
            state = "BA"
            zipCode = "40000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Mercedes-Benz"
        vehicleModel = "Sprinter"
        year = 2022
        price = 180000
        mileage = 12000
        fuelType = "diesel"
        color = "branco"
        transmission = "automatic"
        doors = 2
        category = "truck"
        condition = "used"
        description = "Mercedes-Benz Sprinter 2022, automático, diesel, seminovo"
        images = @("https://www.webmotors.com.br/caminhoes/estoque/mercedes-benz/sprinter")
        location = @{
            city = "Brasília"
            state = "DF"
            zipCode = "70000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Toyota"
        vehicleModel = "Hilux"
        year = 2023
        price = 220000
        mileage = 5000
        fuelType = "diesel"
        color = "prata"
        transmission = "automatic"
        doors = 4
        category = "truck"
        condition = "used"
        description = "Toyota Hilux 2023, automático, diesel, seminova"
        images = @("https://www.webmotors.com.br/caminhoes/estoque/toyota/hilux")
        location = @{
            city = "Fortaleza"
            state = "CE"
            zipCode = "60000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Ford"
        vehicleModel = "Ranger"
        year = 2022
        price = 200000
        mileage = 15000
        fuelType = "diesel"
        color = "azul"
        transmission = "automatic"
        doors = 4
        category = "truck"
        condition = "used"
        description = "Ford Ranger 2022, automático, diesel, bem conservada"
        images = @("https://www.webmotors.com.br/caminhoes/estoque/ford/ranger")
        location = @{
            city = "Manaus"
            state = "AM"
            zipCode = "69000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Chevrolet"
        vehicleModel = "S10"
        year = 2021
        price = 180000
        mileage = 20000
        fuelType = "diesel"
        color = "preto"
        transmission = "manual"
        doors = 4
        category = "truck"
        condition = "used"
        description = "Chevrolet S10 2021, manual, diesel, revisada"
        images = @("https://www.webmotors.com.br/caminhoes/estoque/chevrolet/s10")
        location = @{
            city = "Curitiba"
            state = "PR"
            zipCode = "80000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Volkswagen"
        vehicleModel = "Amarok"
        year = 2023
        price = 250000
        mileage = 8000
        fuelType = "diesel"
        color = "branco"
        transmission = "automatic"
        doors = 4
        category = "truck"
        condition = "used"
        description = "Volkswagen Amarok 2023, automático, diesel, seminova"
        images = @("https://www.webmotors.com.br/caminhoes/estoque/volkswagen/amarok")
        location = @{
            city = "Recife"
            state = "PE"
            zipCode = "50000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    },
    @{
        brand = "Mercedes-Benz"
        vehicleModel = "OF-1722"
        year = 2020
        price = 350000
        mileage = 30000
        fuelType = "diesel"
        color = "azul"
        transmission = "manual"
        doors = 2
        category = "van"
        condition = "used"
        description = "Mercedes-Benz OF-1722 2020, manual, diesel, revisado"
        images = @("https://www.webmotors.com.br/onibus/estoque/mercedes-benz/of-1722")
        location = @{
            city = "Porto Alegre"
            state = "RS"
            zipCode = "90000-000"
        }
        seller = @{
            id = "68d1d34f2dd6f78e64b71fff"
            name = "Admin User"
            phone = "(11) 99999-9999"
            email = "admin@test.com"
        }
        isFeatured = $false
    }
)

# Criar veículos
Write-Host "Criando $($vehicles.Count) veículos..."
$successCount = 0
$errorCount = 0

for ($i = 0; $i -lt $vehicles.Count; $i++) {
    try {
        $vehicle = $vehicles[$i]
        $vehicleJson = $vehicle | ConvertTo-Json -Depth 3
        
        Write-Host "Criando veículo $($i + 1)/$($vehicles.Count): $($vehicle.brand) $($vehicle.vehicleModel)..."
        
        $response = Invoke-WebRequest -Uri "https://backoffice-veiculos-api-production.up.railway.app/api/vehicles" -Method POST -Body $vehicleJson -Headers $headers -UseBasicParsing
        
        if ($response.StatusCode -eq 201) {
            $successCount++
            Write-Host "✅ Veículo $($i + 1) criado com sucesso!" -ForegroundColor Green
        } else {
            $errorCount++
            Write-Host "❌ Erro ao criar veículo $($i + 1): Status $($response.StatusCode)" -ForegroundColor Red
        }
    }
    catch {
        $errorCount++
        Write-Host "❌ Erro ao criar veículo $($i + 1): $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Pequena pausa entre requisições
    Start-Sleep -Milliseconds 500
}

Write-Host "`n📊 Resumo da criação de veículos:"
Write-Host "✅ Sucessos: $successCount" -ForegroundColor Green
Write-Host "❌ Erros: $errorCount" -ForegroundColor Red
Write-Host "📈 Total: $($vehicles.Count)"

# Verificar se os veículos foram criados
Write-Host "`n🔍 Verificando veículos criados..."
try {
    $listResponse = Invoke-WebRequest -Uri "https://backoffice-veiculos-api-production.up.railway.app/api/vehicles" -Headers $headers -UseBasicParsing
    $listData = $listResponse.Content | ConvertFrom-Json
    Write-Host "📋 Total de veículos na API: $($listData.data.vehicles.Count)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Erro ao verificar lista de veículos: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Script concluído!"
