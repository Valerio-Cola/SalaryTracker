import { ContractConfig, Shift, QuickTemplate, Expense } from '../types';

export interface SyncCredentials {
  workerUrl: string;
  userKey: string;
  passcode: string;
  autoSync: boolean;
  lastSyncedAt?: number;
}

const SYNC_CREDS_KEY = 'cf_sync_credentials';

export function getSyncCredentials(): SyncCredentials {
  try {
    const raw = localStorage.getItem(SYNC_CREDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        workerUrl: parsed.workerUrl || '',
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
    workerUrl: '',
    userKey: '',
    passcode: '',
    autoSync: true,
  };
}

export function saveSyncCredentials(creds: SyncCredentials): void {
  try {
    localStorage.setItem(SYNC_CREDS_KEY, JSON.stringify(creds));
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
  turnstileToken?: string
): Promise<{ success: boolean; message: string; data?: CloudPayload }> {
  if (!creds.workerUrl || !creds.userKey || !creds.passcode) {
    return { success: false, message: 'Credenziali o URL Cloudflare Worker mancanti.' };
  }

  const cleanUrl = creds.workerUrl.trim();

  try {
    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        userKey: creds.userKey,
        passcode: creds.passcode,
        turnstileToken,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        message: `Errore server (${res.status}): ${errText || 'Verifica credenziali o URL Worker.'}`,
      };
    }

    const json = await res.json();
    if (json.success) {
      return {
        success: true,
        message: 'Login effettuato con successo!',
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

/**
 * Invia i dati locali al Cloudflare Worker
 */
export async function pushToCloud(
  creds: SyncCredentials,
  data: { config: ContractConfig; shifts: Shift[]; templates: QuickTemplate[]; expenses?: Expense[] },
  turnstileToken?: string
): Promise<{ success: boolean; message: string; updatedAt?: number }> {
  if (!creds.workerUrl || !creds.userKey || !creds.passcode) {
    return { success: false, message: 'Credenziali o URL Cloudflare Worker mancanti.' };
  }

  const cleanUrl = creds.workerUrl.trim();
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
        message: `Errore server (${res.status}): ${errText || 'Verifica credenziali o URL Worker.'}`,
      };
    }

    const json = await res.json();
    if (json.success) {
      // Aggiorna data ultima sincronizzazione
      saveSyncCredentials({
        ...creds,
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
  if (!creds.workerUrl || !creds.userKey || !creds.passcode) {
    return { success: false, message: 'Credenziali o URL Cloudflare Worker mancanti.' };
  }

  const cleanUrl = creds.workerUrl.trim();

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
        message: `Errore server (${res.status}): ${errText || 'Verifica credenziali o URL Worker.'}`,
      };
    }

    const json = await res.json();
    if (json.success && json.data) {
      saveSyncCredentials({
        ...creds,
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
