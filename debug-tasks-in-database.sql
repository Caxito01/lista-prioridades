-- Script para verificar dados armazenados no Supabase
-- Execute no SQL Editor do Supabase

-- 1. Ver se há projetos com dados
SELECT id, name, project_code, user_id, 
       CASE 
         WHEN data IS NULL THEN 'NULL'
         WHEN data = '{}'::jsonb THEN 'VAZIO'
         ELSE 'COM DADOS'
       END as data_status,
       data -> 'tasks' as tasks_count,
       jsonb_array_length(data -> 'tasks') as num_tarefas
FROM public.projects
ORDER BY created_at DESC
LIMIT 10;

-- 2. Ver especificamente o projeto com código 20CXT386
SELECT id, name, project_code, 
       jsonb_array_length(data -> 'tasks') as num_tarefas,
       data -> 'tasks' as tasks
FROM public.projects
WHERE project_code = '20CXT386';

-- 3. Ver a estrutura dos dados
SELECT id, name, project_code,
       jsonb_pretty(data) as dados_json
FROM public.projects
WHERE project_code = '20CXT386';
