// Supabase Configuration
(function() {
    const SUPABASE_URL = 'https://vzfhsfrfucqoloecnvvu.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6ZmhzZnJmdWNxb2xvZWNudnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNDMyNDgsImV4cCI6MjA4MDkxOTI0OH0.LogFEV2s-erO55YqSz5sdmRydhKL6s7BP8B6TOrlfKs';
    
    let supabaseClient = null;
    let initPromise = null;
    
    // Função auxiliar para aguardar biblioteca
    async function waitForSupabaseLib(timeout = 15000) {
        const startTime = Date.now();
        
        while (!window.supabase?.createClient) {
            if (Date.now() - startTime > timeout) {
                return false;
            }
            await new Promise(r => setTimeout(r, 100));
        }
        
        return true;
    }
    
    window.initSupabase = async function() {
        if (supabaseClient) {
            return supabaseClient;
        }
        
        if (initPromise) {
            return initPromise;
        }
        
        initPromise = (async () => {
            try {
                const libReady = await waitForSupabaseLib();
                if (!libReady) {
                    return null;
                }
                
                try {
                    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    return supabaseClient;
                } catch (e) {
                    return null;
                }
            } finally {
                initPromise = null;
            }
        })();
        
        return initPromise;
    };
    
    window.getClient = function() {
        return supabaseClient;
    };
    
    // Auto-init on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            await window.initSupabase();
        });
    } else {
        window.initSupabase().catch(() => {});
    }
    
    // Também tentar após 500ms (para ter certeza)
    setTimeout(() => {
        window.initSupabase().catch(() => {});
    }, 500);
})();
