import { useCallback, useRef, useState } from 'react';
import type { ArrowData } from '../components/game/ArrowShot';

export function useArrowShots() {
  const [arrows, setArrows] = useState<ArrowData[]>([]);
  const nextId = useRef(0);

  const shootArrow = useCallback((x: number, y: number, targetX: number, targetY: number) => {
    const id = nextId.current += 1;
    setArrows((current) => [...current, { id, x, y, targetX, targetY, flightMs: 280 }]);
    window.setTimeout(() => setArrows((current) => current.filter((arrow) => arrow.id !== id)), 280);
  }, []);

  return { arrows, shootArrow };
}
