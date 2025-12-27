# 🧪 Como Testar Todas as Funções do Supabase

## 📋 Instruções Passo-a-Passo

### 1️⃣ Abra a página da aplicação
- Vá para https://caxito01.github.io/lista-prioridades/index.html
- OU faça login em auth.html

### 2️⃣ Abra o Console do Navegador
- Pressione **F12**
- Clique na aba **"Console"**

### 3️⃣ Copie o código de teste
- Abra o arquivo `TESTE_SUPABASE_COMPLETO.js`
- Copie TODO o código (Ctrl+A, Ctrl+C)

### 4️⃣ Cole no Console e Execute
- No console, clique e cole (Ctrl+V)
- Pressione **Enter**

### 5️⃣ Leia os Resultados

#### ✅ Se ver isto, tudo OK:
```
✅ initSupabase() retornou: true
✅ getClient() retornou: true
✅ client.auth existe? true
✅ client.from existe? true
✅ Sessão ativa!
✅ Projetos encontrados: 3
✅ RLS está ativo
```

#### ❌ Se ver erros:
- Procure por mensagens em **VERMELHO**
- Note EXATAMENTE qual teste falhou
- Copie a mensagem de erro completa

---

## 🔍 O Que Cada Teste Verifica

### TESTE 1: Inicialização do Supabase
```
✅ window.initSupabase() funciona?
✅ window.getClient() retorna o cliente?
✅ client.auth está disponível?
✅ client.from está disponível?
```

### TESTE 2: Autenticação
```
✅ client.auth.getSession() funciona?
✅ Há sessão ativa (usuário logado)?
✅ Consegue obter ID e Email do usuário?
```

### TESTE 3: Tabela de Projetos
```
✅ Consegue listar projetos?
✅ Projetos têm id, name, project_code?
✅ RLS está filtrando por user_id?
```

### TESTE 4: Row Level Security (RLS)
```
✅ RLS está bloqueando acesso a projetos de outros?
✅ Só consegue ver seus próprios projetos?
```

### TESTE 5: Funções SQL (RPC)
```
✅ Função get_project_by_code existe?
✅ Consegue chamar funções customizadas?
```

---

## 💡 O Que Fazer Se Algo Falhar

### Cenário 1: "getSession is not a function"
- **Problema**: client não foi inicializado
- **Solução**: Aguarde mais tempo na inicialização
- **Ação**: Clique no botão "🚪 Sair" e faça login novamente

### Cenário 2: "permission denied" ou "new row violates RLS"
- **Problema**: RLS bloqueia a operação
- **Solução**: Verificar RLS policies no Supabase console
- **Ação**: Contate o administrador do Supabase

### Cenário 3: "Nenhum projeto encontrado"
- **Problema**: Sua conta não tem projetos salvos
- **Solução**: Criar um novo projeto
- **Ação**: Use a função "💾 SALVAR TAREFA"

### Cenário 4: Erro de rede/timeout
- **Problema**: Problema de conectividade
- **Solução**: Recarregue a página (Ctrl+F5)
- **Ação**: Aguarde um momento e tente novamente

---

## 🚀 Após Testes OK, Testar as Funções Principais

### Função 1: saveToDatabase()
```javascript
// No console, depois de testar Supabase:
await saveToDatabase();
```

Deve:
- ✅ Mostrar modal de seleção de projeto
- ✅ Permitir criar novo ou atualizar existente
- ✅ Salvar dados com sucesso

### Função 2: loadFromDatabase()
```javascript
// No console:
await loadFromDatabase();
```

Deve:
- ✅ Carregar lista de seus projetos
- ✅ Permitir selecionar um projeto
- ✅ Restaurar dados na tela

### Função 3: performSaveProject(nome)
```javascript
// No console:
await performSaveProject('Meu Projeto de Teste');
```

Deve:
- ✅ Salvar novo projeto
- ✅ Retornar código do projeto
- ✅ Mostrar notificação "✅ Projeto salvo!"

---

## 📊 Checklist Completo

- [ ] TESTE 1: Supabase inicializa? ✅
- [ ] TESTE 2: Consegue fazer getSession()? ✅
- [ ] TESTE 3: Consegue listar projetos? ✅
- [ ] TESTE 4: RLS funciona corretamente? ✅
- [ ] TESTE 5: RPC disponível? ✅
- [ ] saveToDatabase() funciona? ✅
- [ ] loadFromDatabase() funciona? ✅
- [ ] performSaveProject() funciona? ✅

---

## 🆘 Se Tudo Falhar

1. **Recarregue a página** (Ctrl+F5)
2. **Limpe o cache** (Ctrl+Shift+R)
3. **Verifique a conexão de internet**
4. **Feche e abra novamente o browser**
5. **Se ainda falhar, compartilhe os logs vermelhos comigo**

---

## 📸 Exemplo de Output Esperado

```
🧪 INICIANDO TESTE COMPLETO DO SUPABASE

📝 TESTE 1: Inicialização do Supabase
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏳ Chamando window.initSupabase()...
✅ initSupabase() retornou: true
✅ getClient() retornou: true
✅ client.auth existe? true
✅ client.from existe? true

📝 TESTE 2: Verificação de Autenticação
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏳ Tentando getSession()...
✅ Sessão ativa!
   User ID: abc12345...
   Email: seu@email.com
   Criado em: 22/12/2025 14:30:45

📝 TESTE 3: Tabela de Projetos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏳ Carregando projetos do usuário: seu@email.com
✅ Projetos encontrados: 3
   1. Projeto 1
      Código: CXT12345
      ID: abc12345...
      Criado: 22/12/2025 10:00:00
```

Se viu isto tudo em ✅ verde, **parabéns! Supabase está 100% funcionando!** 🎉
