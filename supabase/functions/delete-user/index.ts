// Edge Function: delete-user
// Remove o usuário do auth.users do Supabase usando a service_role key.
// Só pode ser chamada por um usuário autenticado que seja admin.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ADMIN_EMAIL = 'carloscaxito@yahoo.com.br';

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Valida token do chamador via anon client
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Não autorizado: sem token.' }, 401);
    }

    const supabaseUrl  = Deno.env.get('SUPABASE_URL')!;
    const anonKey      = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verifica quem está fazendo a chamada
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerErr } = await callerClient.auth.getUser();

    if (callerErr || !caller) {
      return json({ error: 'Não autorizado: sessão inválida.' }, 401);
    }
    if (caller.email !== ADMIN_EMAIL) {
      return json({ error: 'Não autorizado: apenas o administrador pode excluir usuários.' }, 403);
    }

    // Lê o userId do body
    const { userId } = await req.json();
    if (!userId) {
      return json({ error: 'userId é obrigatório.' }, 400);
    }
    if (userId === caller.id) {
      return json({ error: 'O administrador não pode excluir a própria conta.' }, 400);
    }

    // Usa service_role para deletar do auth.users
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { error: deleteErr } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteErr) {
      return json({ error: 'Erro ao excluir usuário: ' + deleteErr.message }, 500);
    }

    // Também remove da tabela pública users (se ainda existir)
    await adminClient.from('users').delete().eq('id', userId);

    return json({ success: true, message: 'Usuário excluído do sistema de autenticação.' });

  } catch (e) {
    return json({ error: 'Erro interno: ' + (e instanceof Error ? e.message : String(e)) }, 500);
  }
});

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
