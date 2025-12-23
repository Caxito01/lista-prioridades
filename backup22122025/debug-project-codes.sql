-- SQL para verificar códigos de projeto no banco
-- Execute no SQL Editor do Supabase para debugar

-- 1. Ver TODOS os projetos e seus códigos
SELECT id, name, project_code, user_id, created_at 
FROM public.projects 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Verificar se há algum projeto com o código 09CXT022
SELECT id, name, project_code, user_id 
FROM public.projects 
WHERE project_code = '09CXT022';

-- 3. Ver quantidade de projetos com e sem código
SELECT 
  COUNT(*) as total_projetos,
  COUNT(project_code) as com_codigo,
  COUNT(*) - COUNT(project_code) as sem_codigo
FROM public.projects;

-- 4. Ver todos os códigos únicos
SELECT DISTINCT project_code 
FROM public.projects 
WHERE project_code IS NOT NULL
ORDER BY project_code;
