import { useState, useEffect, useCallback, useRef } from 'react';

interface UseModalAnimationOptions {
  isOpen?: boolean;
  onClose: () => void;
  exitDuration?: number;
  lockScroll?: boolean;
}

export function useModalAnimation({
  isOpen = true,
  onClose,
  exitDuration = 220,
  lockScroll = true,
}: UseModalAnimationOptions) {
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const isClosingRef = useRef(false);

  // Blocco dello scroll del documento con compensazione della barra di scorrimento per evitare lo "scattino" orizzontale
  useEffect(() => {
    if (!isOpen) {
      setIsMounted(false);
      setIsExiting(false);
      isClosingRef.current = false;
      return;
    }

    let originalBodyOverflow = '';
    let originalBodyOverscroll = '';
    let originalBodyPaddingRight = '';

    if (lockScroll && typeof document !== 'undefined') {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      originalBodyOverflow = document.body.style.overflow;
      originalBodyOverscroll = document.body.style.overscrollBehavior;
      originalBodyPaddingRight = document.body.style.paddingRight;

      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
    }

    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 25);

    return () => {
      clearTimeout(timer);
      if (lockScroll && typeof document !== 'undefined') {
        document.body.style.overflow = originalBodyOverflow || '';
        document.body.style.overscrollBehavior = originalBodyOverscroll || '';
        document.body.style.paddingRight = originalBodyPaddingRight || '';
        document.documentElement.style.overflow = '';
      }
    };
  }, [isOpen, lockScroll]);

  const triggerClose = useCallback(
    (customCallback?: unknown) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      setIsExiting(true);

      setTimeout(() => {
        if (typeof customCallback === 'function') {
          customCallback();
        } else {
          onClose();
        }
      }, exitDuration);
    },
    [onClose, exitDuration]
  );

  return {
    isMounted,
    isExiting,
    triggerClose,
    backdropClasses: `fixed inset-0 transition-all ${
      isMounted && !isExiting
        ? 'duration-300 ease-out bg-slate-900/60 backdrop-blur-xs opacity-100'
        : 'duration-200 ease-in bg-slate-900/0 backdrop-blur-none opacity-0 pointer-events-none'
    }`,
    cardAnimationClasses: `transition-all overscroll-contain ${
      isMounted && !isExiting
        ? 'duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-100 scale-100 translate-y-0'
        : 'duration-200 ease-in opacity-0 scale-95 translate-y-4 pointer-events-none'
    }`,
  };
}

