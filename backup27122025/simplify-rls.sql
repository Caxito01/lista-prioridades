-- EXECUTE NO SUPABASE SQL EDITOR - Simplificar RLS policies para testar

-- 1. Remover todas as policies existentes
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- 2. Criar policies MUITO SIMPLES - permitir tudo para usuários autenticados
CREATE POLICY "Allow authenticated users insert" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users select" ON projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users update" ON projects FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users delete" ON projects FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Verificar as policies
SELECT * FROM pg_policies WHERE tablename = 'projects';