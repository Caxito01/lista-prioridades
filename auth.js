// Versão de build para depuração em produção
console.log('auth.js v1735331600 carregado - PLACEHOLDERS');

// Declaração antecipada das funções para exposição global
let checkAuth, saveToDatabaseWithAuth, loadFromDatabase, performUpdateProject;

// Expor funções ANTES de definir para garantir disponibilidade
window.checkAuth = null;
window.saveToDatabaseWithAuth = null;
window.loadFromDatabase = null;
window.performUpdateProject = null;

console.log('📋 Placeholders criados no window');

// Verificar se usuário está logado
checkAuth = async function() {
    console.log('🔐 Verificando autenticação...');
    
    await window.initSupabase();
    const client = window.getClient();
    if (!client) {
        console.error('❌ Cliente não inicializou');
        return null;
    }
    
    // Verificar acesso por código
    const projectCode = localStorage.getItem('projectCode');
    const projectId = localStorage.getItem('projectId');
    
    if (projectCode && projectId) {
        console.log('✅ Código de acesso detectado');
        displayProjectCode(projectCode);
        return { id: 'code-access', email: projectCode };
    }
    
    try {
        const { data, error: sessionError } = await client.auth.getSession();
        const session = data?.session;
        
        if (sessionError || !session) {
            console.log('⚠️ Sem sessão, redirecionando...');
            window.location.href = 'auth.html';
            return null;
        }
        
        const currentUser = session.user.id;
        const lastUser = localStorage.getItem('lastUserId');
        
        if (lastUser !== currentUser) {
            clearUserData();
            localStorage.setItem('lastUserId', currentUser);
        }
        
        return session.user;
    } catch (error) {
        console.error('❌ Erro:', error);
        return null;
    }
};

// Expor imediatamente
window.checkAuth = checkAuth;

// Exibir código do projeto na página
function displayProjectCode(code) {
    const banner = document.getElementById('projectCodeBanner');
    const display = document.getElementById('projectCodeDisplay');
    if (banner && display) {
        banner.style.display = 'block';
        display.textContent = code;
        console.log('✅ Código exibido na página:', code);
    } else {
        console.warn('⚠️ Elementos de código não encontrados');
    }
}

// Logout
async function handleLogout() {
    showLogoutModal();
}

// Modal de confirmação de logout
function showLogoutModal() {
    const logoutModal = document.createElement('div');
    logoutModal.id = 'logoutModal';
    logoutModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    `;
    
    logoutModal.innerHTML = `
        <div style="background: white; border-radius: 15px; padding: 30px; max-width: 400px; width: 90%; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); text-align: center;">
            <h2 style="color: #f44336; margin-bottom: 20px; font-size: 1.5rem;">⚠️ Confirmar Saída</h2>
            <p style="color: #666; margin-bottom: 30px; font-size: 1rem; line-height: 1.5;">Tem certeza que deseja sair?</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="confirmLogout()" style="flex: 1; padding: 12px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; transition: all 0.3s;"
                onmouseover="this.style.background='#d32f2f'" onmouseout="this.style.background='#f44336'">Sair</button>
                <button onclick="closeLogoutModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; transition: all 0.3s;"
                onmouseover="this.style.background='#5a6268'" onmouseout="this.style.background='#6c757d'">Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(logoutModal);
    
    logoutModal.onclick = (e) => {
        if (e.target === logoutModal) closeLogoutModal();
    };
}

function confirmLogout() {
    closeLogoutModal();
    performLogout();
}

async function performLogout() {
    try {
        console.log('🔐 Logout...');
        
        const projectCode = localStorage.getItem('projectCode');
        if (!projectCode) {
            await window.initSupabase();
            const client = window.getClient();
            if (client && client.auth) {
                await client.auth.signOut().catch(e => console.log('⚠️ Erro:', e?.message));
                console.log('✅ Supabase logout');
            }
        }
    } catch (e) {
        console.log('⚠️ Erro geral:', e?.message);
    }
    
    localStorage.clear();
    console.log('✅ Desconectado');
    showNotification('✅ Desconectado com sucesso!');
    
    setTimeout(() => {
        window.location.replace('auth.html?t=' + Date.now());
    }, 1000);
}

function closeLogoutModal() {
    const logoutModal = document.getElementById('logoutModal');
    if (logoutModal) logoutModal.remove();
}

// Limpar dados do usuário anterior
function clearUserData() {
    if (window.evaluatorNames) {
        window.evaluatorNames = {
            eval1: 'Avaliador 1',
            eval2: 'Avaliador 2',
            eval3: 'Avaliador 3',
            eval4: 'Avaliador 4'
        };
    }
    if (window.tasks) {
        window.tasks = [];
    }
    localStorage.removeItem('evaluatorNames');
    localStorage.removeItem('tasks');
}

// Filtrar projetos apenas do usuário logado
async function loadUserProjects() {
    try {
        console.log('🔄 Carregando projetos do usuário...');
        
        // Aguardar inicialização do Supabase
        await window.initSupabase();
        const client = window.getClient();
        
        if (!client) {
            console.error('❌ Supabase client não inicializou');
            showNotification('❌ Erro ao conectar com o servidor');
            return [];
        }
        
        // Verificar se há acesso por código
        const projectCode = localStorage.getItem('projectCode');
        if (projectCode) {
            console.log('🔑 Tentando carregar projeto com código:', projectCode);
            
            try {
                // Criar uma Promise com timeout para a requisição RPC
                const rpcPromise = client.rpc('get_project_by_code', { p_code: projectCode });
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout RPC')), 5000)
                );
                
                const { data: project, error } = await Promise.race([rpcPromise, timeoutPromise]);
                
                if (!error && project && project.length > 0) {
                    console.log('✅ Projeto acessado por código:', projectCode, project[0].name);
                    return [project[0]];
                }
            } catch (rpcError) {
                console.log('⚠️ Função RPC falhou:', rpcError.message);
            }
            
            // Fallback: query direta com timeout
            console.log('⚠️ Tentando fallback direto...');
            try {
                const fallbackPromise = client
                    .from('projects')
                    .select('*')
                    .eq('project_code', projectCode)
                    .limit(1);
                    
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout fallback')), 5000)
                );
                
                const { data: fallbackProject, error: fallbackError } = await Promise.race([fallbackPromise, timeoutPromise]);
                
                if (!fallbackError && fallbackProject && fallbackProject.length > 0) {
                    console.log('✅ Projeto acessado por código (fallback):', projectCode);
                    return fallbackProject;
                }
            } catch (fallbackErr) {
                console.log('❌ Erro no fallback:', fallbackErr.message);
            }
            
            console.log('❌ Projeto não encontrado com código:', projectCode);
            return [];
        }
        
        console.log('🔐 Verificando sessão...');
        const { data, error: sessionError } = await client.auth.getSession();
        const session = data?.session;
        
        if (sessionError) {
            console.log('❌ Erro ao obter sessão:', sessionError.message);
            showNotification('❌ Erro ao verificar autenticação: ' + sessionError.message);
            return [];
        }
        
        if (!session) {
            console.log('❌ Nenhuma sessão encontrada');
            showNotification('❌ Você precisa estar logado!');
            return [];
        }
        
        const userId = session.user.id;
        const userEmail = session.user.email;
        console.log('📊 Carregando projetos para:');
        console.log('   User ID:', userId);
        console.log('   Email:', userEmail);
        
        // Carregar APENAS os projetos do usuário logado
        const { data: projects, error } = await client
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
saveToDatabaseWithAuth = async function() {
    try {
        // Mostrar feedback imediato ao usuário
        showNotification('⏳ Carregando...');
        
        await window.initSupabase();
        const client = window.getClient();
        
        if (!client) {
            showNotification('❌ Erro ao conectar com o servidor');
            return;
        }
        
        // Verificar se está acessando por código
        const projectCode = localStorage.getItem('projectCode');
        const projectId = localStorage.getItem('projectId');
        
        if (projectCode && projectId) {
            // Usuário acessou via código - perguntar se quer atualizar ou criar novo
            try {
                const projectsPromise = loadUserProjects();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao carregar projetos')), 10000)
                );
                
                const projects = await Promise.race([projectsPromise, timeoutPromise]);
                
                if (projects && projects.length > 0) {
                    showSaveProjectSelection(projects);
                } else {
                    showNotification('❌ Não foi possível carregar o projeto. Tente novamente.');
                }
            } catch (timeoutError) {
                console.error('❌ Timeout:', timeoutError);
                showNotification('❌ Tempo esgotado ao carregar projeto. Verifique sua conexão.');
            }
            return;
        }
        
        const { data, error: sessionError } = await client.auth.getSession();
        const session = data?.session;
        
        if (sessionError) {
            showNotification('❌ Erro ao verificar autenticação: ' + sessionError.message);
            return;
        }
        
        if (!session) {
            showNotification('❌ Você precisa estar logado para salvar!');
            return;
        }
        
        // Buscar projetos do usuário com timeout
        try {
            const projectsPromise = loadUserProjects();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout ao carregar projetos')), 10000)
            );
            
            const projects = await Promise.race([projectsPromise, timeoutPromise]);
            showSaveProjectSelection(projects);
        } catch (timeoutError) {
            console.error('❌ Timeout:', timeoutError);
            showNotification('❌ Tempo esgotado. Verifique sua conexão.');
        }
    } catch (error) {
        console.error('❌ Erro em saveToDatabaseWithAuth:', error);
        showNotification('❌ Erro: ' + error.message);
    }
};

// Expor imediatamente
window.saveToDatabaseWithAuth = saveToDatabaseWithAuth;
console.log('✅ saveToDatabaseWithAuth exposta no window');

// Salvar novo projeto com user_id
async function performSaveProject(projectName) {
    try {
        // Inicializar Supabase se não estiver
        if (!window.getSupabase()) {
            window.initSupabaseSimple();
        }
        
        const client = window.getSupabase();
        
        if (!client) {
            showNotification('❌ Erro ao conectar com o servidor');
            return;
        }
        
        const { data, error: sessionError } = await client.auth.getSession();
        const session = data?.session;
        
        if (sessionError) {
            console.log('❌ Erro ao verificar sessão:', sessionError.message);
            showNotification('❌ Erro ao verificar autenticação: ' + sessionError.message);
            return;
        }
        
        if (!session) {
            console.log('❌ Nenhuma sessão ao tentar salvar');
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
        
        const { data: insertData, error } = await client
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
            console.log('   Dados retornados:', insertData);
            showNotification('✅ Projeto salvo com sucesso!');
        }
    } catch (error) {
        console.log('❌ ERRO geral em performSaveProject:', error);
        showNotification('❌ Erro: ' + error.message);
    }
}

// Atualizar projeto verificando user_id
performUpdateProject = async function(projectId) {
    console.log('🔄 performUpdateProject INICIADO', projectId);
    
    // Prevenir múltiplas execuções simultâneas
    if (window._isUpdating) {
        console.warn('⚠️ Atualização já em andamento, ignorando...');
        return;
    }
    window._isUpdating = true;
    
    try {
        // Mostrar feedback imediato
        console.log('📢 Mostrando notificação...');
        showNotification('⏳ Atualizando projeto...');
        
        console.log('🔌 Inicializando Supabase...');
        await window.initSupabase();
        
        console.log('🔍 Buscando client...');
        const client = window.getClient();
        
        if (!client) {
            console.error('❌ Client não disponível');
            showNotification('❌ Erro ao conectar com o servidor');
            window._isUpdating = false;
            return;
        }
        
        console.log('✅ Client obtido');
        
        // Verificar se está acessando por código
        const projectCode = localStorage.getItem('projectCode');
        const projectIdFromCode = localStorage.getItem('projectId');
        
        console.log('📦 Dados localStorage:', { projectCode, projectIdFromCode, projectId });
        
        // Se acessou por código, usar o projectId do localStorage
        const finalProjectId = (projectCode && projectIdFromCode) ? projectIdFromCode : projectId;
        console.log('🎯 ID final do projeto:', finalProjectId);
        
        // Validar se há sessão (apenas para usuários autenticados)
        let userId = null;
        if (!projectCode) {
            console.log('🔐 Verificando sessão (sem código)...');
            const { data, error: sessionError } = await client.auth.getSession();
            const session = data?.session;
            
            if (sessionError) {
                console.error('❌ Erro na sessão:', sessionError);
                showNotification('❌ Erro ao verificar autenticação: ' + sessionError.message);
                window._isUpdating = false;
                return;
            }
            
            if (!session) {
                console.error('❌ Sem sessão');
                showNotification('❌ Você precisa estar logado!');
                window._isUpdating = false;
                return;
            }
            
            userId = session.user.id;
            console.log('✅ Sessão válida, userId:', userId);
        } else {
            console.log('🔑 Acesso por código, pulando verificação de sessão');
        }
        
        console.log('📋 Validando tasks...');
        const tasks = window.tasks || [];
        const evaluatorNames = window.evaluatorNames || {};
        
        console.log('📦 Tasks do window:', tasks.length);
        console.log('📦 EvaluatorNames do window:', evaluatorNames);
        
        if (!tasks || tasks.length === 0) {
            console.error('❌ Lista de tarefas vazia');
            showNotification('❌ A lista de tarefas está vazia! Adicione pelo menos uma tarefa antes de salvar.');
            window._isUpdating = false;
            return;
        }
        
        console.log('✅ Tasks válidas:', tasks.length);
        
        const tasksWithEmptyStage = tasks.filter(task => !task.stage || task.stage.trim() === '');
        
        if (tasksWithEmptyStage.length > 0) {
            console.error('❌ Tasks sem estágio:', tasksWithEmptyStage.length);
            showNotification(`❌ Há ${tasksWithEmptyStage.length} tarefa(s) sem estágio definido! Preencha antes de salvar.`);
            window._isUpdating = false;
            return;
        }
        
        console.log('📦 Preparando dados do projeto...');
        const projectData = {
            evaluator_names: evaluatorNames,
            tasks: tasks
        };
        
        console.log('🔄 Montando query de atualização...');
        // Atualizar com ou sem filtro de user_id dependendo do tipo de acesso
        let updateQuery = client
            .from('projects')
            .update({ data: projectData, updated_at: new Date().toISOString() })
            .eq('id', finalProjectId);
        
        // Se não acessou por código, filtrar por user_id
        if (userId) {
            console.log('🔒 Adicionando filtro user_id:', userId);
            updateQuery = updateQuery.eq('user_id', userId);
        } else {
            console.log('🔓 Sem filtro user_id (acesso por código)');
        }
        
        console.log('🚀 Executando atualização...');
        const { error } = await updateQuery;
        
        console.log('📥 Resposta recebida');
        
        if (error) {
            console.error('❌ Erro do Supabase:', error);
            showNotification('❌ Erro ao atualizar: ' + error.message);
        } else {
            console.log('✅ Atualização bem-sucedida!');
            showNotification('✅ Projeto atualizado com sucesso!');
            const modal = document.getElementById('saveActionModal');
            if (modal) {
                console.log('🚪 Fechando modal');
                modal.remove();
            }
        }
    } catch (error) {
        console.error('❌ ERRO CAPTURADO em performUpdateProject:', error);
        console.error('Stack trace:', error.stack);
        showNotification('❌ Erro: ' + error.message);
    } finally {
        // Sempre liberar o lock
        window._isUpdating = false;
        console.log('🔓 Lock liberado');
    }
};

// Expor imediatamente
window.performUpdateProject = performUpdateProject;
console.log('✅ performUpdateProject exposta no window');

// Carregar projeto verificando user_id
loadFromDatabase = async function() {
    try {
        console.log('📂 Carregando projetos do banco de dados...');
        
        // Garante inicialização do SDK e do cliente
        await window.initSupabase();
        const client = window.getClient();
        
        if (!client) {
            showNotification('❌ Erro: Supabase não inicializado');
            return;
        }
        // Verificações adicionais para evitar TypeError em getSession
        if (!client.auth || typeof client.auth.getSession !== 'function') {
            console.warn('⚠️ client.auth indisponível. client=', client);
            showNotification('❌ Erro: autenticação não disponível. Recarregue a página.');
            return;
        }
        
        console.log('✅ Cliente Supabase obtido');
        
        const { data, error: sessionError } = await client.auth.getSession();
        const session = data?.session;
        
        if (sessionError) {
            showNotification('❌ Erro ao verificar autenticação: ' + sessionError.message);
            return;
        }
        
        if (!session) {
            showNotification('❌ Você precisa estar logado para carregar projetos!');
            return;
        }
        
        const userId = session.user.id;
        const userEmail = session.user.email;
        
        console.log('📂 CARREGANDO PROJETOS DO USUÁRIO:');
        console.log('   User ID:', userId);
        console.log('   Email:', userEmail);
        
        // Carregar APENAS os projetos deste usuário (filtrado por user_id)
        const { data: projects, error } = await client
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) {
            console.log('❌ ERRO ao carregar projetos:', error);
            showNotification('Erro ao carregar: ' + error.message);
            return;
        }
        
        console.log('✅ Projetos encontrados para este usuário:', projects?.length || 0);
        
        if (projects && projects.length > 0) {
            console.log('✅ Detalhes dos projetos:');
            projects.forEach(p => {
                console.log(`   - ${p.name} (ID: ${p.id.substring(0, 8)}, User: ${p.user_id.substring(0, 8)})`);
            });
        }
        
        if (!projects || projects.length === 0) {
            showNotification('Nenhum projeto encontrado para sua conta.');
            return;
        }
        
        showProjectSelection(projects);
    } catch (error) {
        console.log('❌ ERRO geral em loadFromDatabase:', error);
        showNotification('Erro: ' + error.message);
    }
};

// Expor imediatamente
window.loadFromDatabase = loadFromDatabase;
console.log('✅ loadFromDatabase exposta no window');

// Mostrar notificação
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 15px 25px; border-radius: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 10000; animation: fadeIn 0.3s ease-in;';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Confirmação final de exposição (as funções já foram expostas imediatamente após definição)
console.log('📋 Funções do auth.js disponíveis:', {
    checkAuth: typeof window.checkAuth,
    saveToDatabaseWithAuth: typeof window.saveToDatabaseWithAuth,
    performUpdateProject: typeof window.performUpdateProject,
    loadFromDatabase: typeof window.loadFromDatabase
});
