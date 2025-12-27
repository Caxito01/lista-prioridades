-- Comando para executar no SQL Editor do Supabase

-- 1. Primeiro, vamos ver o que está no banco
SELECT id, name, user_id, created_at FROM projects LIMIT 10;

-- 2. Ver quantos projetos têm user_id NULL
SELECT COUNT(*) as projetos_sem_user_id FROM projects WHERE user_id IS NULL;

-- 3. Ver a estrutura da tabela
-- \d projects;