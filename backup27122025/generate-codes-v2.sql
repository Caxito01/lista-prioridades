-- Script para gerar códigos únicos para todos os projetos sem código
-- Cria códigos no padrão: CXT + 5 dígitos em posições aleatórias

BEGIN;

-- Para cada projeto sem código, gera um código único
WITH projects_needing_codes AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM public.projects
  WHERE project_code IS NULL
),
generated_codes AS (
  SELECT 
    id,
    rn,
    CASE 
      WHEN (rn % 3) = 0 THEN 'CXT' || LPAD((rn * 1001)::TEXT, 5, '0')
      WHEN (rn % 3) = 1 THEN LPAD((rn * 1001)::TEXT, 5, '0') || 'CXT'
      ELSE SUBSTRING(LPAD((rn * 1001)::TEXT, 5, '0'), 1, 2) || 'CXT' || SUBSTRING(LPAD((rn * 1001)::TEXT, 5, '0'), 3, 3)
    END as new_code
  FROM projects_needing_codes
)
UPDATE public.projects p
SET project_code = gc.new_code
FROM generated_codes gc
WHERE p.id = gc.id;

-- Verificar resultados
SELECT COUNT(*) as projetos_com_codigo 
FROM public.projects 
WHERE project_code IS NOT NULL;

SELECT id, name, project_code 
FROM public.projects 
WHERE project_code IS NOT NULL
ORDER BY created_at DESC 
LIMIT 5;

COMMIT;
