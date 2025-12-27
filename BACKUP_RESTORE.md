# Backup e Restauração

## Backup atual

- Pasta de backup: `backup27122025`
- Data de criação: 27/12/2025
- Conteúdo: cópia completa do projeto na raiz, exceto a pasta `.git` e outros backups.

## Como restaurar o backup27122025

1. Abra o terminal na pasta do projeto:
   ```powershell
   cd C:\Lista_Prioridade_Projetos
   ```

2. Copie o conteúdo do backup para a raiz (sobrescrevendo tudo):
   ```powershell
   Copy-Item -Path "backup27122025\*" -Destination "." -Recurse -Force
   ```

3. (Opcional, se estiver usando Git) Salve essa restauração no repositório:
   ```powershell
   git add -A
   git commit -m "restore: Restaurar backup27122025"
   git push origin main
   ```

Após isso, o projeto volta exatamente para o estado salvo em `backup27122025`.
