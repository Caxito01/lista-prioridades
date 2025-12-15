# Sistema de Código de Projeto - Instruções de Configuração

## ✨ Nova Funcionalidade

O sistema agora suporta **duas formas de autenticação**:

### 1. 📧 Autenticação por Email e Senha
- Login tradicional com email e senha
- Acessa todos os projetos do usuário

### 2. 🔑 Autenticação por Código do Projeto
- Login sem necessidade de conta (anônimo)
- Acessa apenas um projeto específico
- Código alfanumérico: **CXT + 5 números aleatórios**

## 📋 Formato do Código

O código deve conter obrigatoriamente as 3 letras **CXT** (e exatamente 5 dígitos numéricos):

Exemplos válidos:
- `CXT12345` - CXT no início
- `12CXT345` - CXT no meio
- `12345CXT` - CXT no final

## 🔧 Configuração do Banco de Dados

**IMPORTANTE:** Você precisa executar o SQL para adicionar a coluna `project_code` na tabela.

### Passos:

1. Acesse o **SQL Editor** do Supabase (Console → SQL Editor)
2. Abra o arquivo `setup-project-code.sql` do projeto
3. Copie e cole o conteúdo no SQL Editor
4. Clique em **Run** (ou Ctrl+Enter)

Isso irá:
- ✅ Adicionar coluna `project_code` (UNIQUE VARCHAR(8))
- ✅ Criar índice para buscas rápidas

## 🚀 Como Usar

### Para Usuários Logados:
1. Login normal com email/senha
2. Ao salvar um projeto, um **código único é gerado automaticamente**
3. Código aparece na notificação: "✅ Projeto salvo! Código: CXT12345"

### Para Acesso por Código:
1. Na tela de login, clique na aba **"🔑 Código"**
2. Digite o código do projeto (ex: CXT12345)
3. Acesso concedido apenas a esse projeto específico

### Logout:
- Limpa dados de acesso e retorna à tela de login
- Se estava acessando por código, perde o acesso até digitar o código novamente

## 📊 Geração de Código

A função `generateProjectCode()` em `app.js`:
- Gera 5 dígitos aleatórios
- Posiciona "CXT" aleatoriamente (início, meio ou fim)
- Garante unicidade no banco (UNIQUE constraint)

## 🔒 Segurança

- Códigos são UNIQUE no banco de dados
- Usuários com código só acessam aquele projeto
- Usuários logados acessam apenas seus próprios projetos
- Dados isolados por user_id ou project_code

## ✅ Testes Recomendados

1. **Login por email e senha:**
   - Criar um projeto
   - Verificar se o código foi gerado
   - Salvar e carregar o projeto normalmente

2. **Login por código:**
   - Compartilhe o código com outra pessoa
   - Acesse em navegador privado com o código
   - Verifique se ve apenas aquele projeto

3. **Logout:**
   - Faça logout após acessar por código
   - Verifique se retorna à tela de login
   - Acesse novamente com o código

## 📝 Notas Técnicas

- `project_code` é gerado no momento do save
- Não é alterável (considere como ID público do projeto)
- Está em localStorage durante acesso (projectCode)
- Limpo no logout para segurança

## 🐛 Troubleshooting

Se o código não funciona:
1. Verifique se o SQL foi executado (coluna deve existir)
2. Limpe cache do navegador (Ctrl+Shift+R)
3. Verifique console do navegador (F12) para erros
4. Confirme que o código está no formato correto (CXT + 5 dígitos)
