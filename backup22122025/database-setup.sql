-- SQL para adicionar autenticação à tabela projects

-- Adicionar coluna user_id à tabela projects
ALTER TABLE projects ADD COLUMN user_id UUID NOT NULL DEFAULT auth.uid();

-- Adicionar constraint para relacionar com a tabela auth.users
ALTER TABLE projects 
ADD CONSTRAINT projects_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar índice para melhor performance
CREATE INDEX projects_user_id_idx ON projects(user_id);

-- Atualizar RLS policies para filtrar por usuário

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Anyone can insert projects" ON projects;
DROP POLICY IF EXISTS "Anyone can select projects" ON projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON projects;

-- Criar novas políticas com autenticação

-- Usuários autenticados podem inserir projetos
CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Usuários autenticados podem ver apenas seus próprios projetos
CREATE POLICY "Users can select own projects" ON projects
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Usuários autenticados podem atualizar apenas seus próprios projetos
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários autenticados podem deletar apenas seus próprios projetos
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE 
  USING (auth.uid() = user_id);
