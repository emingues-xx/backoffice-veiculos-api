# 📋 Documentação - Criação de Veículo

## 🚗 Endpoint
```
POST /api/vehicles
```

## 🔐 Autenticação
- **Requerida:** Sim
- **Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Permissões:** `admin`, `manager`, `seller`

## 📝 Propriedades Obrigatórias

### 1. **Informações Básicas**
| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `brand` | `string` | 2-50 caracteres | Marca do veículo (ex: "Toyota", "Honda") |
| `vehicleModel` | `string` | 2-50 caracteres | Modelo do veículo (ex: "Corolla", "Civic") |
| `year` | `number` | 1900 até ano atual + 1 | Ano de fabricação |
| `mileage` | `number` | ≥ 0 | Quilometragem em km |
| `price` | `number` | ≥ 0 | Preço em reais (R$) |

### 2. **Especificações Técnicas**
| Campo | Tipo | Valores Aceitos | Descrição |
|-------|------|-----------------|-----------|
| `fuelType` | `string` | `gasoline`, `ethanol`, `diesel`, `electric`, `hybrid` | Tipo de combustível |
| `transmission` | `string` | `manual`, `automatic` | Tipo de transmissão |
| `color` | `string` | 2-30 caracteres | Cor do veículo |
| `doors` | `number` | 2-6 | Número de portas |
| `category` | `string` | `car`, `motorcycle`, `truck`, `van` | Categoria do veículo |
| `condition` | `string` | `new`, `used` | Condição do veículo |

### 3. **Descrição e Mídia**
| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `description` | `string` | 10-2000 caracteres | Descrição detalhada do veículo |
| `images` | `array` | 1-10 URLs válidas | Array de URLs das imagens |

### 4. **Localização**
| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `location.city` | `string` | 2-50 caracteres | Cidade |
| `location.state` | `string` | 2-50 caracteres | Estado |
| `location.zipCode` | `string` | Formato: `12345-678` ou `12345678` | CEP |

### 5. **Vendedor**
| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `seller.id` | `string` | Obrigatório | ID do vendedor |
| `seller.name` | `string` | 2-50 caracteres | Nome do vendedor |
| `seller.phone` | `string` | Formato: `(11) 99999-9999` | Telefone do vendedor |
| `seller.email` | `string` | Email válido | Email do vendedor |

## 📝 Propriedades Opcionais

| Campo | Tipo | Validação | Descrição | Padrão |
|-------|------|-----------|-----------|--------|
| `features` | `array` | Máximo 20 itens, 100 chars cada | Array de características especiais | `[]` |
| `isFeatured` | `boolean` | - | Se o veículo é destaque | `false` |

## 📋 Exemplo de Request

```json
{
  "brand": "Toyota",
  "vehicleModel": "Corolla",
  "year": 2023,
  "mileage": 15000,
  "price": 85000,
  "fuelType": "gasoline",
  "transmission": "automatic",
  "color": "Branco",
  "doors": 4,
  "category": "car",
  "condition": "used",
  "description": "Veículo em excelente estado, único dono, revisões em dia. Equipado com ar condicionado, direção hidráulica, vidros elétricos e trava elétrica.",
  "images": [
    "https://example.com/images/corolla1.jpg",
    "https://example.com/images/corolla2.jpg",
    "https://example.com/images/corolla3.jpg"
  ],
  "features": [
    "Ar condicionado",
    "Direção hidráulica",
    "Vidros elétricos",
    "Trava elétrica",
    "Airbag",
    "ABS"
  ],
  "location": {
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  },
  "seller": {
    "id": "68ed57a3572e134dd39350ce",
    "name": "Concessionária Toyota",
    "phone": "(11) 99999-9999",
    "email": "vendas@toyota.com"
  },
  "isFeatured": false
}
```

## 🔧 Exemplo de cURL

```bash
curl -X POST "https://backoffice-veiculos-api-production.up.railway.app/api/vehicles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT_TOKEN_AQUI" \
  -d '{
    "brand": "Toyota",
    "vehicleModel": "Corolla",
    "year": 2023,
    "mileage": 15000,
    "price": 85000,
    "fuelType": "gasoline",
    "transmission": "automatic",
    "color": "Branco",
    "doors": 4,
    "category": "car",
    "condition": "used",
    "description": "Veículo em excelente estado, único dono, revisões em dia.",
    "images": [
      "https://example.com/images/corolla1.jpg",
      "https://example.com/images/corolla2.jpg"
    ],
    "features": [
      "Ar condicionado",
      "Direção hidráulica",
      "Vidros elétricos"
    ],
    "location": {
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567"
    },
    "seller": {
      "id": "68ed57a3572e134dd39350ce",
      "name": "Concessionária Toyota",
      "phone": "(11) 99999-9999",
      "email": "vendas@toyota.com"
    },
    "isFeatured": false
  }'
```

## 📤 Exemplo de Response (Sucesso)

```json
{
  "success": true,
  "data": {
    "_id": "68ed57a3572e134dd39350cf",
    "brand": "Toyota",
    "vehicleModel": "Corolla",
    "year": 2023,
    "mileage": 15000,
    "price": 85000,
    "fuelType": "gasoline",
    "transmission": "automatic",
    "color": "Branco",
    "doors": 4,
    "category": "car",
    "condition": "used",
    "description": "Veículo em excelente estado, único dono, revisões em dia.",
    "images": [
      "https://example.com/images/corolla1.jpg",
      "https://example.com/images/corolla2.jpg"
    ],
    "features": [
      "Ar condicionado",
      "Direção hidráulica",
      "Vidros elétricos"
    ],
    "location": {
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567"
    },
    "seller": {
      "id": "68ed57a3572e134dd39350ce",
      "name": "Concessionária Toyota",
      "phone": "(11) 99999-9999",
      "email": "vendas@toyota.com"
    },
    "status": "active",
    "isFeatured": false,
    "views": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Vehicle created successfully"
}
```

## ❌ Exemplo de Response (Erro)

```json
{
  "success": false,
  "error": "Validation error",
  "message": "Validation failed",
  "details": [
    {
      "field": "brand",
      "message": "Brand is required"
    },
    {
      "field": "year",
      "message": "Year must be between 1900 and 2025"
    }
  ]
}
```

## 🚨 Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| `201` | Veículo criado com sucesso |
| `400` | Dados inválidos ou validação falhou |
| `401` | Token de autenticação inválido ou ausente |
| `403` | Usuário não tem permissão para criar veículos |
| `500` | Erro interno do servidor |

## 📋 Validações Específicas

### **Telefone**
- **Formato:** `(XX) XXXXX-XXXX` ou `(XX) XXXX-XXXX`
- **Exemplos válidos:**
  - `(11) 99999-9999`
  - `(11) 9999-9999`

### **CEP**
- **Formato:** `XXXXX-XXX` ou `XXXXXXXX`
- **Exemplos válidos:**
  - `01234-567`
  - `01234567`

### **Email**
- **Formato:** Email válido padrão RFC
- **Exemplos válidos:**
  - `vendas@toyota.com`
  - `contato@concessionaria.com.br`

### **URLs de Imagens**
- **Formato:** URLs válidas (http/https)
- **Exemplos válidos:**
  - `https://example.com/image.jpg`
  - `http://localhost:3000/uploads/vehicle.jpg`

## 🔍 Campos Calculados Automaticamente

| Campo | Descrição | Valor Padrão |
|-------|-----------|--------------|
| `status` | Status do veículo | `active` |
| `views` | Número de visualizações | `0` |
| `createdAt` | Data de criação | Data atual |
| `updatedAt` | Data de atualização | Data atual |

## 💡 Dicas Importantes

1. **Imagens:** Mínimo 1, máximo 10 imagens
2. **Features:** Máximo 20 características, 100 caracteres cada
3. **Descrição:** Mínimo 10, máximo 2000 caracteres
4. **Preço:** Sempre em reais (R$), sem formatação
5. **Quilometragem:** Sempre em quilômetros
6. **Ano:** Pode ser até 1 ano no futuro (veículos novos)

## 🎯 Casos de Uso Comuns

### **Carro Usado**
```json
{
  "category": "car",
  "condition": "used",
  "doors": 4,
  "fuelType": "gasoline",
  "transmission": "automatic"
}
```

### **Moto Nova**
```json
{
  "category": "motorcycle",
  "condition": "new",
  "doors": 0,
  "fuelType": "gasoline",
  "transmission": "manual"
}
```

### **Caminhão**
```json
{
  "category": "truck",
  "condition": "used",
  "doors": 2,
  "fuelType": "diesel",
  "transmission": "manual"
}
```

### **Van**
```json
{
  "category": "van",
  "condition": "used",
  "doors": 3,
  "fuelType": "diesel",
  "transmission": "manual"
}
```
