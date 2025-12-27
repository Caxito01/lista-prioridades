-- EXECUTE NO SUPABASE SQL EDITOR PARA CORRIGIR AS RLS POLICIES

-- 1. Primeiro remover as policies antigas problemáticas
DROP POLICY IF EXISTS "insert_own_project" ON projects;
DROP POLICY IF EXISTS "select_own_project" ON projects;
DROP POLICY IF EXISTS "update_own_project" ON projects;
DROP POLICY IF EXISTS "delete_own_project" ON projects;

-- 2. Criar policies NOVAS e CORRETAS

-- Permitir INSERT para usuários autenticados (salva com seu próprio user_id)
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Permitir SELECT apenas dos próprios projetos
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Permitir UPDATE apenas dos próprios projetos
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permitir DELETE apenas dos próprios projetos
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Deletar os projetos antigos que têm user_id NULL (que não podem ser identificados)
DELETE FROM projects WHERE user_id IS NULL;

-- 4. Verificar resultado
SELECT COUNT(*) as total_projetos FROM projects;
SELECT COUNT(*) as projetos_null FROM projects WHERE user_id IS NULL;

-- 5. Também fazer user_id NOT NULL para evitar problemas no futuro
ALTER TABLE projects ALTER COLUMN user_id SET NOT NULL;