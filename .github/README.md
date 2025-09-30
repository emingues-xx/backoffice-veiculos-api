# 🤖 GitHub Actions - PR Evaluation

Este diretório contém os workflows do GitHub Actions para avaliação automática de Pull Requests.

## 📁 Arquivos

- `workflows/pr-evaluation.yml` - Workflow principal para avaliação de PRs
- `workflows/pr-evaluation.example.yml` - Exemplo de configuração
- `README.md` - Esta documentação

## 🚀 Configuração Rápida

### 1. Configurar Secrets

No repositório GitHub, vá em **Settings** → **Secrets and variables** → **Actions** e adicione:

#### Obrigatório:
- `WEBHOOK_SECRET`: `DF94AEC11B7255BA28B4934259186`

#### Opcional:
- `EVALUATION_API_URL`: `https://claude-webhook-production.up.railway.app/evaluate-pullrequest`

### 2. Ativar o Workflow

O workflow será executado automaticamente quando:
- ✅ Um PR for **aberto**
- ✅ Um PR for **sincronizado** (novos commits)
- ✅ Um PR for **reaberto**

## 🔧 Customização

### Usar API Diferente

Configure o secret `EVALUATION_API_URL` com sua URL customizada:

```bash
# Exemplos:
EVALUATION_API_URL=https://sua-api.com/evaluate
EVALUATION_API_URL=http://localhost:3000/api/pr-analysis
EVALUATION_API_URL=https://api.exemplo.com/v2/evaluate-pullrequest
```

### Modificar Triggers

Edite o arquivo `pr-evaluation.yml`:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, closed]  # Adicionar 'closed'
```

## 📊 Monitoramento

### Ver Logs

1. Acesse **Actions** no GitHub
2. Clique no workflow executado
3. Veja os logs detalhados

### Status

- ✅ **Verde**: Avaliação bem-sucedida
- ❌ **Vermelho**: Falha na avaliação
- 🟡 **Amarelo**: Em execução

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Secret não configurado**
   - Verifique se `WEBHOOK_SECRET` está configurado

2. **API não responde**
   - Verifique se a URL da API está correta
   - Teste a API manualmente

3. **Permissões insuficientes**
   - Verifique as permissões do workflow

### Debug

Para debugar, adicione logs temporários no workflow:

```yaml
- name: Debug
  run: |
    echo "API URL: ${{ env.EVALUATION_API_URL }}"
    echo "Secret configured: ${{ secrets.WEBHOOK_SECRET != '' }}"
```

## 📚 Recursos

- [Documentação Completa](../GITHUB_ACTIONS_SETUP.md)
- [Script de Teste](../test-pr-evaluation.ps1)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

## 🔒 Segurança

- ✅ Secrets são usados apenas para autenticação
- ✅ Não expõe informações sensíveis
- ✅ Usa HTTPS para todas as comunicações
- ✅ Permissões mínimas necessárias
