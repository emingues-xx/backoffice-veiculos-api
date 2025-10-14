# Backoffice Veículos API - Exemplos de cURL

Este documento contém exemplos práticos de como usar a API Backoffice Veículos através de comandos cURL.

## 🔑 Autenticação

### Login
```bash
curl -X POST "http://localhost:3016/api/users/login" \
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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "68ed57a3572e134dd39350ce",
      "name": "Administrador",
      "email": "admin@backoffice.com",
      "role": "admin"
    }
  },
  "message": "Login successful"
}
```

## 🚗 Veículos

### Listar Veículos
```bash
curl -X GET "http://localhost:3016/api/vehicles" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Listar Veículos com Filtros
```bash
curl -X GET "http://localhost:3016/api/vehicles?brand=Toyota&year=2023&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Buscar Veículo por ID
```bash
curl -X GET "http://localhost:3016/api/vehicles/68ed5b50572e134dd39350e4" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Criar Veículo
```bash
curl -X POST "http://localhost:3016/api/vehicles" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Toyota",
    "vehicleModel": "Corolla",
    "year": 2023,
    "mileage": 15000,
    "price": 95000,
    "fuelType": "gasoline",
    "transmission": "automatic",
    "color": "Branco",
    "doors": 4,
    "category": "car",
    "condition": "used",
    "description": "Veiculo em excelente estado, unico dono, revisoes em dia.",
    "images": ["https://example.com/corolla1.jpg"],
    "features": ["Ar condicionado", "Direcao eletrica"],
    "location": {
      "city": "Sao Paulo",
      "state": "SP",
      "zipCode": "01234-567"
    },
    "seller": {
      "id": "68ed57a3572e134dd39350ce",
      "name": "Concessionaria Toyota",
      "phone": "(11) 9999-9999",
      "email": "vendas@toyota.com"
    },
    "status": "active"
  }'
```

### Atualizar Veículo
```bash
curl -X PUT "http://localhost:3016/api/vehicles/68ed5b50572e134dd39350e4" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 90000,
    "description": "Veiculo atualizado com novo preco"
  }'
```

### Deletar Veículo
```bash
curl -X DELETE "http://localhost:3016/api/vehicles/68ed5b50572e134dd39350e4" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Estatísticas de Veículos
```bash
curl -X GET "http://localhost:3016/api/vehicles/stats" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 💰 Vendas

### Listar Vendas
```bash
curl -X GET "http://localhost:3016/api/sales" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Listar Vendas com Filtros
```bash
curl -X GET "http://localhost:3016/api/sales?status=completed&paymentMethod=cash&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Buscar Venda por ID
```bash
curl -X GET "http://localhost:3016/api/sales/68ee4b984740ba79c6d9df9c" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Criar Venda
```bash
curl -X POST "http://localhost:3016/api/sales" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "68ed79c17fb1e4518e0098b6",
    "buyer": {
      "name": "Joao Silva",
      "email": "joao@email.com",
      "phone": "11999999999",
      "document": "12345678900"
    },
    "salePrice": 50000,
    "commission": 0,
    "paymentMethod": "cash",
    "notes": "Cliente interessado em financiamento"
  }'
```

### Atualizar Venda
```bash
curl -X PUT "http://localhost:3016/api/sales/68ee4b984740ba79c6d9df9c" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "notes": "Venda finalizada com sucesso"
  }'
```

### Deletar Venda (Admin)
```bash
curl -X DELETE "http://localhost:3016/api/sales/68ee4b984740ba79c6d9df9c" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Estatísticas de Vendas
```bash
curl -X GET "http://localhost:3016/api/sales/stats" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Vendas do Vendedor
```bash
curl -X GET "http://localhost:3016/api/sales/my-sales" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 👥 Usuários

### Registrar Usuário
```bash
curl -X POST "http://localhost:3016/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Usuario",
    "email": "novo@email.com",
    "password": "MinhaSenh@123",
    "role": "seller"
  }'
```

### Perfil do Usuário
```bash
curl -X GET "http://localhost:3016/api/users/profile" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Atualizar Perfil
```bash
curl -X PUT "http://localhost:3016/api/users/profile" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nome Atualizado",
    "phone": "(11) 88888-8888"
  }'
```

### Listar Usuários (Admin)
```bash
curl -X GET "http://localhost:3016/api/users" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Buscar Usuário por ID (Admin)
```bash
curl -X GET "http://localhost:3016/api/users/68ed57a3572e134dd39350ce" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Atualizar Usuário (Admin)
```bash
curl -X PUT "http://localhost:3016/api/users/68ed57a3572e134dd39350ce" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "manager"
  }'
```

### Deletar Usuário (Admin)
```bash
curl -X DELETE "http://localhost:3016/api/users/68ed57a3572e134dd39350ce" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Utilitários

### Health Check
```bash
curl -X GET "http://localhost:3016/health"
```

### Documentação Swagger
```bash
curl -X GET "http://localhost:3016/docs"
```

## 📝 Notas Importantes

### Headers Obrigatórios
- **Authorization**: `Bearer YOUR_TOKEN_HERE` (para endpoints autenticados)
- **Content-Type**: `application/json` (para POST/PUT)

### Token JWT
- O token JWT expira em **4 horas**
- Após a expiração, faça login novamente para obter um novo token

### Encoding de Dados
- Use apenas caracteres **sem acentos** para evitar problemas de encoding
- ✅ Correto: "Veiculo em excelente estado, unico dono, revisoes em dia"
- ❌ Evitar: "Veículo em excelente estado, único dono, revisões em dia"

### Filtros Disponíveis

#### Veículos
- `brand` - Marca do veículo
- `vehicleModel` - Modelo do veículo
- `year` - Ano de fabricação
- `priceMin` / `priceMax` - Faixa de preço
- `category` - Categoria (car, motorcycle, truck, van)
- `fuelType` - Tipo de combustível
- `transmission` - Transmissão (manual, automatic)
- `condition` - Condição (new, used)
- `page` - Página (padrão: 1)
- `limit` - Itens por página (padrão: 10)

#### Vendas
- `status` - Status da venda (pending, completed, cancelled)
- `paymentMethod` - Método de pagamento (cash, financing, trade-in)
- `dateFrom` / `dateTo` - Período da venda
- `sellerId` - ID do vendedor
- `page` - Página (padrão: 1)
- `limit` - Itens por página (padrão: 10)

### Códigos de Resposta
- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Não autenticado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## 🌐 URLs de Produção

- **API**: https://backoffice-veiculos-api-production.up.railway.app/
- **Documentação**: https://backoffice-veiculos-api-production.up.railway.app/docs
- **Health Check**: https://backoffice-veiculos-api-production.up.railway.app/health

Para usar em produção, substitua `http://localhost:3016` pelas URLs acima.
