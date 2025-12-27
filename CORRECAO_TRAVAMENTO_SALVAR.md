# Correção: Travamento ao Salvar Tarefa

## Problema Identificado

Quando o usuário clicava em "Salvar" (💾), a página travava com a mensagem "Esta página não está respondendo".

## Causas do Travamento

1. **Uso de `.single()` no Supabase**: A query que buscava projeto por código usava `.single()`, que pode causar erro/travamento se retornar múltiplos resultados ou nenhum resultado.

2. **Falta de timeout nas requisições**: As requisições RPC e queries ao Supabase não tinham timeout, causando travamento indefinido em caso de falha de conexão ou erro no banco.

3. **Falta de feedback ao usuário**: Não havia indicação de "carregando" ao clicar em salvar, deixando o usuário sem saber se algo estava acontecendo.

4. **Problema com acesso por código**: Quando o usuário acessava via código de projeto, a função tentava verificar sessão de autenticação, mas não havia sessão, causando conflito.

## Correções Implementadas

### 1. Substituição de `.single()` por `.limit(1)`

**Arquivo**: `auth.js`, linha ~187

**Antes**:
```javascript
const { data: fallbackProject, error: fallbackError } = await client
    .from('projects')
    .select('*')
    .eq('project_code', projectCode)
    .single();
```

**Depois**:
```javascript
const { data: fallbackProject, error: fallbackError } = await client
    .from('projects')
    .select('*')
    .eq('project_code', projectCode)
    .limit(1);
```

**Motivo**: `.single()` falha se não retornar exatamente 1 resultado. `.limit(1)` sempre retorna um array (vazio ou com 1 item), evitando erros.

### 2. Adição de Timeouts nas Requisições

**Arquivo**: `auth.js`, função `loadUserProjects`

Adicionado timeout de 5 segundos para requisições RPC e queries:

```javascript
// Timeout de 5 segundos para RPC
const rpcPromise = client.rpc('get_project_by_code', { p_code: projectCode });
const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout RPC')), 5000)
);

const { data: project, error } = await Promise.race([rpcPromise, timeoutPromise]);
```

**Motivo**: Evita que a página trave indefinidamente se o servidor não responder.

### 3. Timeout na Função de Salvar

**Arquivo**: `auth.js`, função `saveToDatabaseWithAuth`

Adicionado timeout de 10 segundos ao carregar projetos:

```javascript
const projectsPromise = loadUserProjects();
const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout ao carregar projetos')), 10000)
);

const projects = await Promise.race([projectsPromise, timeoutPromise]);
```

**Motivo**: Fornece feedback de erro ao usuário se a operação demorar muito.

### 4. Feedback de Carregamento

Adicionado feedback imediato ao clicar em salvar:

```javascript
showNotification('⏳ Carregando...');
```

**Motivo**: Informa ao usuário que o sistema está processando o pedido.

### 5. Tratamento Especial para Acesso por Código

**Arquivo**: `auth.js`, funções `saveToDatabaseWithAuth` e `performUpdateProject`

Agora detecta se o usuário acessou via código e não exige autenticação nesses casos:

```javascript
const projectCode = localStorage.getItem('projectCode');
const projectId = localStorage.getItem('projectId');

if (projectCode && projectId) {
    // Lógica especial para acesso por código
    // Não exige sessão de autenticação
}
```

**Motivo**: Permite que usuários com código de acesso possam salvar sem login.

### 6. Exposição da Função no Escopo Global

**Arquivo**: `auth.js`, final do arquivo

```javascript
window.performUpdateProject = performUpdateProject;
```

**Motivo**: Permite que a função seja chamada de outros arquivos e do HTML inline.

## Como Testar

1. Abra a aplicação
2. Adicione algumas tarefas
3. Clique no botão "💾 Salvar"
4. Verifique se:
   - Aparece a mensagem "⏳ Carregando..."
   - O modal de seleção de projeto abre
   - Você consegue atualizar ou criar novo projeto
   - A página não trava

## Resultado Esperado

- ✅ A página não trava mais ao clicar em salvar
- ✅ Feedback imediato ao usuário ("Carregando...")
- ✅ Timeout de 10 segundos evita travamentos indefinidos
- ✅ Erro amigável se algo der errado
- ✅ Funciona tanto com login quanto com código de acesso

## Data da Correção

27 de dezembro de 2024
