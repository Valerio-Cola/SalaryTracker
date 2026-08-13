/**
 * Cloudflare Worker Backend per Salary Tracker SK
 * 
 * Include:
 * 1. Controllo Utenti Autorizzati (Whitelist ALLOWED_USERS)
 * 2. Verifica Anti-bot Cloudflare Turnstile per il Login
 * 3. Gestione Salvataggio/Download dati nel KV (SALARY_TRACKER_KV)
 */

// Helper per convalidare il token Turnstile con le API Cloudflare
async function verifyTurnstileToken(token, secretKey, clientIp) {
  if (!token) return false;
  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (clientIp) formData.append('remoteip', clientIp);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    const outcome = await res.json();
    return outcome.success === true;
  } catch (e) {
    return false;
  }
}

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Key, X-Passcode, X-Turnstile-Token',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const body = await request.json();
      const { action, userKey, passcode, payload, turnstileToken } = body;

      if (!userKey || !passcode) {
        return new Response(
          JSON.stringify({ success: false, error: 'Credenziali mancanti (Utente e Password obbligatori).' }),
          { status: 400, headers: corsHeaders }
        );
      }

      // LISTA UTENTI AUTORIZZATI (scrivili in minuscolo qui dentro)
      const ALLOWED_USERS = ['fedemorrri67'];

      // Normalizziamo il nome utente eliminando spazi e convertendolo in minuscolo
      const cleanUser = userKey.trim().toLowerCase();

      // Controllo Whitelist
      if (!ALLOWED_USERS.includes(cleanUser)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Nome utente non autorizzato.' }),
          { status: 403, headers: corsHeaders }
        );
      }

      const storageKey = 'user_data_' + cleanUser;
      const authKey = 'user_auth_' + cleanUser;

      if (!env.SALARY_TRACKER_KV) {
        return new Response(
          JSON.stringify({ success: false, error: 'KV Namespace (SALARY_TRACKER_KV) non collegato.' }),
          { status: 500, headers: corsHeaders }
        );
      }

      // VERIFICA TURNSTILE ANTI-BOT (eseguita solo durante il Login o se inviato il token)
      if (env.TURNSTILE_SECRET_KEY && (action === 'auth' || action === 'login' || turnstileToken)) {
        const clientIp = request.headers.get('CF-Connecting-IP');
        const isBotCheckPassed = await verifyTurnstileToken(turnstileToken, env.TURNSTILE_SECRET_KEY, clientIp);
        if (!isBotCheckPassed) {
          return new Response(
            JSON.stringify({ success: false, error: 'Verifica di sicurezza Turnstile fallita o token scaduto. Riprova.' }),
            { status: 403, headers: corsHeaders }
          );
        }
      }

      // --- AZIONE: LOGIN / AUTH ---
      if (action === 'login' || action === 'auth') {
        const existingAuth = await env.SALARY_TRACKER_KV.get(authKey);
        if (existingAuth && existingAuth !== passcode) {
          return new Response(
            JSON.stringify({ success: false, error: 'Password errata per questo utente.' }),
            { status: 401, headers: corsHeaders }
          );
        }

        if (!existingAuth) {
          await env.SALARY_TRACKER_KV.put(authKey, passcode);
        }

        const rawData = await env.SALARY_TRACKER_KV.get(storageKey);
        const parsedData = rawData ? JSON.parse(rawData) : null;

        return new Response(
          JSON.stringify({ success: true, message: 'Autenticato con successo!', data: parsedData }),
          { status: 200, headers: corsHeaders }
        );
      }

      // --- AZIONE: PUSH (Salva dati) ---
      if (action === 'push') {
        const existingAuth = await env.SALARY_TRACKER_KV.get(authKey);
        if (existingAuth && existingAuth !== passcode) {
          return new Response(
            JSON.stringify({ success: false, error: 'Password errata per questo utente.' }),
            { status: 401, headers: corsHeaders }
          );
        }

        if (!existingAuth) {
          await env.SALARY_TRACKER_KV.put(authKey, passcode);
        }

        await env.SALARY_TRACKER_KV.put(storageKey, JSON.stringify(payload));
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
      }

      // --- AZIONE: PULL (Scarica dati) ---
      if (action === 'pull') {
        const storedAuth = await env.SALARY_TRACKER_KV.get(authKey);
        if (!storedAuth || storedAuth !== passcode) {
          return new Response(
            JSON.stringify({ success: false, error: 'Password errata o utente non trovato.' }),
            { status: 401, headers: corsHeaders }
          );
        }

        const raw = await env.SALARY_TRACKER_KV.get(storageKey);
        const data = raw ? JSON.parse(raw) : null;

        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: corsHeaders }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Azione non valida.' }),
        { status: 400, headers: corsHeaders }
      );
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, error: e.message }),
        { status: 500, headers: corsHeaders }
      );
    }
  }
};
