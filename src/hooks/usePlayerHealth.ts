import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_HEALTH = 100;
const START_IMMUNITY_MS = 5_000;

export function usePlayerHealth(isInvulnerable = false) {
  const [health, setHealth] = useState(MAX_HEALTH);
  const [isImmune, setIsImmune] = useState(true);
  const immuneUntil = useRef(Date.now() + START_IMMUNITY_MS);
  const immunityTimer = useRef<number>();

  const heal = useCallback((amount = 5) => {
    setHealth((current) => current === 0 ? 0 : Math.min(MAX_HEALTH, current + amount));
  }, []);

  const restoreHealth = useCallback((savedHealth: number) => {
    setHealth(Math.min(MAX_HEALTH, Math.max(0, savedHealth)));
  }, []);

  const takeDamage = useCallback((damage: number) => {
    if (isInvulnerable || Date.now() < immuneUntil.current) return;
    setHealth((current) => Math.max(0, current - damage));
  }, [isInvulnerable]);

  useEffect(() => {
    immunityTimer.current = window.setTimeout(() => setIsImmune(false), START_IMMUNITY_MS);
    return () => window.clearTimeout(immunityTimer.current);
  }, []);

  return { health, isImmune, heal, takeDamage, restoreHealth };
}
