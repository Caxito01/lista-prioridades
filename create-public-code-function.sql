-- Criar uma função pública para buscar projetos por código
-- Esta função ignora RLS e retorna projetos públicos por código

CREATE OR REPLACE FUNCTION get_project_by_code(p_code VARCHAR(8))
RETURNS TABLE (
  id UUID,
  name TEXT,
  data JSONB,
  user_id UUID,
  project_code VARCHAR(8),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    projects.id,
    projects.name,
    projects.data,
    projects.user_id,
    projects.project_code,
    projects.created_at,
    projects.updated_at
  FROM public.projects
  WHERE UPPER(projects.project_code) = UPPER(p_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão pública para executar a função
GRANT EXECUTE ON FUNCTION get_project_by_code(VARCHAR(8)) TO anon, authenticated, public;

-- Testar a função
SELECT * FROM get_project_by_code('20CXT386');
