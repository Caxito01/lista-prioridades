-- ============================================================
-- Admin: permissão para ver e deletar TODOS os projetos
-- Execute no Supabase > SQL Editor
-- ============================================================

-- Adicionar política SELECT para admin ver todos os projetos
DROP POLICY IF EXISTS "admin_projects_select" ON public.projects;
CREATE POLICY "admin_projects_select" ON public.projects
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id
      OR public.is_admin()
    )
  );

-- Adicionar política DELETE para admin deletar qualquer projeto
DROP POLICY IF EXISTS "admin_projects_delete" ON public.projects;
CREATE POLICY "admin_projects_delete" ON public.projects
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id
      OR public.is_admin()
    )
  );

-- Remover políticas antigas que possam colidir
DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;

-- Verificação final
SELECT tablename, policyname, cmd FROM pg_policies
WHERE tablename = 'projects'
ORDER BY cmd;
