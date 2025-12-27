// Supabase Configuration - Inicializa corretamente com retry robusto
(function() {
    const SUPABASE_URL = 'https://vzfhsfrfucqoloecnvvu.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6ZmhzZnJmdWNxb2xvZWNudnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNDMyNDgsImV4cCI6MjA4MDkxOTI0OH0.LogFEV2s-erO55YqSz5sdmRydhKL6s7BP8B6TOrlfKs';
    
    let supabaseClient = null;
    let initPromise = null;
    
    // Função auxiliar para aguardar biblioteca
    async function waitForSupabaseLib(timeout = 15000) {
        console.log('⏳ Aguardando Supabase JS library carregar...');
        const startTime = Date.now();
        let lastLog = 0;
        
        while (!window.supabase?.createClient) {
            if (Date.now() - startTime > timeout) {
                console.error('❌ TIMEOUT: Supabase JS não carregou em ' + timeout + 'ms');
                console.error('   window.supabase existe?', !!window.supabase);
                if (window.supabase) {
                    console.error('   window.supabase.createClient existe?', !!window.supabase.createClient);
                }
                return false;
            }
            
            // Log a cada 2 segundos
            if (Date.now() - lastLog > 2000) {
                console.log('   ⏳ Aguardando... (' + Math.round((Date.now() - startTime) / 1000) + 's)');
                lastLog = Date.now();
            }
            
            await new Promise(r => setTimeout(r, 100));
        }
        
        console.log('✅ Supabase JS disponível após ' + (Date.now() - startTime) + 'ms');
        return true;
    }
    
    window.initSupabase = async function() {
        console.log('⏳ initSupabase chamada');
        
        // Se já inicializado, retornar imediatamente
        if (supabaseClient) {
            console.log('✅ Supabase já inicializado');
            return supabaseClient;
        }
        
        // Se já está inicializando, aguardar aquela promise
        if (initPromise) {
            console.log('⏳ Já em inicialização, aguardando promise...');
            return initPromise;
        }
        
        // Criar nova promise de inicialização
        initPromise = (async () => {
            try {
                console.log('🔄 Iniciando Supabase...');
                
                // Aguardar a biblioteca carregar
                const libReady = await waitForSupabaseLib();
                if (!libReady) {
                    console.error('❌ Biblioteca Supabase JS não carregou');
                    return null;
                }
                
                console.log('✅ Supabase JS carregado, criando cliente...');
                try {
                    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    console.log('✅ Client Supabase criado com sucesso!');
                    console.log('✅ Client.auth:', !!supabaseClient?.auth);
                    console.log('✅ Client.from:', !!supabaseClient?.from);
                    return supabaseClient;
                } catch (e) {
                    console.error('❌ Erro ao criar client:', e.message);
                    return null;
                }
            } finally {
                // Limpar a promise para permitir reinicializações
                initPromise = null;
            }
        })();
        
        return initPromise;
    };
    
    window.getClient = function() {
        if (!supabaseClient) {
            console.warn('⚠️ Client Supabase não inicializado ainda');
        }
        return supabaseClient;
    };
    
    // Auto-init on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('📄 DOMContentLoaded - iniciando Supabase...');
            await window.initSupabase();
        });
    } else {
        console.log('📄 Document já carregado - iniciando Supabase...');
        window.initSupabase().catch(e => console.error('Erro ao iniciar:', e));
    }
    
    // Também tentar após 500ms (para ter certeza)
    setTimeout(() => {
        console.log('⏱️ Tentativa de inicialização após 500ms...');
        window.initSupabase().catch(e => console.error('Erro:', e));
    }, 500);
})();
