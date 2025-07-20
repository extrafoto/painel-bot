# Painel de Controle - Bot WhatsApp

Um painel web moderno e responsivo para gerenciar bots de WhatsApp integrado com Google Sheets e n8n.

## 🚀 Características

### ✨ Interface Moderna
- Design responsivo e profissional
- Tema baseado nas cores do WhatsApp
- Animações e transições suaves
- Suporte completo para dispositivos móveis

### 🔧 Funcionalidades
- **Visualização de Contatos**: Cards organizados com informações detalhadas
- **Filtros Inteligentes**: Todos, Bot Ativo, Bot Desligado
- **Busca em Tempo Real**: Por nome ou número com debounce
- **Estatísticas**: Total de contatos, bots ativos, última atualização
- **Controle de Bot**: Ligar/desligar bot por contato com confirmação
- **Auto-refresh**: Atualização automática dos dados a cada 30 segundos

### 🛡️ Robustez e Segurança
- Tratamento robusto de erros com retry automático
- Validação completa de dados
- Timeouts configuráveis
- Estados de loading e erro
- Configuração centralizada
- Logs detalhados para debugging

## 📁 Estrutura do Projeto

```
whatsapp-bot-panel/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos modernos e responsivos
├── js/
│   ├── config.js       # Configurações centralizadas
│   ├── api.js          # Gerenciamento de APIs
│   ├── ui.js           # Interface do usuário
│   └── app.js          # Aplicação principal
└── README.md           # Esta documentação
```

## 🔧 Configuração

### 1. URLs das APIs
Edite o arquivo `js/config.js` para configurar suas URLs:

```javascript
const CONFIG = {
    API: {
        SHEET_BEST: 'https://api.sheetbest.com/sheets/SEU_ID_AQUI',
        N8N_WEBHOOK: 'https://seu-n8n.com/webhook/SEU_WEBHOOK_AQUI'
    }
    // ... outras configurações
};
```

### 2. Estrutura da Planilha Google Sheets
Sua planilha deve conter as seguintes colunas:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `Key` | String | Chave única (geralmente o número) |
| `Nome` ou `nome` | String | Nome do contato |
| `numero` | String | Número do WhatsApp |
| `modo` | String | "bot" ou "OFF" |
| `timestamp_ultima` | String | ISO timestamp da última atualização |

### 3. Configuração do N8N Webhook
O webhook deve aceitar POST com payload:
```json
{
  "numero": "5521999999999",
  "modo": "bot",
  "timestamp": "2025-07-20T12:00:00.000Z"
}
```

## 🚀 Instalação e Uso

### Opção 1: Servidor Local
```bash
# Clone ou baixe os arquivos
cd whatsapp-bot-panel

# Inicie um servidor HTTP simples
python3 -m http.server 8080

# Acesse http://localhost:8080
```

### Opção 2: Netlify (Recomendado)
1. Faça upload dos arquivos para o Netlify
2. Configure as variáveis de ambiente se necessário
3. Acesse sua URL do Netlify

### Opção 3: Qualquer Servidor Web
Faça upload dos arquivos para qualquer servidor web que suporte arquivos estáticos.

## 🎯 Como Usar

### Interface Principal
1. **Estatísticas**: Visualize total de contatos, bots ativos e última atualização no header
2. **Busca**: Digite nome ou número para filtrar contatos
3. **Filtros**: Use os botões para filtrar por status do bot
4. **Controle**: Clique nos botões dos cards para ligar/desligar bots

### Atalhos de Teclado
- `Ctrl + R`: Atualizar dados
- `Ctrl + F`: Focar no campo de busca
- `Escape`: Fechar modais

### Estados da Interface
- **Loading**: Overlay durante carregamento
- **Vazio**: Quando nenhum contato é encontrado
- **Erro**: Com botão para tentar novamente
- **Confirmação**: Modal antes de alterar modo do bot

## 🔧 Configurações Avançadas

### Timeouts e Retry
```javascript
REQUEST: {
    TIMEOUT: 10000,        // 10 segundos
    RETRY_ATTEMPTS: 3,     // 3 tentativas
    RETRY_DELAY: 1000      // 1 segundo entre tentativas
}
```

### Interface
```javascript
UI: {
    AUTO_REFRESH_INTERVAL: 30000,  // 30 segundos
    TOAST_DURATION: 5000,          // 5 segundos
    DEBOUNCE_DELAY: 500            // 500ms para busca
}
```

## 🐛 Solução de Problemas

### CORS com N8N
Se encontrar erros de CORS:
1. Configure CORS no seu n8n
2. Use um proxy reverso
3. Ou configure o webhook para aceitar requisições cross-origin

### Dados não carregam
1. Verifique a URL da API no `config.js`
2. Confirme que a planilha está pública
3. Verifique o console do browser para erros

### Performance
- O painel usa debounce na busca
- Auto-refresh pode ser desabilitado se necessário
- Retry automático evita falhas temporárias

## 🎨 Personalização

### Cores
Edite as variáveis CSS em `styles.css`:
```css
:root {
    --primary-color: #25D366;    /* Verde WhatsApp */
    --danger-color: #DC3545;     /* Vermelho */
    --success-color: #28A745;    /* Verde sucesso */
    /* ... outras cores */
}
```

### Intervalos
Modifique `config.js` para ajustar:
- Intervalo de auto-refresh
- Duração dos toasts
- Delay do debounce
- Timeouts de requisição

## 📊 Debugging

### Console do Browser
Use `window.debug` para comandos úteis:
```javascript
debug.getStats()        // Estatísticas da aplicação
debug.forceRefresh()    // Forçar atualização
debug.restart()         // Reiniciar aplicação
debug.exportData()      // Exportar backup
debug.checkHealth()     // Verificar APIs
debug.showToast()       // Testar notificações
```

### Logs
O painel gera logs detalhados no console:
- Tentativas de requisição
- Validação de dados
- Erros e warnings
- Estados da aplicação

## 🔄 Comparação com Versão Original

| Aspecto | Original | Refatorado |
|---------|----------|------------|
| **Arquitetura** | 1 arquivo HTML | 4 módulos separados |
| **Design** | Básico | Moderno e responsivo |
| **Tratamento de Erros** | Nenhum | Robusto com retry |
| **Validação** | Nenhuma | Completa |
| **Filtros** | Nenhum | 3 filtros funcionais |
| **Busca** | Nenhuma | Com debounce |
| **Estados** | Nenhum | Loading, erro, vazio |
| **Configuração** | Hardcoded | Centralizada |
| **Mobile** | Não responsivo | Totalmente responsivo |
| **UX** | Básica | Profissional |

## 📝 Licença

Este projeto é fornecido como está, para uso interno e educacional.

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Consulte a seção de solução de problemas
3. Use os comandos de debug disponíveis

