// Versão de build para depuração
console.log('supabase-init.js v1735000000 carregado');

// Inicialização simples do Supabase
const SUPABASE_URL = 'https://vzfhsfrfucqoloecnvvu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6ZmhzZnJmdWNxb2xvZWNudnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNDMyNDgsImV4cCI6MjA4MDkxOTI0OH0.LogFEV2s-erO55YqSz5sdmRydhKL6s7BP8B6TOrlfKs';

let supabaseClient = null;

window.initSupabaseSimple = function() {
    if (supabaseClient) {
        console.log('✅ Supabase já inicializado');
        return supabaseClient;
    }
    
    if (!window.supabase) {
        console.error('❌ Supabase JS não carregou');
        return null;
    }
    
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase inicializado com sucesso');
        return supabaseClient;
    } catch (e) {
        console.error('❌ Erro ao criar cliente:', e.message);
        return null;
    }
};

window.getSupabase = function() {
    return supabaseClient;
};

// Compatibilidade com código legado: aliases
// initSupabase() aguarda o SDK e garante cliente criado
window.initSupabase = async function() {
    if (supabaseClient) return true;

    const waitForSdk = () => new Promise(resolve => {
        if (window.supabase && window.supabase.createClient) return resolve(true);
        let attempts = 0;
        const id = setInterval(() => {
            attempts++;
            if (window.supabase && window.supabase.createClient) {
                clearInterval(id);
                resolve(true);
            } else if (attempts >= 50) {
                clearInterval(id);
                resolve(false);
            }
        }, 100);
    });

    const ok = await waitForSdk();
    if (!ok) {
        console.error('❌ Supabase SDK não disponível após 5s');
        return false;
    }
    const client = window.initSupabaseSimple();
    return !!client;
};

// getClient() legado → retorna o mesmo cliente
window.getClient = function() {
    return window.getSupabase();
};

// Tentar inicializar imediatamente
if (window.supabase && window.supabase.createClient) {
    window.initSupabaseSimple();
} else {
    // Tentar a cada 100ms (máx 50 tentativas = 5 segundos)
    let attempts = 0;
    const initInterval = setInterval(function() {
        attempts++;
        
        if (window.supabase && window.supabase.createClient) {
            clearInterval(initInterval);
            window.initSupabaseSimple();
        } else if (attempts >= 50) {
            clearInterval(initInterval);
            console.error('❌ Supabase JS não carregou');
        }
    }, 100);
}
