# 🤖 GitHub Actions - PR Evaluation Setup

Este documento explica como configurar o GitHub Action para avaliação automática de Pull Requests.

## 📋 Funcionalidades

O workflow `pr-evaluation.yml` executa automaticamente quando:
- ✅ Um novo Pull Request é **aberto**
- ✅ Um Pull Request é **sincronizado** (novos commits)
- ✅ Um Pull Request é **reaberto**

## 🔧 Configuração Necessária

### 1. Configurar Secrets no GitHub

Você precisa adicionar os secrets no repositório:

1. Acesse o repositório no GitHub
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**

#### Secrets Obrigatórios:

**WEBHOOK_SECRET** (obrigatório):
- **Name:** `WEBHOOK_SECRET`
- **Secret:** `DF94AEC11B7255BA28B4934259186`

#### Secrets Opcionais:

**EVALUATION_API_URL** (opcional):
- **Name:** `EVALUATION_API_URL`
- **Secret:** `https://claude-webhook-production.up.railway.app/evaluate-pullrequest`
- **Descrição:** URL da API de avaliação (usa valor padrão se não configurado)

### 2. Verificar Permissões

O workflow precisa das seguintes permissões:
- ✅ **Contents:** Read (para fazer checkout do código)
- ✅ **Issues:** Write (para comentar no PR)
- ✅ **Pull requests:** Write (para acessar informações do PR)

## 🚀 Como Funciona

### Fluxo de Execução:

1. **Trigger:** PR é aberto/atualizado
2. **Checkout:** Código é baixado
3. **Info Collection:** Coleta informações do PR
4. **API Call:** Chama a API de avaliação
5. **Comment:** Comenta no PR com os resultados

### Informações Enviadas para a API:

```json
{
  "prUrl": "https://github.com/user/repo/pull/123",
  "prNumber": 123,
  "prTitle": "Feature: Add new functionality",
  "prAuthor": "username",
  "prBranch": "feature/new-functionality",
  "baseBranch": "main",
  "repository": "user/repo"
}
```

## 📊 Exemplo de Resposta

O workflow espera uma resposta da API no formato:

```json
{
  "evaluation": {
    "score": 8.5,
    "status": "approved",
    "recommendations": [
      "Consider adding unit tests",
      "Update documentation"
    ],
    "issues": [
      "Potential memory leak in line 45"
    ]
  }
}
```

## 💬 Comentários Automáticos

O workflow cria comentários no PR com:

- 📋 **Resumo da avaliação**
- 💡 **Recomendações**
- ⚠️ **Problemas encontrados**
- 📊 **Score geral**

## 🔍 Monitoramento

### Logs do Workflow:
- Acesse **Actions** no GitHub
- Clique no workflow executado
- Veja os logs detalhados de cada step

### Status do Workflow:
- ✅ **Verde:** Avaliação bem-sucedida
- ❌ **Vermelho:** Falha na avaliação
- 🟡 **Amarelo:** Em execução

## 🛠️ Troubleshooting

### Problemas Comuns:

1. **Secret não configurado:**
   ```
   Error: Secret WEBHOOK_SECRET not found
   ```
   **Solução:** Configure o secret conforme instruções acima

2. **API não responde:**
   ```
   Status Code: 500
   ```
   **Solução:** Verifique se a API está funcionando e se a URL está correta

3. **URL da API incorreta:**
   ```
   curl: (6) Could not resolve host
   ```
   **Solução:** Verifique se o secret `EVALUATION_API_URL` está configurado corretamente

4. **Permissões insuficientes:**
   ```
   Error: Resource not accessible by integration
   ```
   **Solução:** Verifique as permissões do workflow

### Debug:

Para debugar, adicione logs temporários:

```yaml
- name: Debug
  run: |
    echo "Debug info:"
    echo "PR URL: ${{ steps.pr-info.outputs.pr_url }}"
    echo "Secret configured: ${{ secrets.WEBHOOK_SECRET != '' }}"
```

## 📝 Customização

### Configurar URL da API:

Para usar uma API diferente, configure o secret `EVALUATION_API_URL`:

```bash
# Exemplo: API local ou de desenvolvimento
EVALUATION_API_URL=https://sua-api-customizada.com/evaluate-pullrequest

# Exemplo: API com porta específica
EVALUATION_API_URL=http://localhost:3000/api/evaluate

# Exemplo: API com path customizado
EVALUATION_API_URL=https://api.exemplo.com/v2/pr-analysis
```

### Modificar Triggers:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, closed]  # Adicionar 'closed'
```

### Adicionar Mais Informações:

```yaml
- name: Get additional info
  run: |
    echo "commit_sha=${{ github.event.pull_request.head.sha }}" >> $GITHUB_OUTPUT
    echo "files_changed=${{ github.event.pull_request.changed_files }}" >> $GITHUB_OUTPUT
```

### Modificar Formato do Comentário:

Edite a seção `Comment on PR with evaluation results` no workflow.

### Usar Variáveis de Ambiente Customizadas:

```yaml
env:
  EVALUATION_API_URL: ${{ secrets.EVALUATION_API_URL || 'https://claude-webhook-production.up.railway.app/evaluate-pullrequest' }}
  TIMEOUT_SECONDS: ${{ secrets.API_TIMEOUT || '30' }}
  RETRY_ATTEMPTS: ${{ secrets.RETRY_ATTEMPTS || '3' }}
```

## 🔒 Segurança

- ✅ Secret é usado apenas para autenticação
- ✅ Não expõe informações sensíveis
- ✅ Usa HTTPS para todas as comunicações
- ✅ Permissões mínimas necessárias

## 📚 Recursos Adicionais

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
