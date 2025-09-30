# 🔧 Configuração CORS - Backoffice Veículos API

## 🏗️ Arquitetura do Sistema

Baseado no catálogo, você tem:

### **Sistemas:**
- **Vitrine de Veículos** (frontend público)
- **Backoffice de Veículos** (frontend administrativo)

### **Componentes:**
- **vitrine-veiculos-web** (Frontend React/Next.js)
- **vitrine-veiculos-bff** (Backend for Frontend)
- **backoffice-veiculos-web** (Frontend administrativo)
- **backoffice-veiculos-bff** (BFF administrativo)

## 🎯 Opções de Configuração CORS

### **Opção 1: Frontends Diretos (Simples)**
```env
CORS_ORIGIN="https://vitrine-veiculos.vercel.app,https://backoffice-veiculos.vercel.app"
```

### **Opção 2: BFFs Apenas (Mais Seguro)**
```env
CORS_ORIGIN="https://vitrine-veiculos-bff.railway.app,https://backoffice-veiculos-bff.railway.app"
```

### **Opção 3: Híbrida (Recomendada)**
```env
CORS_ORIGIN="https://vitrine-veiculos.vercel.app,https://backoffice-veiculos.vercel.app,https://vitrine-veiculos-bff.railway.app,https://backoffice-veiculos-bff.railway.app"
```

### **Opção 4: Desenvolvimento**
```env
CORS_ORIGIN="http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003"
```

## 🔄 Como Atualizar no Railway

1. **Acesse o painel do Railway**
2. **Vá em Variables**
3. **Edite CORS_ORIGIN**
4. **Cole a configuração desejada**
5. **Salve** (deploy automático)

## 🚀 Recomendação Final

Para começar, use a **Opção 3 (Híbrida)**:

```env
CORS_ORIGIN="https://vitrine-veiculos.vercel.app,https://backoffice-veiculos.vercel.app,https://vitrine-veiculos-bff.railway.app,https://backoffice-veiculos-bff.railway.app"
```

Isso permite:
- ✅ Frontends acessarem diretamente
- ✅ BFFs acessarem a API
- ✅ Flexibilidade na arquitetura
- ✅ Segurança adequada

## 🔍 Verificação

Após configurar, teste:

```bash
curl -H "Origin: https://seu-frontend.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://backoffice-veiculos-api-production.up.railway.app/api/vehicles
```

## 📝 Notas

- **Múltiplos domínios**: Separe com vírgula
- **Subdomínios**: Use `*.seu-dominio.com` se necessário
- **Desenvolvimento**: Inclua `http://localhost:*`
- **Produção**: Use apenas HTTPS



