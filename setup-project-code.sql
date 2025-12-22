-- -- SQL para adicionar coluna project_code na tabela projects
-- 1. Adicionar coluna project_code do tipo VARCHAR(8) com valor único
ALTER TABLE public.projects 
ADD COLUMN project_code VARCHAR(8) UNIQUE;

-- 2. Criar índice para busca rápida
CREATE INDEX idx_projects_code ON public.projects(project_code);

-- 3. Pronto! Agora a coluna está disponível e os projetos salvos terão código
-- O código é gerado automaticamente no formato: CXT + 5 números
