# 🔧 Diagnóstico: Erro ao Carregar Tarefas

## Erro Reportado
```
Erro: Cannot read properties of undefined (reading 'getSession')
```

## Causa Provável
A função `loadFromDatabase()` está sendo chamada, mas uma de suas dependências (`window.getClient()`) retorna `undefined` ou `null`.

## Soluções Aplicadas

### 1. Corrigido em `auth.html` (linha 243)
```javascript
// ❌ ANTES
const { data: { session } } = await client.auth.getSession();

// ✅ DEPOIS
const { data, error: sessionError } = await client.auth.getSession();
const session = data?.session;
```

### 2. Garantido Ordem de Inicialização
- `supabase-config.js` carrega PRIMEIRO
- `auth.js` carrega DEPOIS (usa `window.initSupabase()`)
- `app.js` carrega POR ÚLTIMO

### 3. Verificação em Todas as Funções
Todas as funções que usam `client`:
```javascript
await window.initSupabase();  // ← ESSENCIAL!
const client = window.getClient();

if (!client) {
    showNotification('❌ Erro ao conectar');
    return;
}
```

## Como Debugar

1. Abra DevTools (F12)
2. Vá à aba "Console"
3. Clique em "📥 CARREGAR TAREFA"
4. Procure por logs:
   - ✅ "🔐 Verificando autenticação..."
   - ✅ "✅ Supabase JS carregado..."
   - ✅ "✅ Client Supabase inicializado: true"
   - ✅ "📂 Carregando projetos do banco de dados..."

5. Se ver erro, ele dirá exatamente onde

## Próximos Passos

Se o erro persiste:
1. Verifique se a biblioteca Supabase carrega (veja logs "✅ Supabase JS carregado")
2. Se não carregar, há problema de CDN
3. Se carregar mas client é null, há problema com as credenciais

## Checklist de Teste

- [ ] Recarregue a página (Ctrl+F5)
- [ ] Clique em "📥 CARREGAR TAREFA"
- [ ] Veja os logs no Console
- [ ] Se houver erro, copie a mensagem completa
