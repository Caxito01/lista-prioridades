-- Verificar os projetos salvos e ver o user_id de cada um

SELECT id, name, user_id, created_at 
FROM projects 
ORDER BY created_at DESC 
LIMIT 20;

-- Ver quantos projetos cada usuário tem
SELECT user_id, COUNT(*) as total_projetos
FROM projects
WHERE user_id IS NOT NULL
GROUP BY user_id;