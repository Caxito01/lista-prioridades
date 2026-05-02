// Versão de build para depuração em produção
console.log('auth.js v1735000004 carregado');

// Verificar se usuário está logado
async function checkAuth() {
    console.log('🔐 Verificando autenticação...');
    
    await window.initSupabase();
    const client = window.getClient();
    if (!client) {
        console.error('❌ Cliente não inicializou');
        return null;
    }
    
    try {
        const { data, error: sessionError } = await client.auth.getSession();
        const session = data?.session;
        
        // Se houver sessão válida, sempre priorizar o usuário autenticado
        if (!sessionError && session) {
            const currentUser = session.user.id;
            const lastUser = localStorage.getItem('lastUserId');
            
            if (lastUser !== currentUser) {
                clearUserData();
                localStorage.setItem('lastUserId', currentUser);
            }
            
            return session.user;
        }

        // Sem sessão válida: tentar acesso somente por código de projeto
        const projectCode = localStorage.getItem('projectCode');
        const projectId = localStorage.getItem('projectId');

        if (projectCode && projectId) {
            console.log('✅ Código de acesso detectado (sem sessão)');
            displayProjectCode(projectCode);
            return { id: 'code-access', email: projectCode };
        }

        console.log('⚠️ Sem sessão e sem código, redirecionando...');
        window.location.href = 'auth.html';
        return null;
    } catch (error) {
        console.error('❌ Erro:', error);
        return null;
    }
}

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

// Modal informando que é necessário estar logado
// customMessage permite personalizar o texto para salvar/carregar
function showLoginRequiredModal(customMessage) {
    const existing = document.getElementById('loginRequiredModal');
    if (existing) existing.remove();

    const loginModal = document.createElement('div');
    loginModal.id = 'loginRequiredModal';
    loginModal.style.cssText = `
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

    const message = customMessage || 'Você precisa estar logado para salvar suas tarefas no banco de dados.';

    loginModal.innerHTML = `
        <div style="background: white; border-radius: 15px; padding: 30px; max-width: 400px; width: 90%; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); text-align: center;">
            <h2 style="color: #f44336; margin-bottom: 20px; font-size: 1.5rem;">⚠️ Autenticação Necessária</h2>
            <p style="color: #666; margin-bottom: 30px; font-size: 1rem; line-height: 1.5;">${message}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="goToLoginFromModal()" style="flex: 1; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; transition: all 0.3s;"
                onmouseover="this.style.background='#43a047'" onmouseout="this.style.background='#4CAF50'">Ir para Login</button>
                <button onclick="closeLoginRequiredModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; transition: all 0.3s;"
                onmouseover="this.style.background='#5a6268'" onmouseout="this.style.background='#6c757d'">Cancelar</button>
            </div>
        </div>
    `;

    document.body.appendChild(loginModal);

    loginModal.onclick = (e) => {
        if (e.target === loginModal) closeLoginRequiredModal();
    };
}

function closeLoginRequiredModal() {
    const modal = document.getElementById('loginRequiredModal');
    if (modal) modal.remove();
}

function goToLoginFromModal() {
    closeLoginRequiredModal();
    window.location.href = 'auth.html?t=' + Date.now();
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
            
            // Tentar usar a função pública primeiro
            const { data: project, error } = await client
                .rpc('get_project_by_code', { p_code: projectCode });
            
            if (!error && project && project.length > 0) {
                console.log('✅ Projeto acessado por código:', projectCode, project[0].name);
                return [project[0]];
            } else {
                console.log('⚠️ Função RPC falhou, tentando fallback...');
                // Fallback: query direta (pode ser bloqueada por RLS)
                const { data: fallbackProject, error: fallbackError } = await client
                    .from('projects')
                    .select('*')
                    .eq('project_code', projectCode)
                    .single();
                
                if (!fallbackError && fallbackProject) {
                    console.log('✅ Projeto acessado por código (fallback):', projectCode);
                    return [fallbackProject];
                } else {
                    console.log('❌ Projeto não encontrado com código:', projectCode);
                    return [];
                }
            }
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
async function saveToDatabaseWithAuth() {
    try {
        await window.initSupabase();
        const client = window.getClient();
        
        if (!client) {
            showNotification('❌ Erro ao conectar com o servidor');
            return;
        }
        
        const { data, error: sessionError } = await client.auth.getSession();
        const session = data?.session;
        
        if (sessionError) {
            showNotification('❌ Erro ao verificar autenticação: ' + sessionError.message);
            return;
        }
        
        if (!session) {
            showLoginRequiredModal();
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
            num_evaluators: typeof numEvaluators !== 'undefined' ? numEvaluators : 4,
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
async function performUpdateProject(projectId) {
    try {
        await window.initSupabase();
        
        // Retry loop - aguardar o client ficar disponível
        let client = null;
        let retries = 0;
        while (!client && retries < 20) {
            client = window.getClient();
            if (!client) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }
        }
        
        if (!client) {
            showNotification('❌ Erro ao conectar com o servidor');
            return;
        }
        
        const { data, error: sessionError } = await client.auth.getSession();
        const session = data?.session;
        
        if (sessionError) {
            showNotification('❌ Erro ao verificar autenticação: ' + sessionError.message);
            return;
        }
        
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
            num_evaluators: typeof numEvaluators !== 'undefined' ? numEvaluators : 4,
            tasks: tasks
        };
        
        const { error } = await client
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

// Expor função de atualização para ser usada pelo app.js
window.performUpdateProject = performUpdateProject;

// Carregar projeto verificando user_id
async function loadFromDatabase() {
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
            if (typeof showLoginRequiredModal === 'function') {
                showLoginRequiredModal('Você precisa estar logado para carregar suas tarefas no banco de dados.');
            } else {
                showNotification('❌ Você precisa estar logado para carregar projetos!');
            }
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
}

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
