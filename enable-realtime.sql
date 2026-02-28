-- ============================================================
-- HABILITAR REALTIME NA TABELA PROJECTS
-- Execute este SQL no Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Adicionar tabela projects à publicação do Realtime
--    (caso ainda não esteja inclusa)
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- 2. Habilitar REPLICA IDENTITY FULL para que o payload do evento
--    contenha os dados novos (new.data, new.updated_at, etc.)
--    Sem isso, o Realtime envia apenas a PK no payload.
ALTER TABLE projects REPLICA IDENTITY FULL;
