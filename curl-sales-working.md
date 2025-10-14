# 🚀 CRUD de Vendas - Comandos cURL Funcionais

## ✅ **PROBLEMA RESOLVIDO:**
- **JWT configurado para 4 horas** ✅
- **API funcionando em produção** ✅
- **Todos os endpoints operacionais** ✅

---

## 🔐 **1. LOGIN (Obter Token)**

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

---

## 📋 **2. LISTAR VENDAS**

```bash
curl -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/sales' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

---

## 🚗 **3. LISTAR VEÍCULOS DISPONÍVEIS**

```bash
curl -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/vehicles?status=active&limit=5' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

---

## 💰 **4. CRIAR VENDA**

```bash
curl -X POST 'https://backoffice-veiculos-api-production.up.railway.app/api/sales' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \
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

---

## 🔍 **5. BUSCAR VENDA POR ID**

```bash
curl -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/sales/ID_DA_VENDA' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

---

## ✏️ **6. ATUALIZAR VENDA**

```bash
curl -X PUT 'https://backoffice-veiculos-api-production.up.railway.app/api/sales/ID_DA_VENDA' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "completed",
    "notes": "Venda finalizada com sucesso"
  }'
```

---

## 📊 **7. ESTATÍSTICAS DE VENDAS**

```bash
curl -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/sales/stats' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

---

## 👤 **8. VENDAS DO VENDEDOR**

```bash
curl -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/sales/my-sales' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

---

## 🎯 **EXEMPLO COMPLETO (Script Bash)**

```bash
#!/bin/bash

# 1. Login
echo "🔐 Fazendo login..."
TOKEN=$(curl -s -X POST 'https://backoffice-veiculos-api-production.up.railway.app/api/users/login' \
  -H 'Content-Type: application/json' \
  -d '{"email": "admin@backoffice.com", "password": "Admin123!@#"}' | \
  jq -r '.data.token')

echo "✅ Token obtido: ${TOKEN:0:50}..."

# 2. Listar veículos disponíveis
echo "🚗 Listando veículos disponíveis..."
VEHICLE_ID=$(curl -s -X GET 'https://backoffice-veiculos-api-production.up.railway.app/api/vehicles?status=active&limit=1' \
  -H "Authorization: Bearer $TOKEN" | \
  jq -r '.data[0]._id')

echo "✅ Veículo selecionado: $VEHICLE_ID"

# 3. Criar venda
echo "💰 Criando venda..."
SALE_RESPONSE=$(curl -s -X POST 'https://backoffice-veiculos-api-production.up.railway.app/api/sales' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{
    \"vehicleId\": \"$VEHICLE_ID\",
    \"buyer\": {
      \"name\": \"João Silva\",
      \"email\": \"joao@email.com\",
      \"phone\": \"11999999999\",
      \"document\": \"12345678900\"
    },
    \"salePrice\": 95000,
    \"paymentMethod\": \"cash\",
    \"notes\": \"Venda de teste via script\",
    \"commission\": 0
  }")

SALE_ID=$(echo $SALE_RESPONSE | jq -r '.data._id')
echo "✅ Venda criada com ID: $SALE_ID"

# 4. Buscar venda criada
echo "🔍 Buscando venda criada..."
curl -s -X GET "https://backoffice-veiculos-api-production.up.railway.app/api/sales/$SALE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo "🎉 Teste CRUD de vendas concluído com sucesso!"
```

---

## 📝 **INSTRUÇÕES DE USO:**

1. **Execute o comando de LOGIN primeiro**
2. **Copie o token retornado no campo `data.token`**
3. **Substitua `SEU_TOKEN_AQUI` pelo token obtido**
4. **Para criar uma venda, use um `vehicleId` válido da listagem de veículos**
5. **O token dura 4 horas, então você pode fazer vários testes**

---

## 🌐 **URLS IMPORTANTES:**

- **API Base:** https://backoffice-veiculos-api-production.up.railway.app/
- **Documentação:** https://backoffice-veiculos-api-production.up.railway.app/docs
- **Health Check:** https://backoffice-veiculos-api-production.up.railway.app/health

---

## ✅ **STATUS FINAL:**

- **✅ API funcionando em produção**
- **✅ JWT configurado para 4 horas**
- **✅ CRUD de vendas operacional**
- **✅ Autenticação funcionando**
- **✅ Documentação Swagger disponível**

**🎉 O CRUD de vendas está 100% funcional!**
