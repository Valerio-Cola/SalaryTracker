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
  const activeKey = siteKey || import.meta.env.VITE_TURNSTILE_SITE_KEY || DEFAULT_SITE_KEY;

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
      if (window.turnstile && containerRef.current) {
        containerRef.current.innerHTML = '';
        try {
          window.turnstile.render(containerRef.current, {
            sitekey: activeKey,
            callback: onVerify,
            'error-callback': onError,
            'expired-callback': onExpire,
            theme,
          });
        } catch {
          // Ignora se già renderizzato
        }
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      script.onload = renderWidget;
    }
  }, [activeKey, onVerify, onError, onExpire, theme]);

  return <div ref={containerRef} className="my-2 flex justify-center" />;
};
