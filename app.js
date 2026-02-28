// Versão de build para depuração
console.log('app.js v1735000001 carregado');

// Estado da aplicação
let tasks = [];
let editingTaskId = null;
let currentSortOrder = 'priority'; // 'priority' ou 'alphabetical'
let currentFilter = '';
let currentDeadlineFilter = '';
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
        const banner  = document.getElementById('projectCodeBanner');
        const display = document.getElementById('projectCodeDisplay');
        if (banner)  banner.style.display = 'block';
        if (display) display.textContent  = projectCode;

        const projectName = localStorage.getItem('projectName');
        if (projectName) {
            console.log('📦 Projeto acessado por código:', projectCode, '—', projectName);
        }
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
    const projectId   = localStorage.getItem('projectId');
    const projectCode = localStorage.getItem('projectCode');

    console.log('📂 Carregando tarefas... (projectId:', projectId, '| projectCode:', projectCode, ')');

    // ── Acesso por código (sem sessão autenticada) ─────────────────────────
    if (projectCode) {
        try {
            await window.initSupabase();
            const client = window.getClient();
            if (!client) {
                console.log('⚠️ Supabase não disponível, usando localStorage');
                loadTasksFromLocalStorage();
                return;
            }

            console.log('� Buscando projeto via RPC (código):', projectCode);
            const { data: result, error: rpcError } = await client
                .rpc('get_project_by_code', { p_code: projectCode });

            if (!rpcError && result && result.length > 0) {
                const project = result[0];
                _applyProjectData(project);
                return;
            }

            // Fallback: query direta (pode funcionar se RLS permitir leitura pública)
            if (projectId) {
                console.log('⚠️ RPC falhou, tentando query direta por id...');
                const { data: project, error: idError } = await client
                    .from('projects')
                    .select('*')
                    .eq('id', projectId)
                    .single();

                if (!idError && project) {
                    _applyProjectData(project);
                    return;
                }
                console.log('⚠️ Query direta também falhou:', idError?.message);
            }

            // Último recurso: query por project_code
            console.log('⚠️ Tentando query por project_code...');
            const { data: byCode, error: codeError } = await client
                .from('projects')
                .select('*')
                .eq('project_code', projectCode)
                .single();

            if (!codeError && byCode) {
                _applyProjectData(byCode);
                return;
            }

            console.log('❌ Nenhum método funcionou. Usando localStorage.');
            loadTasksFromLocalStorage();
        } catch (error) {
            console.log('❌ Erro ao carregar tarefas por código:', error.message);
            loadTasksFromLocalStorage();
        }
        return;
    }

    // ── Acesso autenticado (por projectId) ────────────────────────────────
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

            _applyProjectData(project);
        } catch (error) {
            console.log('❌ Erro ao carregar tarefas:', error.message);
            loadTasksFromLocalStorage();
        }
    } else {
        // Sem projectId nem projectCode
        console.log('📱 Sem projectId, carregando do localStorage');
        loadTasksFromLocalStorage();
    }
}

// Aplicar dados de um projeto carregado do Supabase
function _applyProjectData(project) {
    if (project && project.data) {
        const data = project.data;
        const loadedTasks = Array.isArray(data.tasks) ? data.tasks : [];
        const loadedEvaluators = data.evaluator_names || evaluatorNames;

        tasks = loadedTasks;
        evaluatorNames = loadedEvaluators;

        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('evaluatorNames', JSON.stringify(evaluatorNames));

        // Atualizar campos de nome dos avaliadores na tela
        ['eval1','eval2','eval3','eval4'].forEach((k, i) => {
            const el = document.getElementById('evaluator' + (i + 1));
            if (el) el.value = evaluatorNames[k] || ('Avaliador ' + (i + 1));
        });

        console.log('✅ Tarefas carregadas do Supabase:', tasks.length, '| Avaliadores:', loadedEvaluators);
    } else if (project && Array.isArray(project.tasks)) {
        tasks = project.tasks;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        console.log('✅ Tarefas carregadas (alt):', tasks.length);
    } else {
        console.log('⚠️ Projeto sem tarefas, usando localStorage');
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

function getTodayISO() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isDoneTask(task) {
    return task?.stage === 'CONCLUÍDO';
}

function isOverdue(task) {
    if (!task?.dueDate || isDoneTask(task)) return false;
    return task.dueDate < getTodayISO();
}

function isDueToday(task) {
    if (!task?.dueDate || isDoneTask(task)) return false;
    return task.dueDate === getTodayISO();
}

function parseCurrencyToNumber(value) {
    if (value === null || value === undefined) return 0;
    const input = String(value).trim();
    if (!input) return 0;

    const cleaned = input.replace(/[^\d,.-]/g, '');
    if (!cleaned) return 0;

    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    let normalized = cleaned;

    if (lastComma > -1 && lastDot > -1) {
        const decimalIsComma = lastComma > lastDot;
        normalized = decimalIsComma
            ? cleaned.replace(/\./g, '').replace(',', '.')
            : cleaned.replace(/,/g, '');
    } else if (lastComma > -1) {
        normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
        normalized = cleaned.replace(/,/g, '');
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatBRL(value) {
    const numberValue = Number(value) || 0;
    return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function normalizeCost(rawValue) {
    const amount = parseCurrencyToNumber(rawValue);
    if (amount <= 0) return '';
    return formatBRL(amount);
}

function formatTaskCostInput(el) {
    if (!el) return;
    el.value = normalizeCost(el.value);
}

function formatDueDate(isoDate) {
    if (!isoDate) return '—';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
}

function buildDueDateCell(task) {
    if (!task?.dueDate) return '—';
    const baseDate = formatDueDate(task.dueDate);
    if (isOverdue(task)) return `<span class="due-overdue">${baseDate} ⚠️</span>`;
    if (isDueToday(task)) return `<span class="due-today">${baseDate} ⏰</span>`;
    return baseDate;
}

function updateSummary(filteredTasks) {
    const totalEl = document.getElementById('summaryTotal');
    const shownEl = document.getElementById('summaryShown');
    const dueTodayEl = document.getElementById('summaryDueToday');
    const overdueEl = document.getElementById('summaryOverdue');
    const costEl = document.getElementById('summaryCost');

    if (!totalEl || !shownEl || !dueTodayEl || !overdueEl || !costEl) return;

    const totalCount = tasks.length;
    const shownCount = filteredTasks.length;
    const dueTodayCount = tasks.filter(t => isDueToday(t)).length;
    const overdueCount = tasks.filter(t => isOverdue(t)).length;
    const shownCost = filteredTasks.reduce((acc, task) => acc + parseCurrencyToNumber(task.cost), 0);

    totalEl.textContent = totalCount;
    shownEl.textContent = shownCount;
    dueTodayEl.textContent = dueTodayCount;
    overdueEl.textContent = overdueCount;
    costEl.textContent = formatBRL(shownCost);

    // Update header summary
    const hdrSummary = document.getElementById('headerSummary');
    if (hdrSummary) {
        hdrSummary.innerHTML =
            `Total: <strong>${totalCount}</strong> | Exibindo: <strong>${shownCount}</strong>` +
            ` | ⏰ Hoje: <strong>${dueTodayCount}</strong>` +
            ` | ⚠️ Vencidas: <strong>${overdueCount}</strong>` +
            ` | 💰 <strong>${formatBRL(shownCost)}</strong>`;
    }
}

// Manipular envio do formulário
function handleFormSubmit(e) {
    e.preventDefault();

    const description = document.getElementById('taskDescription').value.trim();
    const stage = document.getElementById('taskStage').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const costRaw = document.getElementById('taskCost').value.trim();
    const costValue = parseCurrencyToNumber(costRaw);

    const evaluations = {
        eval1: parseInt(document.getElementById('eval1').value),
        eval2: parseInt(document.getElementById('eval2').value),
        eval3: parseInt(document.getElementById('eval3').value),
        eval4: parseInt(document.getElementById('eval4').value)
    };

    if (!description) {
        showNotification('❌ A descrição da tarefa é obrigatória.');
        return;
    }

    if (!stage) {
        showNotification('❌ O estágio da tarefa é obrigatório.');
        return;
    }

    const evals = Object.values(evaluations);
    const invalidEval = evals.some(v => !Number.isInteger(v) || v < 1 || v > 5);
    if (invalidEval) {
        showNotification('❌ Todas as notas devem estar entre 1 e 5.');
        return;
    }

    if (costRaw && costValue <= 0) {
        showNotification('❌ Informe um custo válido (ex.: R$ 5.000,00).');
        return;
    }
    
    const taskData = {
        id: editingTaskId || Date.now(),
        description: description,
        stage: stage,
        dueDate: dueDate,
        cost: costValue > 0 ? formatBRL(costValue) : '',
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
    document.getElementById('taskDueDate').value = task.dueDate || '';
    document.getElementById('taskCost').value = normalizeCost(task.cost || '');
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
    let filtered = [...tasks];

    if (currentFilter) {
        filtered = filtered.filter(t => t.stage === currentFilter);
    }

    if (currentDeadlineFilter === 'today') {
        filtered = filtered.filter(t => isDueToday(t));
    } else if (currentDeadlineFilter === 'overdue') {
        filtered = filtered.filter(t => isOverdue(t));
    }

    return filtered;
}

// Aplicar filtros
function applyFilters() {
    currentFilter = document.getElementById('filterStage').value;
    currentDeadlineFilter = document.getElementById('filterDeadline').value;
    // Sync header selects
    const hdrStg = document.getElementById('filterStageHdr');
    const hdrDl  = document.getElementById('filterDeadlineHdr');
    if (hdrStg) hdrStg.value = currentFilter;
    if (hdrDl)  hdrDl.value  = currentDeadlineFilter;
    renderTasks();
}

// Aplicar filtros a partir do header
function applyFiltersFromHeader() {
    const hdrStg = document.getElementById('filterStageHdr');
    const hdrDl  = document.getElementById('filterDeadlineHdr');
    if (hdrStg) {
        currentFilter = hdrStg.value;
        const stg = document.getElementById('filterStage');
        if (stg) stg.value = currentFilter;
    }
    if (hdrDl) {
        currentDeadlineFilter = hdrDl.value;
        const dl = document.getElementById('filterDeadline');
        if (dl) dl.value = currentDeadlineFilter;
    }
    renderTasks();
}

// Limpar filtros
function clearFilters() {
    currentFilter = '';
    currentDeadlineFilter = '';
    const filterStage    = document.getElementById('filterStage');
    const filterDeadline = document.getElementById('filterDeadline');
    const hdrStg         = document.getElementById('filterStageHdr');
    const hdrDl          = document.getElementById('filterDeadlineHdr');
    if (filterStage)    filterStage.value    = '';
    if (filterDeadline) filterDeadline.value = '';
    if (hdrStg)         hdrStg.value         = '';
    if (hdrDl)          hdrDl.value          = '';
    renderTasks();
}

// Alternar ordem de classificação
function toggleSortOrder() {
    if (currentSortOrder === 'priority') {
        currentSortOrder = 'alphabetical';
        const btn = document.getElementById('sortButtonText');
        if (btn) btn.textContent = 'ORDEM POR PRIORIDADE';
    } else {
        currentSortOrder = 'priority';
        const btn = document.getElementById('sortButtonText');
        if (btn) btn.textContent = 'ORDEM ALFABÉTICA';
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
    updateSummary(sortedTasks);
    
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
        <tr class="${isOverdue(task) ? 'row-overdue' : isDueToday(task) ? 'row-due-today' : ''}">
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
            <td>${buildDueDateCell(task)}</td>
            <td>${task.cost || '—'}</td>
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
            if (typeof showLoginRequiredModal === 'function') {
                showLoginRequiredModal();
            } else {
                showNotification('❌ Você precisa estar logado para salvar!');
            }
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

// Mostrar seleção de projetos (mesmo layout do "Salvar Tarefa")
function showProjectSelection(projects) {
    // Filtrar apenas projetos compatíveis com index.html:
    // projetos do 5w2h.html não têm data.evaluator_names
    const compatible = (projects || []).filter(p =>
        p.data && p.data.evaluator_names !== undefined
    );

    let projectsList = '';

    if (compatible.length > 0) {
        projectsList = '<div style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 15px;">';

        compatible.forEach(project => {
            const date = formatSupabaseDate(project.created_at);
            const projectCode = project.project_code ? `<br><small style="color: #667eea; font-weight: bold;">🔑 ${project.project_code}</small>` : '';
            projectsList += `
                <div onclick="confirmLoadProject('${project.id}')" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s; background: #f9f9f9;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='#f9f9f9'">
                    <strong style="color: #333;">${project.name}</strong><br>
                    <small style="color: #999;">${date}</small>
                    ${projectCode}
                </div>
            `;
        });

        projectsList += '</div>';
    } else {
        projectsList = '<p style="color: #666; margin-bottom: 15px;">Nenhum projeto encontrado para sua conta.</p>';
    }

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
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); max-width: 450px; width: 90%;">
            <h2 style="margin-top: 0; color: #333;">📥 Carregar Tarefa</h2>
            <p style="color: #666; margin-bottom: 15px;">Clique em um projeto para carregar:</p>
            ${projectsList}
            <div style="display: flex; gap: 10px;">
                <button onclick="closeLoadModal()" style="flex: 1; padding: 12px; background: #999; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);

    window.projectsList = compatible;
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

        // Persistir projeto atual para recarregar corretamente após F5
        try {
            localStorage.setItem('projectId', project.id);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            localStorage.setItem('evaluatorNames', JSON.stringify(evaluatorNames));
        } catch (e) {
            console.log('⚠️ Erro ao salvar dados do projeto no localStorage:', e?.message);
        }
        
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
        // Mostrar informação do usuário no header (email ou código em modo acesso-por-código)
        const headerButtons = document.querySelector('.header-buttons');
        if (headerButtons) {
            const userInfo = document.createElement('span');
            userInfo.style.cssText = 'color: #666; font-size: 13px; margin-right: 15px; display: flex; align-items: center;';

            const projectCode = localStorage.getItem('projectCode');
            const currentProjectCode = localStorage.getItem('currentProjectCode');

            if (user.id === 'code-access') {
                // Acesso sem login, mostrar apenas o código do projeto
                const codeToShow = projectCode || currentProjectCode || user.email;
                userInfo.innerHTML = `🔑 ${codeToShow}`;
                if (codeToShow) {
                    displayProjectCode(codeToShow);
                }
            } else {
                // Usuário autenticado por email: manter email visível e mostrar código só no banner verde
                userInfo.innerHTML = `👤 ${user.email}`;
                const codeToShow = projectCode || currentProjectCode;
                if (codeToShow) {
                    displayProjectCode(codeToShow);
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

