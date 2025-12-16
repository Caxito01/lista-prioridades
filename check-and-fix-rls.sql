-- Verificar e ajustar RLS para leitura por código
-- Execute no Supabase SQL Editor

-- 1. Verificar políticas atuais
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'projects';

-- 2. Se houver bloqueio, criar política que permite leitura pública por código
-- ATENÇÃO: Execute APENAS se o passo 1 mostrar que RLS está bloqueando!

-- Permitir leitura pública da tabela projects para busca por código
CREATE POLICY "Allow public read by code" ON public.projects
FOR SELECT
USING (TRUE);

-- Permitir que usuários autenticados leiam seus próprios projetos
CREATE POLICY "Allow users read own projects" ON public.projects
FOR SELECT
USING (auth.uid() = user_id);

-- Ver resultado
SELECT * FROM public.projects LIMIT 1;
