# Teste CRUD de Vendas em Produção

**URL Base:** `https://backoffice-veiculos-api-production.up.railway.app`

## 1. LOGIN - Obter Token JWT

```bash
curl -X POST 'https://backoffice-veiculos-api-production.up.railway.app/api/users/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@backoffice.com",
    "password": "Admin123!@#"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "68ed57a3572e134dd39350ce",
      "name": "Administrador",
      "email": "admin@backoffice.com",
      "role": "admin"
    }
  }
}
```

## 2. LISTAR VENDAS

```bash
curl -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/sales' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

## 3. CRIAR VENDA

```bash
curl -X POST 'https://backoffice-veiculos-api-production.up.railway.app/api/sales' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \
  -H 'Content-Type: application/json' \
  -d '{
    "vehicleId": "68ee5c09fd0539a2cf4e5f6b",
    "buyer": {
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "11999999999",
      "document": "12345678900"
    },
    "salePrice": 95000,
    "paymentMethod": "cash",
    "notes": "Venda de teste em produção",
    "commission": 0
  }'
```

## 4. BUSCAR VENDA POR ID

```bash
curl -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/sales/ID_DA_VENDA' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

## 5. ATUALIZAR VENDA

```bash
curl -X PUT 'https://backoffice-veiculos-api-production.up.railway.app/api/sales/ID_DA_VENDA' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "completed",
    "notes": "Venda finalizada com sucesso"
  }'
```

## 6. ESTATÍSTICAS DE VENDAS

```bash
curl -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/sales/stats' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

## 7. VENDAS DO VENDEDOR

```bash
curl -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/sales/my-sales' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

## 8. LISTAR VEÍCULOS DISPONÍVEIS

```bash
curl -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/vehicles?status=active' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

## Instruções de Uso

1. **Execute o comando de LOGIN primeiro**
2. **Copie o token retornado no campo `data.token`**
3. **Substitua `SEU_TOKEN_AQUI` pelo token obtido**
4. **Para criar uma venda, use um `vehicleId` válido da listagem de veículos**
5. **Execute os comandos em sequência para testar o CRUD completo**

## Exemplo de Venda Completa

```bash
# 1. Login
TOKEN=$(curl -s -X POST 'https://backoffice-veiculos-api-production.up.railway.app/api/users/login' \
  -H 'Content-Type: application/json' \
  -d '{"email": "admin@backoffice.com", "password": "Admin123!@#"}' | \
  jq -r '.data.token')

# 2. Listar veículos disponíveis
curl -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/vehicles?status=active&limit=1' \
  -H "Authorization: Bearer $TOKEN"

# 3. Criar venda (substitua o vehicleId pelo ID real)
curl -X POST 'https://backoffice-veiculos-api-production.up.railway.app/api/sales' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "vehicleId": "VEHICLE_ID_AQUI",
    "buyer": {
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "11999999999",
      "document": "12345678900"
    },
    "salePrice": 95000,
    "paymentMethod": "cash",
    "notes": "Venda de teste",
    "commission": 0
  }'
```

## Status da API

- ✅ **API funcionando em produção**
- ✅ **Autenticação JWT ativa**
- ✅ **CRUD de vendas operacional**
- ✅ **Documentação Swagger disponível em:** `/docs`
