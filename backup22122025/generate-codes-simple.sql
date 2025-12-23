-- Script simples e garantido para gerar códigos únicos
-- Cada projeto recebe um código CXT + número sequencial

DO $$
DECLARE
  v_project_record RECORD;
  v_counter INT := 1;
  v_code VARCHAR(8);
  v_position INT;
BEGIN
  -- Para cada projeto sem código
  FOR v_project_record IN 
    SELECT id FROM public.projects 
    WHERE project_code IS NULL 
    ORDER BY created_at ASC
  LOOP
    -- Gera código no formato CXTxxxxx ou xCXTxxxx ou xxxCXTxx
    v_position := (v_counter % 3);
    v_code := LPAD(v_counter::TEXT, 5, '0');
    
    IF v_position = 0 THEN
      v_code := 'CXT' || v_code;
    ELSIF v_position = 1 THEN
      v_code := v_code || 'CXT';
    ELSE
      v_code := SUBSTRING(v_code, 1, 2) || 'CXT' || SUBSTRING(v_code, 3, 5);
    END IF;
    
    -- Atualiza o projeto com o novo código
    UPDATE public.projects 
    SET project_code = v_code
    WHERE id = v_project_record.id;
    
    RAISE NOTICE 'Projeto % atualizado com código: %', v_project_record.id, v_code;
    
    v_counter := v_counter + 1;
  END LOOP;
  
  RAISE NOTICE 'Total de códigos gerados: %', (v_counter - 1);
END $$;

-- Verificar resultado
SELECT id, name, project_code FROM public.projects WHERE project_code IS NOT NULL ORDER BY created_at DESC LIMIT 10;
