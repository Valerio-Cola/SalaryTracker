import { ContractConfig, Shift, QuickTemplate, Expense } from '../types';

export interface SyncCredentials {
  workerUrl: string;
  userKey: string;
  passcode: string;
  autoSync: boolean;
  lastSyncedAt?: number;
}

export const DEFAULT_WORKER_URL = 'https://salary-tracker-worker-fire-c543hg5h343gfd91f.companyclstudio.workers.dev';

const SYNC_CREDS_KEY = 'cf_sync_credentials';

export function getSyncCredentials(): SyncCredentials {
  try {
    const raw = localStorage.getItem(SYNC_CREDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        workerUrl: (parsed.workerUrl && parsed.workerUrl.trim()) ? parsed.workerUrl.trim() : DEFAULT_WORKER_URL,
        userKey: parsed.userKey || '',
        passcode: parsed.passcode || '',
        autoSync: parsed.autoSync !== undefined ? !!parsed.autoSync : true,
        lastSyncedAt: parsed.lastSyncedAt,
      };
    }
  } catch (e) {
    console.error('Error reading sync credentials', e);
  }
  return {
    workerUrl: DEFAULT_WORKER_URL,
    userKey: '',
    passcode: '',
    autoSync: true,
  };
}

export function saveSyncCredentials(creds: SyncCredentials): void {
  try {
    const toSave: SyncCredentials = {
      ...creds,
      workerUrl: (creds.workerUrl && creds.workerUrl.trim()) ? creds.workerUrl.trim() : DEFAULT_WORKER_URL,
    };
    localStorage.setItem(SYNC_CREDS_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Error saving sync credentials', e);
  }
}

export interface CloudPayload {
  config: ContractConfig;
  shifts: Shift[];
  templates: QuickTemplate[];
  expenses?: Expense[];
  updatedAt: number;
}

/**
 * Autenticazione / Login al Cloudflare Worker con supporto Turnstile
 */
export async function loginToCloud(
  creds: SyncCredentials,
  turnstileToken?: string,
  authMode: 'login' | 'register' = 'login'
): Promise<{ success: boolean; message: string; data?: CloudPayload }> {
  const cleanUrl = (creds.workerUrl || DEFAULT_WORKER_URL).trim();

  if (!cleanUrl || !creds.userKey || !creds.passcode) {
    return { success: false, message: 'Credenziali mancanti (Nome Utente e Password obbligatori).' };
  }

  try {
    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: authMode === 'register' ? 'register' : 'login',
        authMode,
        userKey: creds.userKey.trim(),
        passcode: creds.passcode,
        turnstileToken,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let parsedError = '';
      try {
        const parsed = JSON.parse(errText);
        if (parsed && typeof parsed === 'object') {
          if (typeof parsed.error === 'string' && parsed.error.trim()) {
            parsedError = parsed.error.trim();
          } else if (typeof parsed.message === 'string' && parsed.message.trim()) {
            parsedError = parsed.message.trim();
          }
        }
      } catch (_) {}

      // Se il testo d'errore inizia con JSON non parsato (es. {"success":false,...}), ripuliscilo
      if (!parsedError && errText) {
        const match = errText.match(/"error"\s*:\s*"([^"]+)"/);
        if (match && match[1]) {
          parsedError = match[1];
        }
      }

      return {
        success: false,
        message: parsedError || (errText && !errText.startsWith('{') ? errText : `Errore di autorizzazione o server (${res.status}).`),
      };
    }

    const json = await res.json();
    if (json.success) {
      return {
        success: true,
        message: json.message || (authMode === 'register' ? 'Primo accesso completato!' : 'Login effettuato con successo!'),
        data: json.data || undefined,
      };
    } else {
      return { success: false, message: json.error || 'Autenticazione fallita.' };
    }
  } catch (e: any) {
    return {
      success: false,
      message: `Impossibile collegarsi al Worker: ${e?.message || 'Verifica la connessione o l\'URL del Worker.'}`,
    };
  }
}

function extractErrorMessage(errText: string, status: number, fallback: string): string {
  if (!errText) return `${fallback} (${status}).`;
  try {
    const parsed = JSON.parse(errText);
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.error === 'string' && parsed.error.trim()) {
        return parsed.error.trim();
      }
      if (typeof parsed.message === 'string' && parsed.message.trim()) {
        return parsed.message.trim();
      }
    }
  } catch (_) {}

  const match = errText.match(/"error"\s*:\s*"([^"]+)"/);
  if (match && match[1]) {
    return match[1].trim();
  }

  if (!errText.startsWith('{') && !errText.startsWith('<')) {
    return errText.trim();
  }

  return `${fallback} (${status}).`;
}

/**
 * Invia i dati locali al Cloudflare Worker
 */
export async function pushToCloud(
  creds: SyncCredentials,
  data: { config: ContractConfig; shifts: Shift[]; templates: QuickTemplate[]; expenses?: Expense[] },
  turnstileToken?: string
): Promise<{ success: boolean; message: string; updatedAt?: number }> {
  const cleanUrl = (creds.workerUrl || DEFAULT_WORKER_URL).trim();

  if (!cleanUrl || !creds.userKey || !creds.passcode) {
    return { success: false, message: 'Credenziali di sincronizzazione mancanti.' };
  }

  const payload: CloudPayload = {
    ...data,
    expenses: data.expenses || [],
    updatedAt: Date.now(),
  };

  try {
    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Key': creds.userKey,
        'X-Passcode': creds.passcode,
      },
      body: JSON.stringify({
        action: 'push',
        userKey: creds.userKey,
        passcode: creds.passcode,
        turnstileToken,
        payload,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        message: extractErrorMessage(errText, res.status, 'Errore durante il salvataggio dei dati'),
      };
    }

    const json = await res.json();
    if (json.success) {
      // Aggiorna data ultima sincronizzazione
      saveSyncCredentials({
        ...creds,
        workerUrl: cleanUrl,
        lastSyncedAt: payload.updatedAt,
      });
      return {
        success: true,
        message: 'Dati salvati con successo sul Cloudflare Worker!',
        updatedAt: payload.updatedAt,
      };
    } else {
      return { success: false, message: json.error || 'Operazione fallita sul server.' };
    }
  } catch (e: any) {
    return {
      success: false,
      message: `Impossibile collegarsi al Worker: ${e?.message || 'Controlla la tua connessione internet o la configurazione CORS.'}`,
    };
  }
}

/**
 * Scarica i dati dal Cloudflare Worker
 */
export async function pullFromCloud(
  creds: SyncCredentials,
  turnstileToken?: string
): Promise<{ success: boolean; message: string; data?: CloudPayload }> {
  const cleanUrl = (creds.workerUrl || DEFAULT_WORKER_URL).trim();

  if (!cleanUrl || !creds.userKey || !creds.passcode) {
    return { success: false, message: 'Credenziali di sincronizzazione mancanti.' };
  }

  try {
    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Key': creds.userKey,
        'X-Passcode': creds.passcode,
      },
      body: JSON.stringify({
        action: 'pull',
        userKey: creds.userKey,
        passcode: creds.passcode,
        turnstileToken,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        message: extractErrorMessage(errText, res.status, 'Errore durante il download dei dati'),
      };
    }

    const json = await res.json();
    if (json.success && json.data) {
      saveSyncCredentials({
        ...creds,
        workerUrl: cleanUrl,
        lastSyncedAt: json.data.updatedAt || Date.now(),
      });
      return {
        success: true,
        message: 'Dati scaricati con successo dal Cloud!',
        data: json.data,
      };
    } else {
      return { success: false, message: json.error || 'Nessun dato trovato o password errata.' };
    }
  } catch (e: any) {
    return {
      success: false,
      message: `Errore di connessione al Cloudflare Worker: ${e?.message || 'Verifica la connessione o l\'URL del Worker.'}`,
    };
  }
}

/**
 * Eliminazione definitiva dell'account e di tutti i dati dal Cloudflare KV Storage (GDPR Art. 17)
 */
export async function deleteAccountFromCloud(
  creds: SyncCredentials,
  passcodeConfirmation?: string
): Promise<{ success: boolean; message: string }> {
  const passcodeToSend = passcodeConfirmation !== undefined ? passcodeConfirmation : creds.passcode;
  const cleanUrl = (creds.workerUrl || DEFAULT_WORKER_URL).trim();

  if (!cleanUrl || !creds.userKey || !passcodeToSend) {
    return { success: false, message: 'Credenziali o password mancanti.' };
  }

  try {
    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Key': creds.userKey,
        'X-Passcode': passcodeToSend,
      },
      body: JSON.stringify({
        action: 'delete_account',
        userKey: creds.userKey,
        passcode: passcodeToSend,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        message: extractErrorMessage(errText, res.status, 'Impossibile eliminare l\'account'),
      };
    }

    const json = await res.json();
    if (json.success) {
      return {
        success: true,
        message: json.message || 'Account e dati cloud eliminati definitivamente.',
      };
    } else {
      return {
        success: false,
        message: json.error || 'Errore durante la cancellazione dell\'account.',
      };
    }
  } catch (e: any) {
    return {
      success: false,
      message: `Errore di connessione al Cloudflare Worker: ${e?.message || 'Impossibile raggiungere il server.'}`,
    };
  }
}

