// Guard: evitar redeclaração se o script já foi carregado
if (typeof waitForSupabase === 'undefined') {
    // Configuração do Supabase - SIMPLES E DIRETO
    const SUPABASE_URL = 'https://vzfhsfrfucqoloecnvvu.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6ZmhzZnJmdWNxb2xvZWNudnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNDMyNDgsImV4cCI6MjA4MDkxOTI0OH0.LogFEV2s-erO55YqSz5sdmRydhKL6s7BP8B6TOrlfKs';

    let supabaseClient = null;

    // Função simples para aguardar o Supabase estar pronto
    async function waitForSupabase() {
        // Se já está pronto, retorna imediatamente
        if (supabaseClient) {
            return supabaseClient;
        }
        
        // Aguarda a biblioteca Supabase estar disponível
        let tentativas = 0;
        while (!window.supabase && tentativas < 100) {
            await new Promise(r => setTimeout(r, 50));
            tentativas++;
        }
        
        // Se conseguiu carregar a biblioteca, cria o cliente
        if (window.supabase && window.supabase.createClient) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            return supabaseClient;
        }
        
        return null;
    }

    // Tenta inicializar assim que possível
    setTimeout(() => {
        if (window.supabase && window.supabase.createClient && !supabaseClient) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    }, 100);
}
