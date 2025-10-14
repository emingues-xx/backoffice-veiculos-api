# Backoffice Veículos API

API completa para gestão de anúncios e vendas de veículos do sistema de E-commerce de Veículos. Sistema em produção com todas as funcionalidades CRUD implementadas e testadas.

## 🚀 Tecnologias

- **Node.js 18+** - Runtime JavaScript
- **TypeScript** - Linguagem de programação
- **Express.js** - Framework web
- **MongoDB** - Banco de dados
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação (expiração 4h)
- **Joi** - Validação de dados
- **Swagger** - Documentação interativa da API
- **Jest** - Testes unitários
- **Railway** - Deploy em produção

## 📋 Funcionalidades Implementadas

### 🚗 Gestão de Veículos ✅
- **CRUD completo** - Criar, listar, buscar, atualizar e deletar veículos
- **Filtros avançados** - Por marca, modelo, ano, preço, categoria, combustível
- **Validação robusta** - Schemas Joi para todos os campos obrigatórios
- **Controle de status** - Ativo, vendido, inativo
- **Estatísticas** - Relatórios de veículos por categoria, marca, etc.
- **Paginação** - Sistema de paginação para listagens grandes

### 👥 Gestão de Usuários ✅
- **Autenticação JWT** - Login seguro com token de 4 horas
- **Controle de roles** - Admin, manager, seller com permissões específicas
- **Perfil de usuário** - Visualização e edição de dados pessoais
- **Gestão administrativa** - CRUD completo de usuários (admin)
- **Validação de dados** - Email único, senhas seguras

### 💰 Gestão de Vendas ✅
- **Registro de vendas** - Sistema completo de registro de transações
- **Cálculo automático** - Comissões de 5% calculadas automaticamente
- **Relatórios detalhados** - Estatísticas por vendedor, período, status
- **Controle de status** - Pending, completed, cancelled
- **Métodos de pagamento** - Cash, financing, trade-in
- **Histórico completo** - Snapshot do veículo no momento da venda

### 🔧 Funcionalidades Técnicas ✅
- **Encoding UTF-8** - Suporte completo a caracteres especiais (sem acentos)
- **Validação de dados** - Schemas Joi para todos os endpoints
- **Tratamento de erros** - Middleware centralizado de tratamento de erros
- **Rate limiting** - Proteção contra spam e ataques
- **CORS configurado** - Suporte a múltiplas origens
- **Health check** - Endpoint de monitoramento da API

## 🌐 URLs de Produção

- **API**: https://backoffice-veiculos-api-production.up.railway.app/
- **Documentação Swagger**: https://backoffice-veiculos-api-production.up.railway.app/docs
- **Health Check**: https://backoffice-veiculos-api-production.up.railway.app/health

## 🛠️ Instalação Local

### Pré-requisitos
- Node.js 18+ 
- MongoDB 5+ (ou usar Railway MongoDB)
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
# Para desenvolvimento local
PORT=3016
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/backoffice-veiculos
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL=info
```

4. **Execute o projeto**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

### 🚀 Deploy no Railway

O projeto está configurado para deploy automático no Railway:

1. **Conecte o repositório** ao Railway
2. **Configure as variáveis de ambiente**:
   - `DATABASE_URL` - MongoDB URI do Railway
   - `JWT_SECRET` - Chave secreta para JWT
   - `CORS_ORIGIN` - URL do frontend/BFF
   - `NODE_ENV=production`
3. **Deploy automático** - Railway detecta o Dockerfile e faz o build

## 📚 Documentação da API

Acesse a documentação interativa da API em:
- **Produção**: https://backoffice-veiculos-api-production.up.railway.app/docs
- **Desenvolvimento**: http://localhost:3016/docs
- **Swagger UI**: Interface completa com exemplos e testes

### 🔑 Credenciais de Teste

**Usuário Admin:**
- Email: `admin@backoffice.com`
- Senha: `Admin123!@#`
- Role: `admin` (acesso total)

### Endpoints Implementados

#### 🚗 Veículos ✅
- `GET /api/vehicles` - Listar veículos com filtros e paginação
- `POST /api/vehicles` - Criar veículo (autenticado)
- `GET /api/vehicles/:id` - Buscar veículo por ID
- `PUT /api/vehicles/:id` - Atualizar veículo (autenticado)
- `DELETE /api/vehicles/:id` - Deletar veículo (autenticado)
- `GET /api/vehicles/stats` - Estatísticas de veículos

#### 👥 Usuários ✅
- `POST /api/users/register` - Registrar usuário
- `POST /api/users/login` - Login (retorna JWT)
- `GET /api/users/profile` - Perfil do usuário (autenticado)
- `PUT /api/users/profile` - Atualizar perfil (autenticado)
- `GET /api/users` - Listar usuários (admin)
- `GET /api/users/:id` - Buscar usuário (admin)
- `PUT /api/users/:id` - Atualizar usuário (admin)
- `DELETE /api/users/:id` - Deletar usuário (admin)

#### 💰 Vendas ✅
- `POST /api/sales` - Registrar venda (autenticado)
- `GET /api/sales` - Listar vendas com filtros (autenticado)
- `GET /api/sales/stats` - Estatísticas de vendas (autenticado)
- `GET /api/sales/my-sales` - Vendas do vendedor (autenticado)
- `GET /api/sales/:id` - Buscar venda por ID (autenticado)
- `PUT /api/sales/:id` - Atualizar venda (autenticado)
- `DELETE /api/sales/:id` - Deletar venda (admin)

#### 🔧 Utilitários ✅
- `GET /health` - Health check da API
- `GET /docs` - Documentação Swagger

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação com **expiração de 4 horas**.

### Headers necessários:
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Roles disponíveis:
- **admin**: Acesso total ao sistema (CRUD completo)
- **manager**: Gestão de veículos e vendas
- **seller**: Gestão de próprios veículos e vendas

### ⚠️ Importante - Encoding de Dados

**Para evitar problemas de encoding, use apenas caracteres sem acentos:**
- ✅ Correto: "Veiculo em excelente estado, unico dono, revisoes em dia"
- ❌ Evitar: "Veículo em excelente estado, único dono, revisões em dia"

A API processa dados sem caracteres especiais para garantir compatibilidade total.

## 🧪 Testes e Validação

### Status dos Testes ✅
- **CRUD de Veículos**: Testado e funcionando
- **CRUD de Usuários**: Testado e funcionando  
- **CRUD de Vendas**: Testado e funcionando
- **Autenticação JWT**: Testado e funcionando
- **Validação de Dados**: Testado e funcionando

### Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Build para produção (TypeScript + tsc-alias)
npm start           # Executar em produção
npm test            # Executar testes
npm run lint        # Verificar código
npm run lint:fix    # Corrigir problemas de lint
```

### Testes Manuais Realizados ✅
- ✅ Login e autenticação JWT
- ✅ Criação de veículos com validação
- ✅ Listagem com filtros e paginação
- ✅ Atualização e exclusão de veículos
- ✅ Criação de vendas com cálculo de comissão
- ✅ Estatísticas de vendas
- ✅ Health check da API

## 🏗️ Estrutura do Projeto

```
src/
├── config/          # Configurações (DB, app, swagger)
├── controllers/     # Lógica de negócio (vehicles, users, sales)
├── middleware/      # Middlewares (auth, validation, error)
├── models/          # Modelos do MongoDB (Vehicle, User, Sale)
├── routes/          # Definição de rotas com Swagger
├── types/           # Interfaces TypeScript
├── utils/           # Utilitários e schemas de validação
├── tests/           # Testes unitários
├── app.ts           # Configuração do Express
└── index.ts         # Ponto de entrada
```

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

| Variável | Descrição | Padrão | Produção |
|----------|-----------|---------|----------|
| `PORT` | Porta do servidor | 3016 | 3000 |
| `NODE_ENV` | Ambiente | development | production |
| `DATABASE_URL` | URI do MongoDB | mongodb://localhost:27017/backoffice-veiculos | Railway MongoDB |
| `JWT_SECRET` | Chave secreta JWT | - | Configurado |
| `CORS_ORIGIN` | Origem CORS | http://localhost:3000 | Frontend URL |
| `RATE_LIMIT_MAX_REQUESTS` | Limite de requests | 1000 | 1000 |
| `LOG_LEVEL` | Nível de log | info | info |

### Banco de Dados

O projeto utiliza MongoDB com Mongoose. Em produção, usa o MongoDB gerenciado do Railway.

## 🚀 Deploy

### Railway (Produção Atual) ✅
O projeto está em produção no Railway com:
- **Deploy automático** via Git
- **MongoDB gerenciado** pelo Railway
- **Dockerfile** para build otimizado
- **Variáveis de ambiente** configuradas
- **Health check** automático

### Docker Local
```bash
# Build da imagem
docker build -t backoffice-veiculos-api .

# Executar container
docker run -p 3016:3016 --env-file .env backoffice-veiculos-api
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

- **Health Check**: `GET /health` - Status da API
- **Logs**: Morgan para logging HTTP detalhado
- **Rate Limiting**: 1000 requests por 15 minutos
- **CORS**: Configuração flexível de origens
- **JWT**: Tokens com expiração de 4 horas
- **MongoDB**: Conexão com pool de 10 conexões

## 🎯 Status do Projeto

### ✅ Implementado e Testado
- **API completa** em produção no Railway
- **CRUD de veículos** com validação e filtros
- **Sistema de vendas** com cálculo de comissões
- **Autenticação JWT** com roles e permissões
- **Documentação Swagger** interativa
- **Deploy automatizado** via Railway
- **Health check** e monitoramento

### 🔧 Problemas Resolvidos
- **Encoding UTF-8**: Solucionado usando dados sem caracteres especiais
- **Build TypeScript**: Configurado com tsc-alias para path resolution
- **Validação de dados**: Schemas Joi implementados para todos endpoints
- **CORS**: Configurado para múltiplas origens
- **Rate limiting**: Proteção contra spam implementada

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

---

**🚀 API em Produção**: https://backoffice-veiculos-api-production.up.railway.app/
**📚 Documentação**: https://backoffice-veiculos-api-production.up.railway.app/docs
