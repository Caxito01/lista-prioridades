-- Atualiza RLS da tabela public.users para permitir que
-- o usuário com email carloscaxito@yahoo.com.br veja e delete todos.

-- 1) Função helper para identificar admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = auth.uid()
      AND u.email = 'carloscaxito@yahoo.com.br'
  );
$$;

-- 2) Ativar RLS (caso ainda não esteja)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3) Limpar políticas antigas relevantes
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
DROP POLICY IF EXISTS "Users can delete own record" ON public.users;
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin can update all users" ON public.users;
DROP POLICY IF EXISTS "Admin can delete all users" ON public.users;

-- 4) Política de SELECT: APENAS o admin pode ver usuários
CREATE POLICY "Admin can view users" ON public.users
FOR SELECT
USING (
  public.is_admin()
);

-- 5) Política de UPDATE: APENAS o admin pode atualizar usuários
CREATE POLICY "Admin can update users" ON public.users
FOR UPDATE
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

-- 6) Política de DELETE: APENAS o admin pode deletar usuários
CREATE POLICY "Admin can delete users" ON public.users
FOR DELETE
USING (
  public.is_admin()
);

-- Depois de rodar este script no SQL Editor do Supabase,
-- o email carloscaxito@yahoo.com.br poderá listar e deletar
-- todos os registros em public.users via client (anon key).
