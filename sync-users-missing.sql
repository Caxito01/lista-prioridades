-- ============================================================
-- Sincronizar usuários do auth.users para public.users
-- Execute no Supabase > SQL Editor
-- ============================================================

-- Inserir todos os usuários do auth que ainda não estão em public.users
INSERT INTO public.users (id, email, created_at)
SELECT id, email, created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;

-- Verificar resultado
SELECT u.email, u.created_at
FROM public.users u
ORDER BY u.created_at DESC;
