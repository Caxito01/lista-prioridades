// 🧪 TESTE COMPLETO DO SUPABASE - COPIE E COLE NO CONSOLE (F12)

console.clear();
console.log('🧪 INICIANDO TESTE COMPLETO DO SUPABASE\n');

// ============================================
// 1. TESTE DE INICIALIZAÇÃO DO SUPABASE
// ============================================
async function testeSupabaseInit() {
    console.log('\n📝 TESTE 1: Inicialização do Supabase');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        // Testar inicialização
        console.log('⏳ Chamando window.initSupabase()...');
        const result = await window.initSupabase();
        
        console.log('✅ initSupabase() retornou:', !!result);
        
        // Testar getClient
        const client = window.getClient();
        console.log('✅ getClient() retornou:', !!client);
        console.log('✅ client.auth existe?', !!client?.auth);
        console.log('✅ client.from existe?', !!client?.from);
        
        return client;
    } catch (error) {
        console.error('❌ Erro em Supabase init:', error.message);
        return null;
    }
}

// ============================================
// 2. TESTE DE AUTENTICAÇÃO
// ============================================
async function testeAuth(client) {
    console.log('\n📝 TESTE 2: Verificação de Autenticação');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        if (!client) {
            console.error('❌ Cliente não disponível');
            return null;
        }
        
        console.log('⏳ Tentando getSession()...');
        const { data, error } = await client.auth.getSession();
        
        if (error) {
            console.error('❌ Erro em getSession():', error.message);
            return null;
        }
        
        const session = data?.session;
        
        if (session) {
            console.log('✅ Sessão ativa!');
            console.log('   User ID:', session.user.id.substring(0, 8) + '...');
            console.log('   Email:', session.user.email);
            console.log('   Criado em:', new Date(session.created_at).toLocaleString());
            return session;
        } else {
            console.log('⚠️ Nenhuma sessão ativa (não logado)');
            return null;
        }
    } catch (error) {
        console.error('❌ Erro em Auth:', error.message);
        return null;
    }
}

// ============================================
// 3. TESTE DE TABELA PROJECTS
// ============================================
async function testeProjects(client, session) {
    console.log('\n📝 TESTE 3: Tabela de Projetos');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        if (!client) {
            console.error('❌ Cliente não disponível');
            return [];
        }
        
        if (!session) {
            console.log('⚠️ Sem sessão, não pode filtrar por user_id');
            console.log('⏳ Tentando listar todos os projetos...');
        } else {
            console.log('⏳ Carregando projetos do usuário:', session.user.email);
        }
        
        const query = client
            .from('projects')
            .select('id, name, project_code, created_at, user_id');
        
        if (session) {
            query.eq('user_id', session.user.id).limit(5);
        } else {
            query.limit(5);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('❌ Erro ao listar projetos:', error.message);
            console.error('   Código:', error.code);
            return [];
        }
        
        if (data && data.length > 0) {
            console.log('✅ Projetos encontrados:', data.length);
            data.forEach((p, i) => {
                console.log(`   ${i + 1}. ${p.name}`);
                console.log(`      Código: ${p.project_code || 'sem código'}`);
                console.log(`      ID: ${p.id.substring(0, 8)}...`);
                console.log(`      Criado: ${new Date(p.created_at).toLocaleString()}`);
            });
            return data;
        } else {
            console.log('⚠️ Nenhum projeto encontrado');
            return [];
        }
    } catch (error) {
        console.error('❌ Erro geral em Projects:', error.message);
        return [];
    }
}

// ============================================
// 4. TESTE DE RLS (Row Level Security)
// ============================================
async function testeRLS(client, session) {
    console.log('\n📝 TESTE 4: RLS (Row Level Security)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        if (!client || !session) {
            console.log('⚠️ RLS requer autenticação, skipping...');
            return;
        }
        
        console.log('⏳ Testando se RLS está funcionando...');
        
        // Tentar listar TODOS os projetos
        const { data: allProjects, error: allError } = await client
            .from('projects')
            .select('id, user_id')
            .limit(100);
        
        if (allError) {
            console.log('✅ RLS está ATIVO (não consegue ver projetos de outros)');
            console.log('   Erro esperado:', allError.message.substring(0, 50) + '...');
        } else if (allProjects) {
            console.log('✅ RLS permite ver projetos (verificando...');
            
            // Verificar se todos pertencem ao usuário
            const otherUsers = allProjects.filter(p => p.user_id !== session.user.id);
            
            if (otherUsers.length === 0) {
                console.log('✅ RLS está funcionando: só vê próprios projetos');
            } else {
                console.warn('⚠️ RLS pode estar com problema: vendo projetos de outros');
            }
        }
    } catch (error) {
        console.error('❌ Erro ao testar RLS:', error.message);
    }
}

// ============================================
// 5. TESTE DE FUNÇÕES SQL (RPC)
// ============================================
async function testeRPC(client) {
    console.log('\n📝 TESTE 5: Funções SQL (RPC)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        if (!client) {
            console.error('❌ Cliente não disponível');
            return;
        }
        
        // Listar funções disponíveis (função padrão do Supabase)
        const { data, error } = await client.rpc('get_project_by_code', { 
            p_code: 'TESTE'
        }).catch(e => ({ data: null, error: e }));
        
        if (error && error.message.includes('does not exist')) {
            console.warn('⚠️ Função get_project_by_code não existe');
            console.log('   Você precisa criar essa função no SQL do Supabase');
            return;
        }
        
        if (error) {
            console.log('⚠️ Erro ao chamar RPC:', error.message);
            return;
        }
        
        console.log('✅ RPC get_project_by_code está disponível');
    } catch (error) {
        console.error('❌ Erro ao testar RPC:', error.message);
    }
}

// ============================================
// EXECUTAR TODOS OS TESTES
// ============================================
async function rodarTodosTestes() {
    console.log('\n' + '='.repeat(50));
    console.log('🧪 TESTE COMPLETO DO SUPABASE');
    console.log('='.repeat(50));
    
    let client = await testeSupabaseInit();
    let session = await testeAuth(client);
    let projects = await testeProjects(client, session);
    await testeRLS(client, session);
    await testeRPC(client);
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DOS TESTES');
    console.log('='.repeat(50));
    
    console.log('\n✅ Se tudo acima está em VERDE, o Supabase está funcionando!');
    console.log('❌ Se há erros em VERMELHO, anote a mensagem exata para corrigir');
    console.log('\n📌 Próximo passo: testar as funções do app.js');
    console.log('   - saveToDatabase()');
    console.log('   - loadFromDatabase()');
    console.log('   - performSaveProject()');
}

// Iniciar testes
rodarTodosTestes().catch(e => console.error('Erro fatal:', e));
