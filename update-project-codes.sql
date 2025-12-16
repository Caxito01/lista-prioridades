-- SQL para atualizar projetos existentes com códigos
-- Execute no SQL Editor do Supabase

-- 1. Atualizar projetos que não têm código com valores aleatórios
UPDATE public.projects 
SET project_code = 
    CASE 
        WHEN RANDOM() < 0.33 THEN 'CXT' || LPAD((FLOOR(RANDOM() * 100000))::TEXT, 5, '0')
        WHEN RANDOM() < 0.66 THEN LPAD((FLOOR(RANDOM() * 100))::TEXT, 2, '0') || 'CXT' || LPAD((FLOOR(RANDOM() * 1000))::TEXT, 3, '0')
        ELSE LPAD((FLOOR(RANDOM() * 100000))::TEXT, 5, '0') || 'CXT'
    END
WHERE project_code IS NULL;

-- 2. Verificar resultado
SELECT COUNT(*) as projetos_com_codigo 
FROM public.projects 
WHERE project_code IS NOT NULL;
