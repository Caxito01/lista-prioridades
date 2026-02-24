## Plan: Reverter placeholder do e-mail

Você quer tirar o `suporte@caxito.com.br` e voltar para o placeholder genérico anterior.

**O que está hoje**
- Em auth.html, o campo de login está assim:
  - `placeholder="suporte@caxito.com.br"`
- O placeholder original muito provavelmente era o mesmo usado no cadastro, em auth.html:
  - `placeholder="seu@email.com"`

**Passos**

1. Abrir auth.html no VS Code e localizar o campo:
   - `<input type="email" id="loginEmail" ... >`.
2. Alterar apenas o atributo `placeholder` desse campo:
   - De: `placeholder="suporte@caxito.com.br"`
   - Para: `placeholder="seu@email.com"`
3. Salvar o arquivo.
4. No terminal, na pasta do projeto:
   - Ver diff: `git diff auth.html`
   - Adicionar: `git add auth.html`
   - Commitar: `git commit -m "Reverter placeholder de email de login para valor padrão"`
5. Se quiser enviar para o GitHub:
   - `git push`
