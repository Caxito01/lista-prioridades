-- Sincroniza todos os usuários da tabela auth.users
-- para a tabela pública public.users usada pela página /users.

-- Garante que a tabela public.users existe (não recria se já existir)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  CONSTRAINT users_id_fk FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (id)
);

-- Copia / atualiza todos os registros existentes em auth.users
INSERT INTO public.users (id, email, created_at)
SELECT id, email, created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    created_at = EXCLUDED.created_at;

-- Opcional: atualizar last_login com a última data conhecida em auth.users, se existir
-- (alguns projetos têm essa coluna, outros não; por isso deixamos comentado)
-- UPDATE public.users u
-- SET last_login = a.last_sign_in_at
-- FROM auth.users a
-- WHERE u.id = a.id
--   AND a.last_sign_in_at IS NOT NULL;

-- Depois de executar este script no SQL Editor do Supabase,
-- a página /users mostrará todos os usuários para o admin
-- (desde que a RLS de admin já esteja configurada via update-users-rls-admin.sql).