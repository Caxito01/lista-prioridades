-- SQL para gerar códigos únicos para projetos existentes
-- Execute no SQL Editor do Supabase

-- Primeiro, vamos ver quantos projetos sem código existem
SELECT COUNT(*) as projetos_sem_codigo
FROM public.projects 
WHERE project_code IS NULL;

-- Agora, vamos atualizar cada um com um código único
-- Usando ROW_NUMBER para garantir unicidade
WITH numbered_projects AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM public.projects
    WHERE project_code IS NULL
)
UPDATE public.projects p
SET project_code = (
    SELECT 
        CASE 
            WHEN (np.rn % 3) = 1 THEN 'CXT' || LPAD((np.rn)::TEXT, 5, '0')
            WHEN (np.rn % 3) = 2 THEN LPAD((np.rn)::TEXT, 2, '0') || 'CXT' || LPAD((np.rn + 1000)::TEXT, 3, '0')
            ELSE LPAD((np.rn + 10000)::TEXT, 5, '0') || 'CXT'
        END
    FROM numbered_projects np
    WHERE np.id = p.id
)
FROM numbered_projects
WHERE numbered_projects.id = p.id;

-- Verificar resultado
SELECT id, name, project_code
FROM public.projects
WHERE project_code IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
