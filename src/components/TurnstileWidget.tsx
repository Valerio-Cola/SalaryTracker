import React, { useEffect, useRef } from 'react';

interface TurnstileWidgetProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

// Key specifica del tuo progetto Turnstile
const DEFAULT_SITE_KEY = '0x4AAAAAAEO0zS_26uGaZDVQ';

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  siteKey,
  onVerify,
  onError,
  onExpire,
  theme = 'auto',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeKey = siteKey || (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY || DEFAULT_SITE_KEY;

  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const scriptId = 'cf-turnstile-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: activeKey,
            callback: (token: string) => {
              if (onVerify) onVerify(token);
            },
            'error-callback': () => {
              if (onError) onError();
            },
            'expired-callback': () => {
              if (onExpire) onExpire();
            },
            theme: theme as 'light' | 'dark' | 'auto',
          });
        } catch {
          // Ignora se già renderizzato
        }
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      script.addEventListener('load', renderWidget);
    }
    
    // Cleanup - ma attenzione a non rimuovere il div container
    return () => {
      // Non resettiamo qui per evitare loop continui se l'app si ricarica spesso
      if (script && !window.turnstile) {
         script.removeEventListener('load', renderWidget);
      }
    };
    // Disabilitiamo eslint per le dipendenze per non causare re-render quando onVerify cambia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, theme]);

  return <div ref={containerRef} className="my-2 flex justify-center" />;
};
