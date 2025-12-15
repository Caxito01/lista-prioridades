-- SQL para adicionar coluna project_code na tabela projects
-- Execute OBRIGATORIAMENTE isso no SQL Editor do Supabase
-- 
-- PASSOS:
-- 1. Acesse: https://app.supabase.com
-- 2. Selecione seu projeto (vzfhsfrfucqoloecnvvu)
-- 3. Clique em "SQL Editor" (lado esquerdo)
-- 4. Clique em "New Query"
-- 5. Cole TUDO abaixo e clique em "Run" (Ctrl+Enter)

-- 1. Adicionar coluna project_code (VARCHAR 8 caracteres, UNIQUE)
ALTER TABLE public.projects 
ADD COLUMN project_code VARCHAR(8) UNIQUE;

-- 2. Criar índice para busca rápida
CREATE INDEX idx_projects_code ON public.projects(project_code);

-- 3. Pronto! Agora a coluna está disponível e os projetos salvos terão código
-- O código é gerado automaticamente no formato: CXT + 5 números
