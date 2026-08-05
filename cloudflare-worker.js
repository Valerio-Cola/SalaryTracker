/**
 * Cloudflare Worker Backend per Salary Tracker SK
 * 
 * ISTRUZIONI PER LA RAGAZZA / UTENTE PRIVILEGIATO:
 * 1. Crea un KV Namespace su Cloudflare Dashboard -> Storage & Databases -> KV -> "Crea Namespace" (es. nome: SALARY_TRACKER_KV)
 * 2. Incolla questo codice nel tuo Worker su Cloudflare Workers
 * 3. Vai su Impostazioni Worker -> Bindings -> Aggiungi KV Namespace Binding col nome variabile: SALARY_TRACKER_KV
 * 4. Salva e Distribuisci!
 */

export default {
  async fetch(request, env) {
    // Gestione CORS preflight (permette chiamate da qualsiasi dominio / da Cloudflare Pages)
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Key, X-Passcode',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Accetta solo richieste POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Metodo non consentito. Usa POST.' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    try {
      const body = await request.json();
      const { action, userKey, passcode, payload } = body;

      // Controlli base di validazione
      if (!userKey || !passcode) {
        return new Response(
          JSON.stringify({ success: false, error: 'UserKey e Passcode sono obbligatori.' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Genera una chiave sicura separata nel KV basata su userKey e un hash/prefisso
      const storageKey = `user_data_${userKey.toLowerCase().trim()}`;
      const authKey = `user_auth_${userKey.toLowerCase().trim()}`;

      // Verifica se il KV Namespace è collegato correttamente
      if (!env.SALARY_TRACKER_KV) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'KV Namespace (SALARY_TRACKER_KV) non associato nelle impostazioni del Worker.',
          }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // --- AZIONE: PUSH (Salva dati) ---
      if (action === 'push') {
        // Verifica se l'utente ha già una password salvata nel KV
        const existingAuth = await env.SALARY_TRACKER_KV.get(authKey);

        if (existingAuth && existingAuth !== passcode) {
          return new Response(
            JSON.stringify({ success: false, error: 'Password o Passcode non corretta per questo Utente.' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        // Se è la prima volta che l'utente salva, registra la sua passcode
        if (!existingAuth) {
          await env.SALARY_TRACKER_KV.put(authKey, passcode);
        }

        // Salva il payload JSON contenente turni, tariffe e data di aggiornamento
        await env.SALARY_TRACKER_KV.put(storageKey, JSON.stringify(payload));

        return new Response(
          JSON.stringify({ success: true, message: 'Dati salvati con successo su Cloudflare KV!' }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // --- AZIONE: PULL (Scarica dati) ---
      if (action === 'pull') {
        const storedAuth = await env.SALARY_TRACKER_KV.get(authKey);

        if (!storedAuth) {
          return new Response(
            JSON.stringify({ success: false, error: 'Utente non trovato o nessun dato ancora salvato.' }),
            { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        if (storedAuth !== passcode) {
          return new Response(
            JSON.stringify({ success: false, error: 'Password o Passcode errata.' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const rawData = await env.SALARY_TRACKER_KV.get(storageKey);
        if (!rawData) {
          return new Response(
            JSON.stringify({ success: false, error: 'Nessun dato trovato per questo utente.' }),
            { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const parsedData = JSON.parse(rawData);

        return new Response(
          JSON.stringify({ success: true, data: parsedData }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Azione non valida. Usa "push" o "pull".' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, error: `Errore interno al Worker: ${err.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  },
};
