// Versão de build para depuração
console.log('app.js v1735000001 carregado');

// Estado da aplicação
let tasks = [];
let editingTaskId = null;
let currentSortOrder = 'priority'; // 'priority' ou 'alphabetical'
let currentFilter = '';
let currentProjectCode = null; // Código do projeto acessado

// Nomes dos avaliadores
let evaluatorNames = {
    eval1: 'Avaliador 1',
    eval2: 'Avaliador 2',
    eval3: 'Avaliador 3',
    eval4: 'Avaliador 4'
};

// Gerar código de projeto (CXT + 5 números aleatórios)
function generateProjectCode() {
    const randomNumbers = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const positions = ['inicio', 'meio', 'fim'];
    const position = positions[Math.floor(Math.random() * positions.length)];
    
    switch(position) {
        case 'inicio':
            return 'CXT' + randomNumbers;
        case 'meio':
            return randomNumbers.substring(0, 2) + 'CXT' + randomNumbers.substring(2);
        case 'fim':
            return randomNumbers + 'CXT';
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

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📄 DOMContentLoaded - iniciando app.js...');
    
    // Garantir que Supabase está inicializado
    await window.initSupabase();
    
    loadEvaluatorNames();
    await loadTasks();
    updateEvaluatorLabels();
    renderTasks();
    
    // Verificar acesso por código
    const projectCode = localStorage.getItem('projectCode');
    if (projectCode) {
        currentProjectCode = projectCode;
        document.title = `Lista de Tarefas - Projeto: ${projectCode}`;
        // Mostrar código na página
        document.getElementById('projectCodeBanner').style.display = 'block';
        document.getElementById('projectCodeDisplay').textContent = projectCode;
    }
    
    // Event listener para o formulário
    document.getElementById('taskForm').addEventListener('submit', handleFormSubmit);
    
    console.log('✅ App.js inicializado com sucesso!');
});

// Carregar nomes dos avaliadores do localStorage
function loadEvaluatorNames() {
    const saved = localStorage.getItem('evaluatorNames');
    if (saved) {
        evaluatorNames = JSON.parse(saved);
        document.getElementById('evaluator1').value = evaluatorNames.eval1;
        document.getElementById('evaluator2').value = evaluatorNames.eval2;
        document.getElementById('evaluator3').value = evaluatorNames.eval3;
        document.getElementById('evaluator4').value = evaluatorNames.eval4;
    }
}

// Salvar nomes dos avaliadores
function saveEvaluatorNames() {
    console.log('💾 Salvando nomes dos avaliadores...');
    
    try {
        // Obter valores dos campos
        const eval1Value = document.getElementById('evaluator1')?.value || 'Avaliador 1';
        const eval2Value = document.getElementById('evaluator2')?.value || 'Avaliador 2';
        const eval3Value = document.getElementById('evaluator3')?.value || 'Avaliador 3';
        const eval4Value = document.getElementById('evaluator4')?.value || 'Avaliador 4';
        
        console.log('📝 Valores obtidos:');
        console.log('   1:', eval1Value);
        console.log('   2:', eval2Value);
        console.log('   3:', eval3Value);
        console.log('   4:', eval4Value);
        
        // Atualizar objeto global
        evaluatorNames = {
            eval1: eval1Value,
            eval2: eval2Value,
            eval3: eval3Value,
            eval4: eval4Value
        };
        
        // Salvar no localStorage
        localStorage.setItem('evaluatorNames', JSON.stringify(evaluatorNames));
        console.log('✅ Nomes salvos no localStorage');
        
        // Atualizar labels
        updateEvaluatorLabels();
        console.log('✅ Labels atualizados');
        
        // Renderizar tarefas
        renderTasks();
        console.log('✅ Tarefas renderizadas');
        
        // Mostrar notificação
        showNotification('✅ Nomes dos avaliadores salvos com sucesso!');
        console.log('✅ Notificação exibida');
        
    } catch (error) {
        console.error('❌ Erro ao salvar nomes:', error);
        showNotification('❌ Erro ao salvar nomes: ' + error.message);
    }
}

// Mostrar notificação
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 15px 25px; border-radius: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 10000; animation: fadeIn 0.3s ease-in;';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Mostrar modal de ajuda
function showHelp() {
    document.getElementById('helpModal').style.display = 'block';
}

// Fechar modal de ajuda
function closeHelp() {
    document.getElementById('helpModal').style.display = 'none';
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('helpModal');
    if (event.target === modal) {
        closeHelp();
    }
}

// Atualizar labels dos avaliadores na interface
function updateEvaluatorLabels() {
    console.log('🔄 Atualizando labels dos avaliadores...');
    
    const evaluatorNameSpans = document.querySelectorAll('.evaluator-name');
    console.log('📍 Encontrados .evaluator-name:', evaluatorNameSpans.length);
    
    if (evaluatorNameSpans.length >= 4) {
        evaluatorNameSpans[0].textContent = evaluatorNames.eval1;
        evaluatorNameSpans[1].textContent = evaluatorNames.eval2;
        evaluatorNameSpans[2].textContent = evaluatorNames.eval3;
        evaluatorNameSpans[3].textContent = evaluatorNames.eval4;
        console.log('✅ Labels de nomes atualizados:', evaluatorNames);
    } else {
        console.warn('⚠️ Nem todos os elementos .evaluator-name encontrados');
    }
    
    const headers = document.querySelectorAll('.evaluator-header');
    console.log('📍 Encontrados .evaluator-header:', headers.length);
    
    if (headers.length >= 4) {
        headers[0].textContent = evaluatorNames.eval1;
        headers[1].textContent = evaluatorNames.eval2;
        headers[2].textContent = evaluatorNames.eval3;
        headers[3].textContent = evaluatorNames.eval4;
        console.log('✅ Headers atualizados');
    } else {
        console.warn('⚠️ Nem todos os elementos .evaluator-header encontrados');
    }
}

// Carregar tarefas
async function loadTasks() {
    const projectId = localStorage.getItem('projectId');
    
    console.log('📂 Carregando tarefas... (projectId:', projectId, ')');
    
    if (projectId) {
        try {
            await window.initSupabase();
            const client = window.getClient();
            if (!client) {
                console.log('⚠️ Supabase não disponível, usando localStorage');
                loadTasksFromLocalStorage();
                return;
            }
            
            console.log('🔍 Buscando projeto no Supabase: ', projectId);
            const { data: project, error } = await client
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();
            
            if (error) {
                console.log('⚠️ Erro ao buscar projeto:', error.message);
                loadTasksFromLocalStorage();
                return;
            }
            
            if (project && project.data) {
                tasks = project.data;
                localStorage.setItem('tasks', JSON.stringify(tasks));
                console.log('✅ Tarefas carregadas do Supabase:', tasks.length);
            } else if (project && project.tasks) {
                // Compatibilidade com estrutura alternativa
                tasks = project.tasks;
                localStorage.setItem('tasks', JSON.stringify(tasks));
                console.log('✅ Tarefas carregadas (alt):', tasks.length);
            } else {
                console.log('⚠️ Projeto encontrado mas sem tarefas, usando localStorage');
                loadTasksFromLocalStorage();
            }
        } catch (error) {
            console.log('❌ Erro ao carregar tarefas:', error.message);
            loadTasksFromLocalStorage();
        }
    } else {
        // Sem projectId, carregar do localStorage
        console.log('📱 Sem projectId, carregando do localStorage');
        loadTasksFromLocalStorage();
    }
}

// Função para carregar todos os dados
async function loadData() {
    await loadEvaluatorNames();
    await loadTasks();
    updateEvaluatorLabels();
    renderTasks();
}

function loadTasksFromLocalStorage() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        try {
            tasks = JSON.parse(saved);
            console.log('✅ Tarefas do localStorage:', tasks.length);
        } catch (e) {
            console.log('❌ Erro ao parsear localStorage:', e);
            tasks = [];
        }
    } else {
        console.log('⚠️ Nenhuma tarefa no localStorage');
        tasks = [];
    }
}

// Salvar tarefas no localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Calcular média das avaliações
function calculateAverage(evaluations) {
    const sum = evaluations.eval1 + evaluations.eval2 + evaluations.eval3 + evaluations.eval4;
    return (sum / 4).toFixed(2);
}

// Manipular envio do formulário
function handleFormSubmit(e) {
    e.preventDefault();
    
    const taskData = {
        id: editingTaskId || Date.now(),
        description: document.getElementById('taskDescription').value,
        stage: document.getElementById('taskStage').value,
        evaluations: {
            eval1: parseInt(document.getElementById('eval1').value),
            eval2: parseInt(document.getElementById('eval2').value),
            eval3: parseInt(document.getElementById('eval3').value),
            eval4: parseInt(document.getElementById('eval4').value)
        }
    };
    
    taskData.average = calculateAverage(taskData.evaluations);
    
    if (editingTaskId) {
        // Editar tarefa existente
        const index = tasks.findIndex(t => t.id === editingTaskId);
        tasks[index] = taskData;
        editingTaskId = null;
        document.getElementById('formTitle').textContent = '➕ Cadastrar Nova Tarefa';
        document.getElementById('submitBtn').textContent = 'Adicionar Tarefa';
        document.getElementById('cancelBtn').style.display = 'none';
    } else {
        // Adicionar nova tarefa
        tasks.push(taskData);
    }
    
    saveTasks();
    renderTasks();
    resetForm();
}

// Resetar formulário
function resetForm() {
    document.getElementById('taskForm').reset();
}

// Cancelar edição
function cancelEdit() {
    editingTaskId = null;
    document.getElementById('formTitle').textContent = '➕ Cadastrar Nova Tarefa';
    document.getElementById('submitBtn').textContent = 'Adicionar Tarefa';
    document.getElementById('cancelBtn').style.display = 'none';
    resetForm();
}

// Editar tarefa
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    editingTaskId = id;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskStage').value = task.stage;
    document.getElementById('eval1').value = task.evaluations.eval1;
    document.getElementById('eval2').value = task.evaluations.eval2;
    document.getElementById('eval3').value = task.evaluations.eval3;
    document.getElementById('eval4').value = task.evaluations.eval4;
    
    document.getElementById('formTitle').textContent = '✏️ Editar Tarefa';
    document.getElementById('submitBtn').textContent = 'Salvar Alterações';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    
    // Scroll para o formulário
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Deletar tarefa
function deleteTask(id) {
    showDeleteModal(id);
}

// Modal de confirmação de exclusão
function showDeleteModal(id) {
    const deleteModal = document.createElement('div');
    deleteModal.id = 'deleteModal';
    deleteModal.style.cssText = `
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
    
    deleteModal.innerHTML = `
        <div style="background: white; border-radius: 15px; padding: 30px; max-width: 400px; width: 90%; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); text-align: center;">
            <h2 style="color: #dc3545; margin-bottom: 20px; font-size: 1.5rem;">⚠️ Confirmar Exclusão</h2>
            <p style="color: #666; margin-bottom: 30px; font-size: 1rem; line-height: 1.5;">Tem certeza que deseja excluir esta tarefa?</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="confirmDeleteTask(${id})" style="flex: 1; padding: 12px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; transition: all 0.3s;"
                onmouseover="this.style.background='#c82333'" onmouseout="this.style.background='#dc3545'">Excluir</button>
                <button onclick="closeDeleteModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; transition: all 0.3s;"
                onmouseover="this.style.background='#5a6268'" onmouseout="this.style.background='#6c757d'">Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(deleteModal);
    
    deleteModal.onclick = (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    };
}

function confirmDeleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    closeDeleteModal();
    renderTasks();
}

function closeDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) deleteModal.remove();
}

// Obter classe CSS do estágio
function getStageClass(stage) {
    const stageMap = {
        'EM EXECUÇÃO': 'stage-em-execucao',
        'ATRASADO': 'stage-atrasado',
        'INICIADO': 'stage-iniciado',
        'EM PLANEJAMENTO': 'stage-em-planejamento',
        'CONCLUÍDO': 'stage-concluido'
    };
    return stageMap[stage] || '';
}

// Obter classe CSS da média
function getAverageClass(average) {
    if (average >= 4) return 'avg-high';
    if (average >= 3) return 'avg-medium';
    return 'avg-low';
}

// Ordenar tarefas
function sortTasks(tasksToSort) {
    if (currentSortOrder === 'priority') {
        // Ordenar por média (maior para menor), e se iguais, colocar ATRASADO em primeiro
        return tasksToSort.sort((a, b) => {
            const avgDiff = parseFloat(b.average) - parseFloat(a.average);
            if (avgDiff !== 0) {
                return avgDiff;
            }
            // Se as médias forem iguais, ATRASADO vem primeiro
            if (a.stage === 'ATRASADO' && b.stage !== 'ATRASADO') return -1;
            if (a.stage !== 'ATRASADO' && b.stage === 'ATRASADO') return 1;
            return 0;
        });
    } else {
        // Ordenar alfabeticamente
        return tasksToSort.sort((a, b) => a.description.localeCompare(b.description));
    }
}

// Filtrar tarefas
function filterTasks() {
    if (!currentFilter) {
        return [...tasks];
    }
    return tasks.filter(t => t.stage === currentFilter);
}

// Aplicar filtros
function applyFilters() {
    currentFilter = document.getElementById('filterStage').value;
    renderTasks();
}

// Limpar filtros
function clearFilters() {
    currentFilter = '';
    document.getElementById('filterStage').value = '';
    renderTasks();
}

// Alternar ordem de classificação
function toggleSortOrder() {
    if (currentSortOrder === 'priority') {
        currentSortOrder = 'alphabetical';
        document.getElementById('sortButtonText').textContent = 'ORDEM POR PRIORIDADE';
    } else {
        currentSortOrder = 'priority';
        document.getElementById('sortButtonText').textContent = 'ORDEM ALFABÉTICA';
    }
    renderTasks();
}

// Renderizar tarefas na tabela
function renderTasks() {
    console.log('🔄 Renderizando tarefas...');
    
    const tbody = document.getElementById('tasksTableBody');
    const noTasksMessage = document.getElementById('noTasksMessage');
    
    if (!tbody) {
        console.warn('⚠️ Elemento tasksTableBody não encontrado');
        return;
    }
    
    let filteredTasks = filterTasks();
    let sortedTasks = sortTasks(filteredTasks);
    
    console.log('📊 Tarefas a renderizar:', sortedTasks.length);
    
    if (sortedTasks.length === 0) {
        tbody.innerHTML = '';
        if (noTasksMessage) {
            noTasksMessage.style.display = 'block';
        }
        console.log('📭 Nenhuma tarefa para exibir');
        return;
    }
    
    if (noTasksMessage) {
        noTasksMessage.style.display = 'none';
    }
    
    tbody.innerHTML = sortedTasks.map((task, index) => `
        <tr>
            <td class="row-number">${index + 1}</td>
            <td>
                <select class="stage-select" data-stage="${task.stage}" onchange="updateTaskStage(${task.id}, this.value)">
                    <option value="ATRASADO" ${task.stage === 'ATRASADO' ? 'selected' : ''}>ATRASADO</option>
                    <option value="EM PLANEJAMENTO" ${task.stage === 'EM PLANEJAMENTO' ? 'selected' : ''}>EM PLANEJAMENTO</option>
                    <option value="INICIADO" ${task.stage === 'INICIADO' ? 'selected' : ''}>INICIADO</option>
                    <option value="EM EXECUÇÃO" ${task.stage === 'EM EXECUÇÃO' ? 'selected' : ''}>EM EXECUÇÃO</option>
                    <option value="CONCLUÍDO" ${task.stage === 'CONCLUÍDO' ? 'selected' : ''}>CONCLUÍDO</option>
                </select>
            </td>
            <td>${task.description}</td>
            <td class="score-cell">${task.evaluations.eval1}</td>
            <td class="score-cell">${task.evaluations.eval2}</td>
            <td class="score-cell">${task.evaluations.eval3}</td>
            <td class="score-cell">${task.evaluations.eval4}</td>
            <td>
                <span class="${getAverageClass(parseFloat(task.average))}">
                    ${task.average}
                </span>
            </td>
            <td class="actions-cell">
                <button class="btn btn-edit" onclick="editTask(${task.id})" title="Editar">
                    ✏️
                </button>
                <button class="btn btn-danger" onclick="deleteTask(${task.id})" title="Excluir">
                    🗑️
                </button>
            </td>
        </tr>
    `).join('');
}

// Atualizar estágio da tarefa rapidamente
function updateTaskStage(taskId, newStage) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.stage = newStage;
        saveTasks();
        renderTasks();
    }
}

// Função de impressão em PDF
function printToPDF() {
    // Adicionar rodapé com data e hora
    const now = new Date();
    const dateTime = now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Criar rodapé temporário
    const footer = document.createElement('div');
    footer.className = 'print-footer';
    footer.textContent = `Impresso em: ${dateTime} | © CECM - 2025 Sistema de Gerenciamento de Prioridades`;
    document.body.appendChild(footer);
    
    // Imprimir
    window.print();
    
    // Remover rodapé após impressão
    setTimeout(() => {
        footer.remove();
    }, 100);
}

// Salvar dados no Supabase
async function saveToDatabase() {
    // Esta função chama a versão do auth.js que filtra por usuário
    await saveToDatabaseWithAuth();
}

// Mostrar seleção de projetos para salvar
function showSaveProjectSelection(projects) {
    let projectsList = '';
    
    if (projects && projects.length > 0) {
        projectsList = '<div style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 15px;">';
        
        projects.forEach(project => {
            const date = formatSupabaseDate(project.created_at);
            const projectCode = project.project_code ? `<br><small style="color: #667eea; font-weight: bold;">🔑 ${project.project_code}</small>` : '';
            projectsList += `
                <div onclick="selectProjectToSave('${project.id}', '${project.name}')" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s; background: #f9f9f9;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='#f9f9f9'">
                    <strong style="color: #333;">${project.name}</strong><br>
                    <small style="color: #999;">${date}</small>
                    ${projectCode}
                </div>
            `;
        });
        
        projectsList += '</div>';
    }
    
    const modal = document.createElement('div');
    modal.id = 'saveSaveProjectModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); max-width: 450px; width: 90%;">
            <h2 style="margin-top: 0; color: #333;">💾 Salvar Tarefa</h2>
            <p style="color: #666; margin-bottom: 15px;">Clique em um projeto para atualizar ou crie um novo:</p>
            ${projectsList}
            <div style="display: flex; gap: 10px;">
                <button onclick="createNewProject()" style="flex: 1; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">➕ Novo Projeto</button>
                <button onclick="closeSaveSelectModal()" style="flex: 1; padding: 12px; background: #999; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    window.projectsList = projects;
}

// Selecionar projeto para salvar
function selectProjectToSave(projectId, projectName) {
    const modal = document.getElementById('saveSaveProjectModal');
    if (modal) modal.remove();
    
    // Perguntar o que fazer
    const confirmModal = document.createElement('div');
    confirmModal.id = 'saveActionModal';
    confirmModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    `;
    
    confirmModal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); max-width: 400px; width: 90%;">
            <h2 style="margin-top: 0; color: #333;">📋 ${projectName}</h2>
            <p style="color: #666;">O que deseja fazer?</p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button onclick="performUpdateProject('${projectId}')" style="width: 100%; padding: 12px; background: #17ec10ff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">🔄 Atualizar este Projeto</button>
                <button onclick="performSaveAsNew('${projectName}')" style="width: 100%; padding: 12px; background: #FF9800; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">💾 Salvar Como Novo</button>
                <button onclick="confirmLoadProject('${projectId}')" style="width: 100%; padding: 12px; background: #A183C0; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">📥 Carregar este Projeto</button>
                <button onclick="closeSaveActionModal()" style="width: 100%; padding: 12px; background: #cc2121ff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">✖ Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
}

// Criar novo projeto
function createNewProject() {
    const modal = document.getElementById('saveSaveProjectModal');
    if (modal) modal.remove();
    
    const inputModal = document.createElement('div');
    inputModal.id = 'newProjectNameModal';
    inputModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    `;
    
    inputModal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); max-width: 400px; width: 90%;">
            <h2 style="margin-top: 0; color: #333;">📝 Novo Projeto</h2>
            <p style="color: #666;">Digite um nome para o novo projeto:</p>
            <input type="text" id="newProjectNameInput" placeholder="Ex: Projeto Importante" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; font-size: 14px; margin-bottom: 15px;">
            <div style="display: flex; gap: 10px;">
                <button onclick="confirmNewProject()" style="flex: 1; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">Criar</button>
                <button onclick="closeNewProjectModal()" style="flex: 1; padding: 12px; background: #999; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(inputModal);
    document.getElementById('newProjectNameInput').focus();
    
    document.getElementById('newProjectNameInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') confirmNewProject();
    });
}

// Confirmar novo projeto
async function confirmNewProject() {
    const projectName = document.getElementById('newProjectNameInput').value.trim();
    
    if (!projectName) {
        showNotification('❌ Digite um nome para o projeto!');
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
    
    await performSaveProject(projectName);
    const modal = document.getElementById('newProjectNameModal');
    if (modal) modal.remove();
}

// Fechar modal
function closeSaveSelectModal() {
    const modal = document.getElementById('saveSaveProjectModal');
    if (modal) modal.remove();
}

function closeSaveActionModal() {
    const modal = document.getElementById('saveActionModal');
    if (modal) modal.remove();
}

function closeNewProjectModal() {
    const modal = document.getElementById('newProjectNameModal');
    if (modal) modal.remove();
}

// Salvar novo projeto
async function performSaveProject(projectName) {
    try {
        await window.initSupabase();
        const client = window.getClient();
        if (!client) {
            showNotification('❌ Sistema não inicializou. Recarregue a página.');
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
        
        const userId = session.user.id;
        const projectCode = generateProjectCode();
        
        console.log('💾 Salvando projeto...');
        
        const projectData = {
            evaluator_names: evaluatorNames,
            tasks: tasks,
            project_code: projectCode
        };
        
        const now = new Date();
        
        const insertData = {
            name: projectName,
            data: projectData,
            user_id: userId,
            created_at: now.toISOString(),
            project_code: projectCode
        };
        
        const { data: responseData, error } = await client
            .from('projects')
            .insert([insertData]);
        
        if (error) {
            showNotification('❌ Erro: ' + error.message);
        } else {
            console.log('✅ Projeto salvo!');
            showNotification(`✅ Projeto salvo! Código: ${projectCode}`);
        }
    } catch (error) {
        console.log('❌ Erro:', error);
        showNotification('❌ Erro: ' + error.message);
    }
}

// Salvar como novo projeto
async function performSaveAsNew(projectName) {
    const newName = projectName + ` (${new Date().toLocaleTimeString('pt-BR')})`;
    await performSaveProject(newName);
    const modal = document.getElementById('saveActionModal');
    if (modal) modal.remove();
}

// Atualizar projeto existente - CHAMADA PARA AUTH.JS
async function performUpdateProject(projectId) {
    // Esta função delegada para auth.js que tem a versão correta
    return await window.performUpdateProject ? window.performUpdateProject(projectId) : console.error('performUpdateProject de auth.js não disponível');
}

// Fechar modal de save
function closeSaveModal() {
    const modal = document.getElementById('saveProjectModal');
    if (modal) modal.remove();
}

// Carregar dados do Supabase
// Formatar data do Supabase corretamente (Brasil - UTC-3)
function formatSupabaseDate(dateString) {
    // O Supabase retorna no formato ISO 8601 com timezone
    const date = new Date(dateString);
    
    // Formatar no padrão brasileiro
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/Sao_Paulo'
    };
    
    return date.toLocaleString('pt-BR', options);
}

// Mostrar seleção de projetos
function showProjectSelection(projects) {
    let options = '<select id="projectSelect" style="padding: 10px; font-size: 1rem; margin: 10px 0; width: 100%; box-sizing: border-box;">\n<option value="">Escolha um projeto...</option>\n';
    
    projects.forEach(project => {
        const date = formatSupabaseDate(project.created_at);
        options += `<option value="${project.id}">${project.name} - ${date}</option>\n`;
    });
    
    options += '</select>';
    
    // Modal centralizado
    const modal = document.createElement('div');
    modal.id = 'loadProjectModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); max-width: 400px; width: 90%;">
            <h2 style="margin-top: 0; color: #333;">📥 Carregar Projeto</h2>
            <p style="color: #666;">Selecione um projeto:</p>
            ${options}
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button onclick="confirmLoadProject()" style="flex: 1; padding: 12px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">Carregar</button>
                <button onclick="closeLoadModal()" style="flex: 1; padding: 12px; background: #999; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    window.projectsList = projects;
}

// Fechar modal de load
function closeLoadModal() {
    const modal = document.getElementById('loadProjectModal');
    if (modal) modal.remove();
}

// Confirmar carregamento de projeto
async function confirmLoadProject(projectId) {
    // Se não recebeu ID, busca do select
    if (!projectId) {
        const select = document.getElementById('projectSelect');
        projectId = select.value;
        
        if (!projectId) {
            showNotification('❌ Selecione um projeto primeiro!');
            return;
        }
    }
    
    // Encontrar projeto na lista
    const project = window.projectsList.find(p => p.id == projectId);
    
    if (project && project.data) {
        // Carregar dados
        evaluatorNames = project.data.evaluator_names || evaluatorNames;
        tasks = project.data.tasks || [];
        
        // Exibir código do projeto se houver
        if (project.project_code) {
            console.log('🔑 Código do projeto:', project.project_code);
            displayProjectCode(project.project_code);
            localStorage.setItem('currentProjectCode', project.project_code);
        }
        
        // Atualizar interface
        document.getElementById('evaluator1').value = evaluatorNames.eval1;
        document.getElementById('evaluator2').value = evaluatorNames.eval2;
        document.getElementById('evaluator3').value = evaluatorNames.eval3;
        document.getElementById('evaluator4').value = evaluatorNames.eval4;
        
        updateEvaluatorLabels();
        renderTasks();
        
        showNotification('✅ Projeto carregado com sucesso!');
        
        // Remover modais
        const loadModal = document.getElementById('loadProjectModal');
        if (loadModal) loadModal.remove();
        
        const actionModal = document.getElementById('saveActionModal');
        if (actionModal) actionModal.remove();
    }
}

// Verificação de autenticação ao carregar a página
window.addEventListener('load', async function() {
    const user = await checkAuth();
    if (user) {
        // Mostrar email do usuário no header (ou código se acesso por código)
        const headerButtons = document.querySelector('.header-buttons');
        if (headerButtons) {
            const userInfo = document.createElement('span');
            userInfo.style.cssText = 'color: #666; font-size: 13px; margin-right: 15px; display: flex; align-items: center;';
            
            // Se for acesso por código, mostrar o código
            const projectCode = localStorage.getItem('projectCode');
            if (projectCode) {
                userInfo.innerHTML = `🔑 ${projectCode}`;
                displayProjectCode(projectCode);
            } else {
                // Se for email, procurar por código do projeto armazenado
                const currentProjectCode = localStorage.getItem('currentProjectCode');
                if (currentProjectCode) {
                    userInfo.innerHTML = `🔑 ${currentProjectCode}`;
                    displayProjectCode(currentProjectCode);
                } else {
                    userInfo.innerHTML = `👤 ${user.email}`;
                }
            }
            
            headerButtons.insertBefore(userInfo, headerButtons.firstChild);
        }
        
        // Carregar dados (aguardar se for do Supabase)
        console.log('⏳ Carregando dados...');
        await loadData();
        console.log('✅ Dados carregados com sucesso');
    }
});

