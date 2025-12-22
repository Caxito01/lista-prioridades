// Supabase Configuration - Ultra Simples
(function() {
    const SUPABASE_URL = 'https://vzfhsfrfucqoloecnvvu.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6ZmhzZnJmdWNxb2xvZWNudnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNDMyNDgsImV4cCI6MjA4MDkxOTI0OH0.LogFEV2s-erO55YqSz5sdmRydhKL6s7BP8B6TOrlfKs';
    
    let supabaseClient = null;
    
    window.initSupabase = async function() {
        if (supabaseClient) return supabaseClient;
        
        // Aguardar a biblioteca estar disponível
        for (let i = 0; i < 50; i++) {
            if (window.supabase?.createClient) {
                supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                return supabaseClient;
            }
            await new Promise(r => setTimeout(r, 100));
        }
        return null;
    };
    
    window.getClient = function() {
        return supabaseClient;
    };
    
    // Auto-init on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initSupabase);
    } else {
        window.initSupabase();
    }
    
    // Also try after 100ms
    setTimeout(window.initSupabase, 100);
})();
