# API de Métricas - Exemplos de cURL

Este documento contém exemplos práticos de como usar as APIs de métricas do sistema de backoffice de veículos.

## Autenticação

Todas as APIs de métricas requerem autenticação via JWT token. Primeiro, faça login para obter o token:

```bash
# Login para obter token
curl -X POST http://localhost:3016/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@backoffice.com",
    "password": "Admin123!@#"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "68ed57a3572e134dd39350ce",
      "email": "admin@backoffice.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login realizado com sucesso"
}
```

## APIs de Métricas

### 1. Total Revenue (Receita Total)

Retorna a receita total no período especificado.

```bash
# Receita total com datas específicas
curl -X GET "http://localhost:3016/api/metrics/revenue?startDate=2025-10-14&endDate=2025-10-15" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 2426000,
    "period": {
      "startDate": "2025-10-14",
      "endDate": "2025-10-15"
    }
  },
  "message": "Total revenue retrieved successfully"
}
```

### 2. Sales by Day (Vendas por Dia)

Retorna as vendas agrupadas por dia no período especificado.

```bash
# Vendas por dia com datas específicas
curl -X GET "http://localhost:3016/api/metrics/sales-by-day?startDate=2025-10-14&endDate=2025-10-15" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "salesByDay": [
      {
        "date": "2025-10-14",
        "count": 38,
        "revenue": 2426000
      }
    ],
    "period": {
      "startDate": "2025-10-14",
      "endDate": "2025-10-15"
    }
  },
  "message": "Sales by day retrieved successfully"
}
```

### 3. Top Sellers (Melhores Vendedores)

Retorna os vendedores com melhor performance no período especificado.

```bash
# Top vendedores com datas específicas
curl -X GET "http://localhost:3016/api/metrics/top-sellers?startDate=2025-10-14&endDate=2025-10-15" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "topSellers": [
      {
        "sellerId": "68ed57a3572e134dd39350ce",
        "sellerName": "Administrador",
        "salesCount": 38,
        "revenue": 2426000,
        "commission": 121300
      }
    ],
    "period": {
      "startDate": "2025-10-14",
      "endDate": "2025-10-15"
    }
  },
  "message": "Top sellers retrieved successfully"
}
```

### 4. Total Sales (Total de Vendas)

Retorna o total de vendas e comparação com período anterior.

```bash
# Total de vendas com datas específicas
curl -X GET "http://localhost:3016/api/metrics/total-sales?startDate=2025-10-14&endDate=2025-10-15" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalSales": 1,
    "periodComparison": {
      "salesGrowth": 0,
      "previousPeriodSales": 0
    },
    "period": {
      "startDate": "2025-10-14",
      "endDate": "2025-10-15"
    }
  },
  "message": "Total sales retrieved successfully"
}
```

## Parâmetros de Query Disponíveis

Todas as APIs de métricas suportam os seguintes parâmetros de query:

| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| `startDate` | string (ISO 8601) | Não | Data de início do período | `2025-10-14` |
| `endDate` | string (ISO 8601) | Não | Data de fim do período | `2025-10-15` |
| `period` | string | Não | Período predefinido | `daily`, `weekly`, `monthly`, `yearly` |
| `sellerId` | string (ObjectId) | Não | ID do vendedor específico | `68ed57a3572e134dd39350ce` |

### Exemplos de Uso dos Parâmetros

```bash
# Usando período predefinido
curl -X GET "http://localhost:3016/api/metrics/revenue?period=monthly" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Filtrando por vendedor específico
curl -X GET "http://localhost:3016/api/metrics/top-sellers?sellerId=68ed57a3572e134dd39350ce" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Combinando parâmetros
curl -X GET "http://localhost:3016/api/metrics/sales-by-day?startDate=2025-10-01&endDate=2025-10-31&sellerId=68ed57a3572e134dd39350ce" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## Scripts de Teste

### Script Bash

```bash
#!/bin/bash

# Configurações
BASE_URL="http://localhost:3016"
EMAIL="admin@backoffice.com"
PASSWORD="Admin123!@#"

# Login e obter token
echo "Fazendo login..."
TOKEN=$(curl -s -X POST "$BASE_URL/api/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | \
  jq -r '.data.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "Erro: Falha no login"
  exit 1
fi

echo "Token obtido: ${TOKEN:0:20}..."

# Testar APIs de métricas
echo -e "\n=== Testando APIs de Métricas ==="

echo "1. Testando Total Revenue..."
curl -s -X GET "$BASE_URL/api/metrics/revenue?startDate=2025-10-14&endDate=2025-10-15" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n2. Testando Sales by Day..."
curl -s -X GET "$BASE_URL/api/metrics/sales-by-day?startDate=2025-10-14&endDate=2025-10-15" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n3. Testando Top Sellers..."
curl -s -X GET "$BASE_URL/api/metrics/top-sellers?startDate=2025-10-14&endDate=2025-10-15" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n4. Testando Total Sales..."
curl -s -X GET "$BASE_URL/api/metrics/total-sales?startDate=2025-10-14&endDate=2025-10-15" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### Script PowerShell

```powershell
# Configurações
$baseUrl = "http://localhost:3016"
$email = "admin@backoffice.com"
$password = "Admin123!@#"

# Login e obter token
Write-Host "Fazendo login..." -ForegroundColor Yellow
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/users/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token

if (-not $token) {
    Write-Host "Erro: Falha no login" -ForegroundColor Red
    exit 1
}

Write-Host "Token obtido: $($token.Substring(0, 20))..." -ForegroundColor Green

# Headers para autenticação
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Testar APIs de métricas
Write-Host "`n=== Testando APIs de Métricas ===" -ForegroundColor Cyan

Write-Host "1. Testando Total Revenue..." -ForegroundColor Yellow
$revenueResponse = Invoke-RestMethod -Uri "$baseUrl/api/metrics/revenue?startDate=2025-10-14&endDate=2025-10-15" -Method GET -Headers $headers
Write-Host "Total Revenue: R$ $($revenueResponse.data.totalRevenue)" -ForegroundColor Green

Write-Host "`n2. Testando Sales by Day..." -ForegroundColor Yellow
$salesByDayResponse = Invoke-RestMethod -Uri "$baseUrl/api/metrics/sales-by-day?startDate=2025-10-14&endDate=2025-10-15" -Method GET -Headers $headers
Write-Host "Sales by Day Count: $($salesByDayResponse.data.salesByDay.Count)" -ForegroundColor Green

Write-Host "`n3. Testando Top Sellers..." -ForegroundColor Yellow
$topSellersResponse = Invoke-RestMethod -Uri "$baseUrl/api/metrics/top-sellers?startDate=2025-10-14&endDate=2025-10-15" -Method GET -Headers $headers
Write-Host "Top Sellers Count: $($topSellersResponse.data.topSellers.Count)" -ForegroundColor Green

Write-Host "`n4. Testando Total Sales..." -ForegroundColor Yellow
$totalSalesResponse = Invoke-RestMethod -Uri "$baseUrl/api/metrics/total-sales?startDate=2025-10-14&endDate=2025-10-15" -Method GET -Headers $headers
Write-Host "Total Sales: $($totalSalesResponse.data.totalSales)" -ForegroundColor Green
```

## Códigos de Erro

| Código | Descrição | Solução |
|--------|-----------|---------|
| 400 | Bad Request | Verificar parâmetros de query |
| 401 | Unauthorized | Verificar token de autenticação |
| 403 | Forbidden | Usuário não tem permissão |
| 404 | Not Found | Endpoint não encontrado |
| 500 | Internal Server Error | Erro interno do servidor |

## Exemplos de Respostas de Erro

### Erro de Autenticação (401)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token de autenticação inválido ou expirado"
  }
}
```

### Erro de Validação (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "endDate deve ser maior que startDate"
  }
}
```

## Links Úteis

- [Documentação da API (Swagger)](http://localhost:3016/docs)
- [Health Check](http://localhost:3016/health)
- [Métricas Prometheus](http://localhost:3016/metrics)

## Notas Importantes

1. **Datas**: Use o formato ISO 8601 (YYYY-MM-DD) para as datas
2. **Período Padrão**: Se não especificar datas, será usado o período dos últimos 30 dias
3. **Cache**: As respostas são cacheadas por 5 minutos para melhor performance
4. **Rate Limiting**: Máximo de 1000 requisições por hora por usuário
5. **Timezone**: Todas as datas são processadas em UTC