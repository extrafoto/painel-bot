# Guia de Configuração - Painel Bot WhatsApp

## 🔧 Configuração Rápida

### 1. Editar URLs das APIs
Abra o arquivo `js/config.js` e substitua as URLs:

```javascript
const CONFIG = {
    API: {
        // Substitua pelo seu ID do Sheet.best
        SHEET_BEST: 'https://api.sheetbest.com/sheets/SEU_ID_AQUI',
        
        // Substitua pela sua URL do webhook n8n
        N8N_WEBHOOK: 'https://seu-n8n.com/webhook/SEU_WEBHOOK_AQUI'
    }
    // ... resto da configuração permanece igual
};
```

### 2. Configurar Google Sheets + Sheet.best

#### Passo 1: Preparar a Planilha
Crie uma planilha no Google Sheets com as seguintes colunas (exatamente estes nomes):

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Key | Nome | numero | modo | timestamp_ultima | (outras colunas opcionais) |

**Exemplo de dados:**
```
Key              | Nome          | numero        | modo   | timestamp_ultima
5521999999999    | João Silva    | 5521999999999 | bot    | 2025-07-20T12:00:00.000Z
5521888888888    | Maria Santos  | 5521888888888 | OFF    | 2025-07-19T15:30:00.000Z
```

#### Passo 2: Configurar Sheet.best
1. Acesse [sheet.best](https://sheet.best)
2. Cole a URL da sua planilha Google Sheets
3. Copie o ID gerado (parte após `/sheets/`)
4. Cole no arquivo `config.js`

### 3. Configurar N8N Webhook

#### Estrutura do Webhook
Seu webhook n8n deve aceitar POST com este payload:
```json
{
  "numero": "5521999999999",
  "modo": "bot",
  "timestamp": "2025-07-20T12:00:00.000Z"
}
```

#### Exemplo de Workflow N8N
1. **Webhook Node**: Recebe o POST
2. **Function Node**: Processa os dados
3. **Google Sheets Node**: Atualiza a planilha

```javascript
// Exemplo de código para o Function Node
const { numero, modo, timestamp } = $json;

// Buscar linha pelo número
const searchCriteria = {
  Key: numero
};

// Dados para atualizar
const updateData = {
  modo: modo,
  timestamp_ultima: timestamp
};

return {
  searchCriteria,
  updateData
};
```

## ⚙️ Configurações Avançadas

### Timeouts e Retry
```javascript
REQUEST: {
    TIMEOUT: 10000,        // Timeout em ms (10 segundos)
    RETRY_ATTEMPTS: 3,     // Número de tentativas
    RETRY_DELAY: 1000      // Delay entre tentativas em ms
}
```

### Interface do Usuário
```javascript
UI: {
    AUTO_REFRESH_INTERVAL: 30000,  // Auto-refresh em ms (30 segundos)
    TOAST_DURATION: 5000,          // Duração dos toasts em ms
    ANIMATION_DURATION: 300,       // Duração das animações em ms
    DEBOUNCE_DELAY: 500           // Delay do debounce na busca em ms
}
```

### Modos do Bot
```javascript
BOT_MODES: {
    ACTIVE: 'bot',      // Modo ativo
    INACTIVE: 'OFF'     // Modo inativo
}
```

### Validação de Telefone
```javascript
VALIDATION: {
    MIN_PHONE_LENGTH: 10,           // Mínimo de dígitos
    MAX_PHONE_LENGTH: 15,           // Máximo de dígitos
    PHONE_PATTERN: /^[\d\s\-\+\(\)]+$/  // Padrão aceito
}
```

## 🔒 Configuração de CORS

### Problema Comum
Se você receber erros de CORS ao tentar alterar o modo do bot:

```
Access to fetch at 'https://seu-n8n.com/webhook/...' from origin 'https://seu-site.com' 
has been blocked by CORS policy
```

### Soluções

#### Opção 1: Configurar CORS no N8N
Adicione headers no seu webhook n8n:
```javascript
// No Response Node do n8n
{
  "headers": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  }
}
```

#### Opção 2: Usar Proxy
Configure um proxy reverso (nginx, cloudflare, etc.) para contornar CORS.

#### Opção 3: Netlify Functions
Se hospedado no Netlify, use Netlify Functions como proxy:

```javascript
// netlify/functions/webhook.js
exports.handler = async (event, context) => {
  const response = await fetch('https://seu-n8n.com/webhook/...', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: event.body
  });
  
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify(await response.json())
  };
};
```

## 🎨 Personalização Visual

### Alterar Cores
Edite as variáveis CSS em `css/styles.css`:

```css
:root {
    /* Cores Principais */
    --primary-color: #25D366;      /* Verde WhatsApp */
    --primary-dark: #1DA851;       /* Verde escuro */
    --secondary-color: #128C7E;    /* Verde secundário */
    
    /* Cores de Status */
    --danger-color: #DC3545;       /* Vermelho */
    --success-color: #28A745;      /* Verde sucesso */
    --warning-color: #FFC107;      /* Amarelo */
    --info-color: #17A2B8;         /* Azul */
    
    /* Cores Neutras */
    --white: #FFFFFF;
    --gray-50: #F8F9FA;
    --gray-800: #343A40;
    /* ... outras cores */
}
```

### Alterar Fontes
```css
:root {
    --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    /* ... outros tamanhos */
}
```

### Alterar Layout
Modifique o grid dos cards:
```css
.contacts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: var(--spacing-6);
}
```

## 📱 Configuração Mobile

### Viewport
O painel já inclui configuração responsiva:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Breakpoints
```css
/* Tablet */
@media (max-width: 768px) {
    /* Ajustes para tablet */
}

/* Mobile */
@media (max-width: 480px) {
    /* Ajustes para mobile */
}
```

## 🔍 Debug e Monitoramento

### Habilitar Logs Detalhados
No console do browser:
```javascript
// Habilitar logs verbosos
localStorage.setItem('debug', 'true');

// Ver estatísticas
debug.getStats();

// Verificar saúde das APIs
debug.checkHealth();
```

### Monitoramento de Performance
```javascript
// Ver tempo de carregamento
performance.getEntriesByType('navigation')[0];

// Ver requisições de rede
performance.getEntriesByType('resource');
```

## 🚀 Deploy em Produção

### Netlify
1. Conecte seu repositório Git
2. Configure build settings (se necessário)
3. Deploy automático

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages
1. Ative GitHub Pages no repositório
2. Selecione branch main
3. Acesse via username.github.io/repo-name

### Servidor Próprio
```bash
# Nginx
sudo cp -r whatsapp-bot-panel /var/www/html/

# Apache
sudo cp -r whatsapp-bot-panel /var/www/html/
```

## ✅ Checklist de Configuração

- [ ] URLs das APIs configuradas em `config.js`
- [ ] Planilha Google Sheets com colunas corretas
- [ ] Sheet.best configurado e testado
- [ ] N8N webhook funcionando
- [ ] CORS configurado (se necessário)
- [ ] Painel testado localmente
- [ ] Deploy em produção realizado
- [ ] Funcionalidades testadas em produção

## 🆘 Solução de Problemas Comuns

### "Nenhum contato encontrado"
1. Verifique URL do Sheet.best
2. Confirme que planilha está pública
3. Verifique nomes das colunas
4. Veja console para erros

### Botões não funcionam
1. Verifique CORS
2. Teste webhook manualmente
3. Veja logs no console
4. Confirme URL do n8n

### Layout quebrado
1. Verifique se todos os arquivos CSS carregaram
2. Teste em diferentes browsers
3. Verifique console para erros 404
4. Confirme estrutura de arquivos

### Performance lenta
1. Reduza intervalo de auto-refresh
2. Aumente timeout das requisições
3. Verifique conexão de internet
4. Otimize planilha (menos colunas)

