// Estado da aplicação
let tasks = [];
let editingTaskId = null;
let currentSortOrder = 'priority'; // 'priority' ou 'alphabetical'
let currentFilter = '';

// Nomes dos avaliadores
let evaluatorNames = {
    eval1: 'Avaliador 1',
    eval2: 'Avaliador 2',
    eval3: 'Avaliador 3',
    eval4: 'Avaliador 4'
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadEvaluatorNames();
    loadTasks();
    updateEvaluatorLabels();
    renderTasks();
    
    // Event listener para o formulário
    document.getElementById('taskForm').addEventListener('submit', handleFormSubmit);
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
    evaluatorNames = {
        eval1: document.getElementById('evaluator1').value || 'Avaliador 1',
        eval2: document.getElementById('evaluator2').value || 'Avaliador 2',
        eval3: document.getElementById('evaluator3').value || 'Avaliador 3',
        eval4: document.getElementById('evaluator4').value || 'Avaliador 4'
    };
    
    localStorage.setItem('evaluatorNames', JSON.stringify(evaluatorNames));
    updateEvaluatorLabels();
    renderTasks();
    
    showNotification('Nomes dos avaliadores salvos com sucesso!');
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
    const evaluatorNameSpans = document.querySelectorAll('.evaluator-name');
    evaluatorNameSpans[0].textContent = evaluatorNames.eval1;
    evaluatorNameSpans[1].textContent = evaluatorNames.eval2;
    evaluatorNameSpans[2].textContent = evaluatorNames.eval3;
    evaluatorNameSpans[3].textContent = evaluatorNames.eval4;
    
    const headers = document.querySelectorAll('.evaluator-header');
    headers[0].textContent = evaluatorNames.eval1;
    headers[1].textContent = evaluatorNames.eval2;
    headers[2].textContent = evaluatorNames.eval3;
    headers[3].textContent = evaluatorNames.eval4;
}

// Carregar tarefas do localStorage
function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        tasks = JSON.parse(saved);
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
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
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
    const tbody = document.getElementById('tasksTableBody');
    const noTasksMessage = document.getElementById('noTasksMessage');
    
    let filteredTasks = filterTasks();
    let sortedTasks = sortTasks(filteredTasks);
    
    if (sortedTasks.length === 0) {
        tbody.innerHTML = '';
        noTasksMessage.style.display = 'block';
        return;
    }
    
    noTasksMessage.style.display = 'none';
    
    tbody.innerHTML = sortedTasks.map(task => `
        <tr>
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
    try {
        // Preparar dados para salvar
        const dataToSave = {
            evaluator_names: evaluatorNames,
            tasks: tasks,
            timestamp: new Date().toISOString()
        };
        
        // Inserir ou atualizar no Supabase
        const { data, error } = await supabase
            .from('projects')
            .insert([
                {
                    name: `Projeto_${new Date().getTime()}`,
                    data: dataToSave,
                    created_at: new Date().toISOString()
                }
            ]);
        
        if (error) {
            showNotification('Erro ao salvar: ' + error.message);
            console.error('Erro:', error);
            return;
        }
        
        showNotification('✅ Projeto salvo no banco de dados com sucesso!');
    } catch (error) {
        showNotification('Erro: ' + error.message);
        console.error('Erro:', error);
    }
}

// Carregar dados do Supabase
async function loadFromDatabase() {
    try {
        // Buscar últimos projetos
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) {
            showNotification('Erro ao carregar: ' + error.message);
            console.error('Erro:', error);
            return;
        }
        
        if (data.length === 0) {
            showNotification('Nenhum projeto encontrado no banco de dados.');
            return;
        }
        
        // Exibir lista de projetos para o usuário escolher
        showProjectSelection(data);
    } catch (error) {
        showNotification('Erro: ' + error.message);
        console.error('Erro:', error);
    }
}

// Mostrar seleção de projetos
function showProjectSelection(projects) {
    let options = '<select id="projectSelect" style="padding: 10px; font-size: 1rem; margin: 10px 0;">\n<option value="">Escolha um projeto...</option>\n';
    
    projects.forEach(project => {
        const date = new Date(project.created_at).toLocaleString('pt-BR');
        options += `<option value="${project.id}">${project.name} - ${date}</option>\n`;
    });
    
    options += '</select>\n<button class="btn btn-success" onclick="confirmLoadProject()" style="margin-left: 10px;">Carregar</button>';
    
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; top: 100px; right: 20px; background: white; color: #333; padding: 20px; border-radius: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 10000; max-width: 400px;';
    notification.innerHTML = `<h3 style="margin-top: 0;">Projetos Salvos</h3>${options}`;
    document.body.appendChild(notification);
    
    window.projectsList = projects;
}

// Confirmar carregamento de projeto
async function confirmLoadProject() {
    const select = document.getElementById('projectSelect');
    const projectId = select.value;
    
    if (!projectId) {
        showNotification('Selecione um projeto primeiro!');
        return;
    }
    
    // Encontrar projeto na lista
    const project = window.projectsList.find(p => p.id == projectId);
    
    if (project && project.data) {
        // Carregar dados
        evaluatorNames = project.data.evaluator_names || evaluatorNames;
        tasks = project.data.tasks || [];
        
        // Atualizar interface
        document.getElementById('evaluator1').value = evaluatorNames.eval1;
        document.getElementById('evaluator2').value = evaluatorNames.eval2;
        document.getElementById('evaluator3').value = evaluatorNames.eval3;
        document.getElementById('evaluator4').value = evaluatorNames.eval4;
        
        updateEvaluatorLabels();
        renderTasks();
        
        showNotification('✅ Projeto carregado com sucesso!');
        
        // Remover seletor
        document.querySelector('div[style*="position: fixed"]').remove();
    }
}
