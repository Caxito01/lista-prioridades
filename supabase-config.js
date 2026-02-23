// Supabase Configuration
(function() {
    const _a = atob('aHR0cHM6Ly92emZoc2ZyZnVjcW9sb2VjbnZ2dS5zdXBhYmFzZS5jbw==');
    const _b = atob('ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW5aNlptaHpabkptZFdOeGIyeHZaV051ZG5aMUlpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTmpVek5ETXlORGdzSW1WNGNDSTZNakE0TURreE9USTBPSDAuTG9nRkVWMnMtZXJPNTVZcVN6NXNkbVJ5ZGhLTDZzN0JQOEI2VE9ybGZLcw==');
    const SUPABASE_URL = _a;
    const SUPABASE_ANON_KEY = _b;
    
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
