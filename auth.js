// Funções de Autenticação

// Verificar se usuário está logado
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        // Usuário não logado, redirecionar para auth
        window.location.href = 'auth.html';
        return null;
    }
    
    // Verificar se é um novo usuário (primeira vez logando)
    const currentUser = session.user.id;
    const lastUser = localStorage.getItem('lastUserId');
    
    if (lastUser !== currentUser) {
        // Novo usuário - limpar dados locais
        clearUserData();
        localStorage.setItem('lastUserId', currentUser);
    }
    
    return session.user;
}

// Logout
async function handleLogout() {
    if (!confirm('Tem certeza que deseja sair?')) return;
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
        showNotification('❌ Erro ao fazer logout: ' + error.message);
    } else {
        showNotification('✅ Desconectado com sucesso!');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 1000);
    }
}

// Limpar dados do usuário anterior
function clearUserData() {
    evaluatorNames = {
        eval1: 'Avaliador 1',
        eval2: 'Avaliador 2',
        eval3: 'Avaliador 3',
        eval4: 'Avaliador 4'
    };
    tasks = [];
    localStorage.removeItem('evaluatorNames');
    localStorage.removeItem('tasks');
}

// Filtrar projetos apenas do usuário logado
async function loadUserProjects() {
    try {
        // Aguardar um pouco para garantir que a session está pronta
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            console.log('❌ ERRO: Nenhuma sessão encontrada');
            showNotification('❌ Você precisa estar logado!');
            return [];
        }
        
        const userId = session.user.id;
        const userEmail = session.user.email;
        console.log('📊 Carregando projetos para:');
        console.log('   User ID:', userId);
        console.log('   Email:', userEmail);
        
        // Primeiro, vamos ver TODOS os projetos no banco para debug
        const { data: allProjects, error: allError } = await supabase
            .from('projects')
            .select('id, name, user_id, created_at');
        
        console.log('📊 Total de projetos no banco:', allProjects?.length || 0);
        if (allProjects) {
            console.log('📊 Projetos (preview):', allProjects.map(p => ({
                id: p.id.substring(0, 8),
                name: p.name,
                user_id: p.user_id ? p.user_id.substring(0, 8) : 'NULL',
                created_at: p.created_at
            })));
        }
        
        // Agora carregar apenas os do usuário
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.log('❌ ERRO ao carregar projetos do usuário:', error);
            showNotification('❌ Erro ao carregar projetos: ' + error.message);
            return [];
        }
        
        console.log('✅ Projetos encontrados para este usuário:', projects?.length || 0);
        if (projects && projects.length > 0) {
            console.log('✅ Detalhes dos projetos:', projects.map(p => ({ id: p.id.substring(0, 8), name: p.name })));
        }
        return projects || [];
    } catch (error) {
        console.log('❌ ERRO geral em loadUserProjects:', error);
        showNotification('❌ Erro: ' + error.message);
        return [];
    }
}

// Salvar projeto com user_id
async function saveToDatabaseWithAuth() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            showNotification('❌ Você precisa estar logado para salvar!');
            return;
        }
        
        // Buscar projetos do usuário
        const projects = await loadUserProjects();
        
        // Mostrar lista de projetos ou criar novo
        showSaveProjectSelection(projects);
    } catch (error) {
        showNotification('❌ Erro: ' + error.message);
    }
}

// Salvar novo projeto com user_id
async function performSaveProject(projectName) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            console.log('❌ ERRO: Nenhuma sessão ao tentar salvar');
            showNotification('❌ Você precisa estar logado!');
            return;
        }
        
        const userId = session.user.id;
        const userEmail = session.user.email;
        
        console.log('💾 Salvando projeto:');
        console.log('   Nome:', projectName);
        console.log('   User ID:', userId);
        console.log('   Email:', userEmail);
        
        const projectData = {
            evaluator_names: evaluatorNames,
            tasks: tasks
        };
        
        const now = new Date();
        
        const { data, error } = await supabase
            .from('projects')
            .insert([
                {
                    name: projectName,
                    data: projectData,
                    user_id: userId,
                    created_at: now.toISOString()
                }
            ]);
        
        if (error) {
            console.log('❌ ERRO ao inserir projeto:', error);
            showNotification('❌ Erro ao salvar: ' + error.message);
        } else {
            console.log('✅ Projeto salvo com sucesso!');
            console.log('   Dados retornados:', data);
            showNotification('✅ Projeto salvo com sucesso!');
        }
    } catch (error) {
        console.log('❌ ERRO geral em performSaveProject:', error);
        showNotification('❌ Erro: ' + error.message);
    }
}

// Atualizar projeto verificando user_id
async function performUpdateProject(projectId) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            showNotification('❌ Você precisa estar logado!');
            return;
        }
        
        if (!tasks || tasks.length === 0) {
            showNotification('❌ A lista de tarefas está vazia! Adicione pelo menos uma tarefa antes de salvar.');
            return;
        }
        
        const tasksWithEmptyStage = tasks.filter(task => !task.stage || task.stage.trim() === '');
        
        if (tasksWithEmptyStage.length > 0) {
            showNotification(`❌ Há ${tasksWithEmptyStage.length} tarefa(s) sem estágio definido! Preencha antes de salvar.`);
            return;
        }
        
        const projectData = {
            evaluator_names: evaluatorNames,
            tasks: tasks
        };
        
        const { error } = await supabase
            .from('projects')
            .update({ data: projectData, updated_at: new Date().toISOString() })
            .eq('id', projectId)
            .eq('user_id', session.user.id);
        
        if (error) {
            showNotification('❌ Erro ao atualizar: ' + error.message);
        } else {
            showNotification('✅ Projeto atualizado com sucesso!');
            const modal = document.getElementById('saveActionModal');
            if (modal) modal.remove();
        }
    } catch (error) {
        showNotification('❌ Erro: ' + error.message);
    }
}

// Carregar projeto verificando user_id
async function loadFromDatabase() {
    try {
        // Aguardar um pouco para garantir que a session está pronta
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            showNotification('❌ Você precisa estar logado para carregar projetos!');
            return;
        }
        
        const userId = session.user.id;
        console.log('Carregando projetos do usuário:', userId);
        
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) {
            console.log('Erro ao carregar:', error);
            showNotification('Erro ao carregar: ' + error.message);
            return;
        }
        
        console.log('Projetos encontrados:', projects?.length);
        
        if (!projects || projects.length === 0) {
            showNotification('Nenhum projeto encontrado.');
            return;
        }
        
        showProjectSelection(projects);
    } catch (error) {
        console.log('Erro geral:', error);
        showNotification('Erro: ' + error.message);
    }
}
