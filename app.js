// Versão de build para depuração
console.log('app.js v1735000001 carregado');

// ── Análise IA com Gemini ─────────────────────────────────────────────────────
function abrirAnaliseIA() {
    const modal = document.getElementById('iaModal');
    if (!modal) return;
    modal.style.display = 'flex';

    // Preencher campo com chave salva (oculta)
    const saved = localStorage.getItem('geminiApiKey');
    const input = document.getElementById('iaApiKeyInput');
    if (input) input.value = saved ? '••••••••••••••••' : '';

    document.getElementById('respostaIA').innerText =
        'Clique em "Analisar Projeto com IA" para obter uma análise inteligente das suas tarefas.';
}

function fecharAnaliseIA() {
    const modal = document.getElementById('iaModal');
    if (modal) modal.style.display = 'none';
}

function salvarChaveIA() {
    const input = document.getElementById('iaApiKeyInput');
    const val = input ? input.value.trim() : '';
    if (!val || val.startsWith('•')) {
        showNotification('⚠️ Cole uma chave válida antes de salvar.');
        return;
    }
    localStorage.setItem('geminiApiKey', val);
    input.value = '••••••••••••••••';
    showNotification('✅ Chave API salva com sucesso!');
}

function limparChaveIA() {
    localStorage.removeItem('geminiApiKey');
    const input = document.getElementById('iaApiKeyInput');
    if (input) input.value = '';
    showNotification('🗑️ Chave API removida.');
}

async function executarAnaliseIA() {
    const apiKey = localStorage.getItem('geminiApiKey');
    if (!apiKey) {
        showNotification('❌ Cole e salve sua chave API do Gemini antes de analisar!');
        return;
    }

    const respostaEl = document.getElementById('respostaIA');
    const btn = document.getElementById('btnAnaliseIA');
    respostaEl.innerText = '⏳ Analisando projeto com IA...';
    if (btn) { btn.disabled = true; btn.innerText = '⏳ Analisando...'; }

    // Coletar tarefas da tabela
    const tarefas = [];
    document.querySelectorAll('#tasksTableBody tr').forEach(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length < 4) return;
        const select = cols[1]?.querySelector('select');
        tarefas.push({
            status:     select ? select.value : (cols[1]?.innerText?.trim() || ''),
            descricao:  cols[2]?.innerText?.trim() || '',
            vencimento: cols[3]?.innerText?.trim() || '',
            media:      cols[cols.length - 2]?.innerText?.trim() || ''
        });
    });

    if (tarefas.length === 0) {
        respostaEl.innerText = '⚠️ Nenhuma tarefa encontrada para analisar. Adicione tarefas primeiro.';
        if (btn) { btn.disabled = false; btn.innerText = '🚀 Analisar Projeto com IA'; }
        return;
    }

    const nomeAvaliadores = Object.values(evaluatorNames).join(', ');

    const prompt = `Você é um consultor de gestão de projetos. Analise a lista de tarefas abaixo e responda em português brasileiro de forma clara, objetiva e prática.

Avaliadores do projeto: ${nomeAvaliadores}
Total de tarefas: ${tarefas.length}

Tarefas:
${JSON.stringify(tarefas, null, 2)}

Responda com:
1. 🔴 Tarefas críticas (média baixa ou status atrasado)
2. ⚠️ Tarefas que precisam de atenção imediata
3. ✅ Pontos positivos do projeto
4. 💡 Sugestões práticas para melhorar o andamento
5. 📊 Diagnóstico geral em 2-3 linhas`;

    try {
        const res = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await res.json();

        if (data.error) {
            respostaEl.innerText = '❌ Erro da API: ' + (data.error.message || JSON.stringify(data.error));
        } else {
            const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
            respostaEl.innerText = texto || '⚠️ Sem resposta da IA.';
        }
    } catch (err) {
        respostaEl.innerText = '❌ Erro de conexão: ' + err.message;
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = '🚀 Analisar Projeto com IA'; }
    }
}

// Fechar modal IA ao clicar fora
document.addEventListener('DOMContentLoaded', () => {
    const iaModal = document.getElementById('iaModal');
    if (iaModal) {
        iaModal.addEventListener('click', e => {
            if (e.target === iaModal) fecharAnaliseIA();
        });
    }
});

// ── Registrar Service Worker (PWA) ────────────────────────────────────────────
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('[SW] Registrado:', reg.scope))
            .catch(err => console.log('[SW] Erro:', err));
    });
}

// ── PWA Install Prompt ────────────────────────────────────────────────────────
let _deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    _deferredInstallPrompt = e;

    // Show banner after 3 seconds if not already dismissed
    if (!localStorage.getItem('pwa-banner-dismissed')) {
        setTimeout(() => {
            const banner = document.getElementById('pwa-install-banner');
            if (banner) banner.style.display = 'block';
        }, 3000);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const btnInstall  = document.getElementById('pwa-btn-install');
    const btnDismiss  = document.getElementById('pwa-btn-dismiss');
    const banner      = document.getElementById('pwa-install-banner');

    if (btnInstall) {
        btnInstall.addEventListener('click', async () => {
            if (!_deferredInstallPrompt) return;
            _deferredInstallPrompt.prompt();
            const { outcome } = await _deferredInstallPrompt.userChoice;
            console.log('[PWA] Install outcome:', outcome);
            _deferredInstallPrompt = null;
            if (banner) banner.style.display = 'none';
        });
    }
    if (btnDismiss) {
        btnDismiss.addEventListener('click', () => {
            if (banner) banner.style.display = 'none';
            localStorage.setItem('pwa-banner-dismissed', '1');
        });
    }
});

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

// Número de avaliadores (dinâmico, 1-10, padrão 4)
let numEvaluators = parseInt(localStorage.getItem('numEvaluators') || '4', 10);

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

    const accessByCode = !!localStorage.getItem('projectCode');
    const namesConfirmed = !!localStorage.getItem('evaluatorNamesConfirmed');

    if (!accessByCode && !namesConfirmed) {
        // ── Primeira visita: ocultar form + tabela, guiar usuário passo a passo
        hideMainSections();

        if (!localStorage.getItem('numEvaluators')) {
            // Passo 1: quantidade → Passo 2: nomes
            showNumEvaluatorsModal(function() {
                showEvaluatorNamesSetupModal(async function() {
                    showMainSections();
                    await loadTasks();
                    renderTasks();
                });
            });
        } else {
            // Número já definido mas nomes ainda não confirmados → pular para passo 2
            buildEvaluatorUI(numEvaluators);
            showEvaluatorNamesSetupModal(async function() {
                showMainSections();
                await loadTasks();
                renderTasks();
            });
        }
    } else {
        // ── Visita normal (retorno) ou acesso por código
        buildEvaluatorUI(numEvaluators);
        await loadTasks();
        renderTasks();
    }

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
    try {
        const savedNames = localStorage.getItem('evaluatorNames');
        if (savedNames) {
            evaluatorNames = JSON.parse(savedNames);
        }
        const savedNum = localStorage.getItem('numEvaluators');
        if (savedNum) {
            numEvaluators = parseInt(savedNum, 10);
        }
    } catch (e) {
        console.log('⚠️ Erro ao carregar nomes dos avaliadores:', e?.message);
    }
}

// Salvar nomes dos avaliadores
function saveEvaluatorNames() {
    try {
        for (let i = 1; i <= numEvaluators; i++) {
            const input = document.getElementById(`evaluator${i}`);
            if (input) evaluatorNames[`eval${i}`] = input.value.trim() || `Avaliador ${i}`;
        }
        localStorage.setItem('evaluatorNames', JSON.stringify(evaluatorNames));
        localStorage.setItem('evaluatorNamesConfirmed', '1');
        updateEvaluatorLabels();
        renderTasks();
        showNotification('✅ Nomes dos avaliadores salvos com sucesso!');
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
    // Update form labels
    for (let i = 1; i <= numEvaluators; i++) {
        const span = document.querySelector(`label[for="eval${i}"] .evaluator-name`);
        if (span) span.textContent = evaluatorNames[`eval${i}`] || `Avaliador ${i}`;
    }
    // Update table headers
    const headers = document.querySelectorAll('.evaluator-header');
    headers.forEach((h, i) => {
        h.textContent = evaluatorNames[`eval${i + 1}`] || `Avaliador ${i + 1}`;
    });
}

// Construir toda a UI de avaliadores dinamicamente
function buildEvaluatorUI(n) {
    numEvaluators = Math.max(1, Math.min(10, parseInt(n, 10) || 4));
    localStorage.setItem('numEvaluators', numEvaluators);

    // Garantir que evaluatorNames tem entradas para todos os avaliadores
    for (let i = 1; i <= numEvaluators; i++) {
        if (!evaluatorNames[`eval${i}`]) {
            evaluatorNames[`eval${i}`] = `Avaliador ${i}`;
        }
    }
    // Remover entradas extras (de configurações antigas com mais avaliadores)
    Object.keys(evaluatorNames).forEach(k => {
        const idx = parseInt(k.replace('eval', ''), 10);
        if (idx > numEvaluators) delete evaluatorNames[k];
    });

    // 1. Construir inputs de configuração
    const configContainer = document.getElementById('evaluatorsConfigContainer');
    if (configContainer) {
        configContainer.innerHTML = '';
        for (let i = 1; i <= numEvaluators; i++) {
            const div = document.createElement('div');
            div.className = 'evaluator-input';
            div.innerHTML = `<label>Avaliador ${i}:</label><input type="text" id="evaluator${i}" value="${evaluatorNames[`eval${i}`]}">`;
            configContainer.appendChild(div);
        }
    }

    // 2. Construir inputs do formulário
    const formRow = document.getElementById('evaluationsFormRow');
    if (formRow) {
        formRow.innerHTML = '';
        for (let i = 1; i <= numEvaluators; i++) {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.innerHTML = `<label for="eval${i}">Nota <span class="evaluator-name">${evaluatorNames[`eval${i}`]}</span> (1-5) *</label><input type="number" id="eval${i}" min="1" max="5" required>`;
            formRow.appendChild(div);
        }
    }

    // 3. Construir cabeçalhos da tabela
    buildTableHeader(numEvaluators);
}

// Construir cabeçalhos da tabela dinamicamente
function buildTableHeader(n) {
    const headerRow = document.getElementById('tableHeaderRow');
    if (!headerRow) return;
    const evalHeaders = Array.from({ length: n }, (_, i) =>
        `<th class="evaluator-col evaluator-header">${evaluatorNames[`eval${i + 1}`] || `Avaliador ${i + 1}`}</th>`
    ).join('');
    headerRow.innerHTML = `
        <th class="col-number">Nº</th>
        <th>Estágio</th>
        <th>Descrição</th>
        <th>Vencimento</th>
        <th>Custo</th>
        ${evalHeaders}
        <th class="media-col">Média</th>
        <th class="actions-header">Ações</th>
    `;
}

// Modal para definir quantidade de avaliadores
function showNumEvaluatorsModal(onConfirm) {
    const existing = document.getElementById('numEvaluatorsModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'numEvaluatorsModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:10002;';
    modal.innerHTML = `
        <div style="background:white;padding:32px;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);max-width:380px;width:90%;text-align:center;">
            <h2 style="margin-top:0;color:#333;">👥 Avaliadores do Projeto</h2>
            <p style="color:#666;margin-bottom:20px;">Quantos avaliadores terá este projeto?<br><small style="color:#999;">(entre 1 e 10 avaliadores)</small></p>
            <input type="number" id="numEvaluatorsInput" min="1" max="10" value="${numEvaluators}" style="width:100%;padding:14px;border:2px solid #667eea;border-radius:8px;box-sizing:border-box;font-size:22px;text-align:center;margin-bottom:20px;outline:none;">
            <button onclick="confirmNumEvaluators()" style="width:100%;padding:14px;background:#667eea;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:bold;">✅ Confirmar</button>
            <p style="color:#aaa;font-size:12px;margin-top:12px;margin-bottom:0;">⚠️ Alterar este valor após cadastrar tarefas reiniciará as avaliações.</p>
        </div>
    `;
    document.body.appendChild(modal);

    const input = document.getElementById('numEvaluatorsInput');
    input.focus();
    input.select();
    input.addEventListener('keypress', e => { if (e.key === 'Enter') confirmNumEvaluators(); });
    window._onConfirmNumEvaluators = onConfirm || null;
}

// Confirmar quantidade de avaliadores
function confirmNumEvaluators() {
    const val = parseInt(document.getElementById('numEvaluatorsInput').value, 10);
    if (!val || val < 1 || val > 10) {
        showNotification('❌ Escolha um número entre 1 e 10!');
        return;
    }
    const modal = document.getElementById('numEvaluatorsModal');
    if (modal) modal.remove();

    const prevNum = numEvaluators;
    buildEvaluatorUI(val);

    // Se havia tarefas e o número mudou, recalcular médias para não ficarem incorretas
    if (val !== prevNum && tasks.length > 0) {
        tasks.forEach(t => {
            t.average = calculateAverage(t.evaluations);
        });
        saveTasks();
        renderTasks();
        showNotification(`⚠️ Avaliadores alterados para ${val}. Revise as notas das tarefas existentes.`);
    }

    if (typeof window._onConfirmNumEvaluators === 'function') {
        window._onConfirmNumEvaluators(val);
        window._onConfirmNumEvaluators = null;
    }
}

// Reiniciar o assistente de configuração (passo 1 → 2)
function restartSetup() {
    localStorage.removeItem('numEvaluators');
    localStorage.removeItem('evaluatorNamesConfirmed');
    localStorage.removeItem('evaluatorNames');
    hideMainSections();
    showNumEvaluatorsModal(function() {
        showEvaluatorNamesSetupModal(async function() {
            showMainSections();
            renderTasks();
        });
    });
}

// Ocultar seções principais (usadas no fluxo de primeira configuração)
function hideMainSections() {
    const sections = ['.form-section', '.table-section', '.config-section'];
    sections.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.style.display = 'none';
    });
}

// Revelar seções principais
function showMainSections() {
    const sections = ['.form-section', '.table-section', '.config-section'];
    sections.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.style.display = '';
    });
}

// Modal passo 2: definir nomes dos avaliadores (primeira configuração)
function showEvaluatorNamesSetupModal(onConfirm) {
    const existing = document.getElementById('evaluatorNamesSetupModal');
    if (existing) existing.remove();

    let inputs = '';
    for (let i = 1; i <= numEvaluators; i++) {
        const val = evaluatorNames[`eval${i}`] || `Avaliador ${i}`;
        inputs += `
            <div style="margin-bottom:14px;">
                <label style="display:block;font-weight:600;color:#555;margin-bottom:4px;font-size:14px;">
                    👤 Avaliador ${i}
                </label>
                <input type="text" id="setupEval${i}" value="${val}"
                    placeholder="Nome do avaliador ${i}"
                    style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;box-sizing:border-box;font-size:16px;outline:none;"
                >
            </div>`;
    }

    const modal = document.createElement('div');
    modal.id = 'evaluatorNamesSetupModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:10003;padding:16px;box-sizing:border-box;';
    modal.innerHTML = `
        <div style="background:white;padding:28px;border-radius:14px;box-shadow:0 8px 40px rgba(0,0,0,0.3);width:100%;max-width:440px;max-height:90vh;overflow-y:auto;box-sizing:border-box;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:2.5rem;margin-bottom:8px;">✍️</div>
                <h2 style="margin:0 0 6px;color:#333;font-size:1.3rem;">Passo 2 de 2: Nomes dos Avaliadores</h2>
                <p style="color:#888;font-size:13px;margin:0;">Defina o nome de cada avaliador do projeto</p>
            </div>
            ${inputs}
            <button onclick="confirmEvaluatorNamesSetup()"
                style="width:100%;padding:14px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:10px;cursor:pointer;font-size:16px;font-weight:bold;margin-top:8px;">
                ✅ Confirmar e Começar
            </button>
        </div>
    `;
    document.body.appendChild(modal);

    const lastInput = document.getElementById(`setupEval${numEvaluators}`);
    if (lastInput) lastInput.addEventListener('keypress', e => { if (e.key === 'Enter') confirmEvaluatorNamesSetup(); });
    const firstInput = document.getElementById('setupEval1');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);

    window._onConfirmEvaluatorNames = onConfirm || null;
}

// Confirmar nomes dos avaliadores (passo 2 do setup)
function confirmEvaluatorNamesSetup() {
    for (let i = 1; i <= numEvaluators; i++) {
        const input = document.getElementById(`setupEval${i}`);
        if (input) evaluatorNames[`eval${i}`] = input.value.trim() || `Avaliador ${i}`;
    }
    localStorage.setItem('evaluatorNames', JSON.stringify(evaluatorNames));
    localStorage.setItem('evaluatorNamesConfirmed', '1');

    buildEvaluatorUI(numEvaluators);

    const modal = document.getElementById('evaluatorNamesSetupModal');
    if (modal) modal.remove();

    if (typeof window._onConfirmEvaluatorNames === 'function') {
        window._onConfirmEvaluatorNames();
        window._onConfirmEvaluatorNames = null;
    }
}

// Carregar tarefas
async function loadTasks() {
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
        const loadedNum = parseInt(data.num_evaluators || '4', 10);

        tasks = loadedTasks;
        evaluatorNames = loadedEvaluators;
        numEvaluators = loadedNum;

        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('evaluatorNames', JSON.stringify(evaluatorNames));
        localStorage.setItem('numEvaluators', numEvaluators);

        // Rebuild UI for the loaded evaluator count
        buildEvaluatorUI(numEvaluators);

        console.log('✅ Tarefas carregadas do Supabase:', tasks.length, '| Avaliadores:', numEvaluators);
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
    buildEvaluatorUI(numEvaluators);
    await loadTasks();
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

// Marcar automaticamente como ATRASADO tarefas vencidas que não estão CONCLUÍDAS
function autoMarkOverdueTasks() {
    let changed = false;
    tasks.forEach(task => {
        if (task.stage !== 'CONCLUÍDO' && isOverdue(task)) {
            if (task.stage !== 'ATRASADO') {
                task.stage = 'ATRASADO';
                changed = true;
            }
        }
    });
    if (changed) saveTasks();
}

// Calcular média das avaliações
function calculateAverage(evaluations) {
    let sum = 0;
    let count = 0;
    for (let i = 1; i <= numEvaluators; i++) {
        const val = parseFloat(evaluations[`eval${i}`]);
        if (!isNaN(val)) { sum += val; count++; }
    }
    return count > 0 ? (sum / count).toFixed(2) : '0.00';
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

    const evaluations = {};
    for (let i = 1; i <= numEvaluators; i++) {
        evaluations[`eval${i}`] = parseInt(document.getElementById(`eval${i}`).value);
    }

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
    for (let i = 1; i <= numEvaluators; i++) {
        const el = document.getElementById(`eval${i}`);
        if (el) el.value = task.evaluations[`eval${i}`] || '';
    }
    
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
    
    autoMarkOverdueTasks();
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
    
    tbody.innerHTML = sortedTasks.map((task, index) => {
        const evalCells = Array.from({length: numEvaluators}, (_, i) => {
            const name = evaluatorNames[`eval${i+1}`] || `Avaliador ${i+1}`;
            return `<td class="score-cell evaluator-col" data-label="${name}">${task.evaluations[`eval${i+1}`] ?? '—'}</td>`;
        }).join('');
        return `
        <tr class="${isOverdue(task) ? 'row-overdue' : isDueToday(task) ? 'row-due-today' : ''}">
            <td class="row-number">${index + 1}</td>
            <td data-label="Estágio">
                <select class="stage-select" data-stage="${task.stage}" onchange="updateTaskStage(${task.id}, this.value)">
                    <option value="ATRASADO" ${task.stage === 'ATRASADO' ? 'selected' : ''}>ATRASADO</option>
                    <option value="EM PLANEJAMENTO" ${task.stage === 'EM PLANEJAMENTO' ? 'selected' : ''}>EM PLANEJAMENTO</option>
                    <option value="INICIADO" ${task.stage === 'INICIADO' ? 'selected' : ''}>INICIADO</option>
                    <option value="EM EXECUÇÃO" ${task.stage === 'EM EXECUÇÃO' ? 'selected' : ''}>EM EXECUÇÃO</option>
                    <option value="CONCLUÍDO" ${task.stage === 'CONCLUÍDO' ? 'selected' : ''}>CONCLUÍDO</option>
                </select>
            </td>
            <td data-label="Descrição">${task.description}</td>
            <td data-label="Vencimento">${buildDueDateCell(task)}</td>
            <td data-label="Custo">${task.cost || '—'}</td>
            ${evalCells}
            <td class="media-col" data-label="Média">
                <span class="${getAverageClass(parseFloat(task.average))}">
                    ${task.average}
                </span>
            </td>
            <td class="actions-cell">
                <button class="btn btn-edit" onclick="editTask(${task.id})" title="Editar">✏️</button>
                <button class="btn btn-danger" onclick="deleteTask(${task.id})" title="Excluir">🗑️</button>
            </td>
        </tr>`;
    }).join('');
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
            num_evaluators: numEvaluators,
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
    // Filtrar projetos compatíveis com index.html.
    // Regra principal: códigos CXT sempre aparecem no index, mesmo que também
    // tenham payload fivew2h após exportação/integração com a outra tela.
    // Compatibilidade legada: projetos antigos sem project_code continuam
    // aparecendo se tiverem a estrutura clássica do index (evaluator_names + tasks).
    const compatible = (projects || []).filter(p => {
        const code = String(p?.project_code || '').toUpperCase();
        const data = p?.data || {};
        const hasMainStructure = data.evaluator_names !== undefined || Array.isArray(data.tasks);

        if (code.includes('CXT')) return true;
        if (code.includes('CEC')) return false;
        return !!(p.data && hasMainStructure);
    });

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
        numEvaluators = parseInt(project.data.num_evaluators || numEvaluators, 10);

        // Persistir projeto atual para recarregar corretamente após F5
        try {
            localStorage.setItem('projectId', project.id);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            localStorage.setItem('evaluatorNames', JSON.stringify(evaluatorNames));
            localStorage.setItem('numEvaluators', numEvaluators);
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
        buildEvaluatorUI(numEvaluators);
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

