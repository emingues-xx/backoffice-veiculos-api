# Backoffice Veículos API

API para gestão de anúncios e vendas de veículos do sistema de E-commerce de Veículos.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Linguagem de programação
- **Express.js** - Framework web
- **MongoDB** - Banco de dados
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **Joi** - Validação de dados
- **Swagger** - Documentação da API
- **Jest** - Testes unitários

## 📋 Funcionalidades

### 🚗 Gestão de Veículos
- CRUD completo de veículos
- Filtros avançados (marca, modelo, ano, preço, etc.)
- Sistema de destaque (featured)
- Estatísticas de visualizações
- Controle de status (ativo, vendido, inativo)

### 👥 Gestão de Usuários
- Sistema de autenticação JWT
- Controle de roles (admin, manager, seller)
- Perfil de usuário
- Gestão de usuários (admin)

### 💰 Gestão de Vendas
- Registro de vendas
- Cálculo automático de comissões
- Relatórios de vendas
- Estatísticas por vendedor
- Controle de status de vendas

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+ 
- MongoDB 5+
- npm ou yarn

### Configuração

1. **Clone o repositório**
```bash
git clone <repository-url>
cd backoffice-veiculos-api
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/backoffice-veiculos
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://localhost:3000
```

4. **Execute o projeto**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 📚 Documentação da API

Acesse a documentação interativa da API em:
- **Desenvolvimento**: http://localhost:3001/docs
- **Swagger UI**: Interface completa com exemplos

### Endpoints Principais

#### 🚗 Veículos
- `GET /api/vehicles` - Listar veículos com filtros
- `POST /api/vehicles` - Criar veículo (autenticado)
- `GET /api/vehicles/:id` - Buscar veículo por ID
- `PUT /api/vehicles/:id` - Atualizar veículo (autenticado)
- `DELETE /api/vehicles/:id` - Deletar veículo (autenticado)
- `GET /api/vehicles/stats` - Estatísticas de veículos
- `PATCH /api/vehicles/:id/featured` - Toggle destaque (admin)

#### 👥 Usuários
- `POST /api/users/register` - Registrar usuário
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Perfil do usuário (autenticado)
- `PUT /api/users/profile` - Atualizar perfil (autenticado)
- `GET /api/users` - Listar usuários (admin)
- `GET /api/users/:id` - Buscar usuário (admin)
- `PUT /api/users/:id` - Atualizar usuário (admin)
- `DELETE /api/users/:id` - Deletar usuário (admin)

#### 💰 Vendas
- `POST /api/sales` - Registrar venda (autenticado)
- `GET /api/sales` - Listar vendas com filtros (autenticado)
- `GET /api/sales/stats` - Estatísticas de vendas (autenticado)
- `GET /api/sales/my-sales` - Vendas do vendedor (autenticado)
- `GET /api/sales/:id` - Buscar venda por ID (autenticado)
- `PUT /api/sales/:id` - Atualizar venda (autenticado)
- `DELETE /api/sales/:id` - Deletar venda (admin)

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação.

### Headers necessários:
```
Authorization: Bearer <token>
```

### Roles disponíveis:
- **admin**: Acesso total ao sistema
- **manager**: Gestão de veículos e vendas
- **seller**: Gestão de próprios veículos e vendas

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm test -- --coverage
```

## 📊 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Build para produção
npm start           # Executar em produção
npm test            # Executar testes
npm run lint        # Verificar código
npm run lint:fix    # Corrigir problemas de lint
```

## 🏗️ Estrutura do Projeto

```
src/
├── config/          # Configurações (DB, app)
├── controllers/     # Lógica de negócio
├── middleware/      # Middlewares (auth, validation, error)
├── models/          # Modelos do MongoDB
├── routes/          # Definição de rotas
├── types/           # Interfaces TypeScript
├── utils/           # Utilitários e schemas
├── tests/           # Testes unitários
├── app.ts           # Configuração do Express
└── index.ts         # Ponto de entrada
```

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `PORT` | Porta do servidor | 3001 |
| `NODE_ENV` | Ambiente | development |
| `MONGODB_URI` | URI do MongoDB | mongodb://localhost:27017/backoffice-veiculos |
| `JWT_SECRET` | Chave secreta JWT | - |
| `CORS_ORIGIN` | Origem CORS | http://localhost:3000 |

### Banco de Dados

O projeto utiliza MongoDB com Mongoose. Certifique-se de ter o MongoDB rodando localmente ou configure a URI de conexão.

## 🚀 Deploy

### Docker (Recomendado)
```bash
# Build da imagem
docker build -t backoffice-veiculos-api .

# Executar container
docker run -p 3001:3001 --env-file .env backoffice-veiculos-api
```

### PM2
```bash
# Build do projeto
npm run build

# Instalar PM2
npm install -g pm2

# Executar com PM2
pm2 start dist/index.js --name backoffice-api
```

## 📈 Monitoramento

- **Health Check**: `GET /health`
- **Logs**: Morgan para logging HTTP
- **Rate Limiting**: Proteção contra spam
- **CORS**: Configuração de origens permitidas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Squad

- **Squad Backoffice** - Desenvolvimento e manutenção da API
- **Tribe E-commerce** - Gestão do domínio completo

## 📞 Suporte

Para suporte, entre em contato com a Squad Backoffice ou abra uma issue no repositório.
