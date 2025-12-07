// Estado da aplicação
let tasks = [];
let editingTaskId = null;
let currentSortOrder = 'priority'; // 'priority' ou 'alphabetical'
let currentFilter = '';
let currentEvaluatorCount = 4; // Número atual de avaliadores

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
    loadEvaluatorCount();
    loadTasks();
    updateEvaluatorLabels();
    updateRemoveButtonsVisibility();
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
        
        // Carregar campos adicionais se existirem
        for (let i = 5; i <= currentEvaluatorCount; i++) {
            const field = document.getElementById(`evaluator${i}`);
            if (field && evaluatorNames[`eval${i}`]) {
                field.value = evaluatorNames[`eval${i}`];
            }
        }
    }
}

// Carregar o número de avaliadores do localStorage
function loadEvaluatorCount() {
    const saved = localStorage.getItem('evaluatorCount');
    if (saved) {
        currentEvaluatorCount = parseInt(saved);
    }
    syncEvaluatorFields();
    syncEvaluationFieldsRequired();
}

// Sincronizar atributo required dos campos de avaliação
function syncEvaluationFieldsRequired() {
    for (let i = 1; i <= 5; i++) {
        const field = document.getElementById(`eval${i}`);
        if (field) {
            if (i <= currentEvaluatorCount) {
                field.required = true;
            } else {
                field.required = false;
            }
        }
    }
}

// Sincronizar campos de avaliadores com o número atual
function syncEvaluatorFields() {
    for (let i = 1; i <= 5; i++) {
        const input = document.getElementById(`evaluator${i}`);
        const container = input?.parentElement?.parentElement;
        const eval5Group = document.getElementById('eval5Group');
        const eval5Header = document.getElementById('eval5Header');
        
        if (i <= currentEvaluatorCount) {
            if (container) {
                container.style.display = 'flex';
            }
            // Mostrar campo de avaliação 5 se necessário
            if (i === 5 && eval5Group) {
                eval5Group.style.display = 'block';
            }
            if (i === 5 && eval5Header) {
                eval5Header.style.display = 'table-cell';
            }
        } else {
            if (container) {
                container.style.display = 'none';
            }
            // Ocultar campo de avaliação 5 se necessário
            if (i === 5) {
                if (eval5Group) eval5Group.style.display = 'none';
                if (eval5Header) eval5Header.style.display = 'none';
            }
        }
    }
}

// Salvar nomes dos avaliadores
function saveEvaluatorNames() {
    evaluatorNames = {};
    
    for (let i = 1; i <= currentEvaluatorCount; i++) {
        const fieldValue = document.getElementById(`evaluator${i}`).value || `Avaliador ${i}`;
        evaluatorNames[`eval${i}`] = fieldValue;
    }
    
    localStorage.setItem('evaluatorNames', JSON.stringify(evaluatorNames));
    localStorage.setItem('evaluatorCount', currentEvaluatorCount.toString());
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

// Adicionar novo avaliador
function addEvaluator() {
    if (currentEvaluatorCount >= 5) {
        showNotification('Número máximo de avaliadores (5) atingido!');
        return;
    }
    
    currentEvaluatorCount++;
    createEvaluatorField(currentEvaluatorCount);
    syncEvaluationFieldsRequired();
    updateRemoveButtonsVisibility();
    showNotification(`Avaliador ${currentEvaluatorCount} adicionado!`);
}

// Remover avaliador
function removeEvaluator(index) {
    if (currentEvaluatorCount <= 1) {
        showNotification('É necessário manter pelo menos 1 avaliador!');
        return;
    }
    
    if (confirm(`Tem certeza que deseja remover o Avaliador ${index}?`)) {
        // Deslocar avaliadores subsequentes
        for (let i = index; i < currentEvaluatorCount; i++) {
            const current = document.getElementById(`evaluator${i}`);
            const next = document.getElementById(`evaluator${i + 1}`);
            if (current && next) {
                current.value = next.value;
                evaluatorNames[`eval${i}`] = next.value;
            }
        }
        
        currentEvaluatorCount--;
        syncEvaluatorFields();
        syncEvaluationFieldsRequired();
        updateRemoveButtonsVisibility();
        saveEvaluatorNames();
        showNotification(`Avaliador removido com sucesso!`);
    }
}

// Criar campo de novo avaliador
function createEvaluatorField(index) {
    const container = document.getElementById('evaluatorsContainer');
    const newField = document.createElement('div');
    newField.className = 'evaluator-input';
    newField.innerHTML = `
        <label>Avaliador ${index}:</label>
        <div class="evaluator-input-group">
            <input type="text" id="evaluator${index}" value="Avaliador ${index}" class="evaluator-field">
            <button type="button" class="btn btn-danger btn-remove-evaluator" onclick="removeEvaluator(${index})" title="Remover avaliador">✕</button>
        </div>
    `;
    container.appendChild(newField);
    syncEvaluatorFields();
}

// Atualizar visibilidade dos botões de remover
function updateRemoveButtonsVisibility() {
    for (let i = 1; i <= 5; i++) {
        const button = document.querySelector(`button[onclick="removeEvaluator(${i})"]`);
        if (button) {
            if (currentEvaluatorCount <= 1) {
                button.style.display = 'none';
            } else if (i <= currentEvaluatorCount) {
                button.style.display = 'block';
            } else {
                button.style.display = 'none';
            }
        }
    }
    
    // Atualizar disponibilidade do botão de adicionar
    const btnAdd = document.getElementById('btnAddEvaluator');
    if (btnAdd) {
        btnAdd.disabled = currentEvaluatorCount >= 5;
    }
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
    const headers = document.querySelectorAll('.evaluator-header');
    
    for (let i = 1; i <= currentEvaluatorCount && i <= evaluatorNameSpans.length; i++) {
        evaluatorNameSpans[i - 1].textContent = evaluatorNames[`eval${i}`];
        headers[i - 1].textContent = evaluatorNames[`eval${i}`];
    }
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
    let sum = 0;
    let count = 0;
    
    for (let i = 1; i <= currentEvaluatorCount; i++) {
        const key = `eval${i}`;
        if (evaluations[key]) {
            sum += evaluations[key];
            count++;
        }
    }
    
    return count > 0 ? (sum / count).toFixed(2) : 0;
}

// Manipular envio do formulário
function handleFormSubmit(e) {
    e.preventDefault();
    
    const evaluations = {};
    for (let i = 1; i <= currentEvaluatorCount; i++) {
        const fieldValue = document.getElementById(`eval${i}`);
        if (fieldValue) {
            evaluations[`eval${i}`] = parseInt(fieldValue.value);
        }
    }
    
    const taskData = {
        id: editingTaskId || Date.now(),
        description: document.getElementById('taskDescription').value,
        stage: document.getElementById('taskStage').value,
        evaluations: evaluations
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
    
    for (let i = 1; i <= currentEvaluatorCount; i++) {
        const field = document.getElementById(`eval${i}`);
        if (field && task.evaluations[`eval${i}`]) {
            field.value = task.evaluations[`eval${i}`];
        }
    }
    
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
        // Ordenar por média (maior para menor)
        return tasksToSort.sort((a, b) => parseFloat(b.average) - parseFloat(a.average));
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
    
    // Gerar células de avaliação dinamicamente
    const evaluationCells = sortedTasks.map(task => {
        let cellsHTML = '';
        for (let i = 1; i <= currentEvaluatorCount; i++) {
            const value = task.evaluations[`eval${i}`] || '-';
            cellsHTML += `<td class="score-cell">${value}</td>`;
        }
        return cellsHTML;
    });
    
    tbody.innerHTML = sortedTasks.map((task, index) => `
        <tr>
            <td>
                <select class="stage-select" data-stage="${task.stage}" onchange="updateTaskStage(${task.id}, this.value)">
                    <option value="EM EXECUÇÃO" ${task.stage === 'EM EXECUÇÃO' ? 'selected' : ''}>EM EXECUÇÃO</option>
                    <option value="ATRASADO" ${task.stage === 'ATRASADO' ? 'selected' : ''}>ATRASADO</option>
                    <option value="INICIADO" ${task.stage === 'INICIADO' ? 'selected' : ''}>INICIADO</option>
                    <option value="EM PLANEJAMENTO" ${task.stage === 'EM PLANEJAMENTO' ? 'selected' : ''}>EM PLANEJAMENTO</option>
                    <option value="CONCLUÍDO" ${task.stage === 'CONCLUÍDO' ? 'selected' : ''}>CONCLUÍDO</option>
                </select>
            </td>
            <td>${task.description}</td>
            ${evaluationCells[index]}
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
