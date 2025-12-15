-- SQL para adicionar coluna project_code na tabela projects
-- Execute isso no SQL Editor do Supabase

-- 1. Adicionar coluna project_code (se ainda não existir)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_code VARCHAR(8) UNIQUE;

-- 2. Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(project_code);

-- 3. Atualizar projetos existentes com códigos aleatórios (OPCIONAL)
-- Descomente a linha abaixo apenas se quiser gerar códigos para projetos existentes
-- UPDATE projects 
-- SET project_code = CASE 
--     WHEN RANDOM() < 0.33 THEN 'CXT' || LPAD(CAST(FLOOR(RANDOM() * 100000) AS TEXT), 5, '0')
--     WHEN RANDOM() < 0.66 THEN LPAD(CAST(FLOOR(RANDOM() * 10) AS TEXT), 2, '0') || 'CXT' || LPAD(CAST(FLOOR(RANDOM() * 1000) AS TEXT), 3, '0')
--     ELSE LPAD(CAST(FLOOR(RANDOM() * 100000) AS TEXT), 5, '0') || 'CXT'
-- END
-- WHERE project_code IS NULL;
