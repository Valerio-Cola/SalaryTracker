import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Hook per consentire lo scorrimento orizzontale di un contenitore con:
 * 1. Rotella del mouse (converte deltaY in scrollLeft orizzontale)
 * 2. Drag & drop con il puntatore del mouse (click e trascinamento stile canvas)
 * 3. Barra di scorrimento nativa visibile e utilizzabile
 */
export function useDraggableScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const initialScrollLeft = useRef(0);
  const isDragging = useRef(false);
  const [isGrabbing, setIsGrabbing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Gestione rotella del mouse: scorrimento orizzontale fluido
    const handleWheel = (e: WheelEvent) => {
      // Se c'è movimento verticale della rotellina, lo reindirizziamo allo scroll orizzontale
      if (e.deltaY !== 0 && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    isDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - el.offsetLeft;
    initialScrollLeft.current = el.scrollLeft;
    setIsGrabbing(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!isDown.current || !el) return;

    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.25;

    if (Math.abs(walk) > 4) {
      isDragging.current = true;
      el.scrollLeft = initialScrollLeft.current - walk;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDown.current = false;
    setIsGrabbing(false);
    // Timeout breve per evitare che il click si attivi sul rilascio del drag
    setTimeout(() => {
      isDragging.current = false;
    }, 50);
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDown.current = false;
    setIsGrabbing(false);
    setTimeout(() => {
      isDragging.current = false;
    }, 50);
  }, []);

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    // Se l'utente ha trascinato il mouse, previene il click accidentale sul pulsante del tab
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return {
    ref,
    isGrabbing,
    scrollProps: {
      ref,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onClickCapture: handleClickCapture,
    },
  };
}
