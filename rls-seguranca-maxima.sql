-- ============================================================
-- RLS - SEGURANÇA MÁXIMA
-- Execute este arquivo inteiro no Supabase > SQL Editor
-- ============================================================

-- ==========================
-- TABELA: projects
-- ==========================

-- 1. Garantir que RLS está ativo
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas antigas (qualquer nome)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'projects' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.projects';
  END LOOP;
END $$;

-- 3. Bloquear acesso anônimo completamente (sem exceções)

-- SELECT: só vê os próprios projetos, nunca de outros usuários
CREATE POLICY "projects_select" ON public.projects
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- INSERT: só insere com seu próprio user_id
CREATE POLICY "projects_insert" ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- UPDATE: só atualiza os próprios projetos, e não pode mudar o user_id
CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- DELETE: só deleta os próprios projetos
CREATE POLICY "projects_delete" ON public.projects
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);


-- ==========================
-- TABELA: users (public)
-- ==========================

-- 1. Garantir que RLS está ativo
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas antigas
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.users';
  END LOOP;
END $$;

-- 3. SELECT: usuário só vê o próprio registro
CREATE POLICY "users_select" ON public.users
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- 4. INSERT: o trigger cria o registro (não precisa de policy de INSERT para o usuário)
-- Mas permitir apenas se o uid bate (segurança extra)
CREATE POLICY "users_insert" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

-- 5. UPDATE: usuário só atualiza o próprio registro
CREATE POLICY "users_update" ON public.users
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

-- 6. DELETE: usuário NÃO pode deletar a própria conta pela API (só pelo painel admin)
-- (não criar política de DELETE = bloqueado por padrão)


-- ==========================
-- VERIFICAÇÃO FINAL
-- ==========================
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('projects', 'users')
ORDER BY tablename, cmd;
