-- ============================================================
-- CORREÇÃO: Permissões de Admin para tabela users
-- Execute no Supabase > SQL Editor
-- ============================================================

-- 1. Criar função auxiliar que verifica se o usuário logado é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'carloscaxito@yahoo.com.br'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Atualizar política SELECT da tabela users:
--    - Usuário comum: vê apenas o próprio registro
--    - Admin: vê todos os registros
DROP POLICY IF EXISTS "users_select" ON public.users;
CREATE POLICY "users_select" ON public.users
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = id
      OR public.is_admin()
    )
  );

-- 3. Adicionar política DELETE para o admin poder excluir usuários
--    (Admin pode excluir qualquer usuário, exceto a si mesmo)
DROP POLICY IF EXISTS "users_delete" ON public.users;
CREATE POLICY "users_delete" ON public.users
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND public.is_admin()
    AND auth.uid() != id
  );

-- 4. Verificação final
SELECT tablename, policyname, cmd FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd;
