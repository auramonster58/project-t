import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';

export type HealthParticleData = { id: number; x: number; y: number };
type Position = { x: number; y: number };

export function useHealthParticles(playerPosition: MutableRefObject<Position>, onHeal: (amount?: number) => void) {
  const [particles, setParticles] = useState<HealthParticleData[]>([]);
  const particlesRef = useRef<HealthParticleData[]>([]);
  const nextId = useRef(20_000);

  const dropHealth = useCallback((x: number, y: number) => {
    setParticles((current) => [...current, ...[-34, 0, 34].map((offset, index) => ({
      id: nextId.current += 1,
      x: x + offset,
      y: y + (index === 1 ? -3 : 2),
    }))]);
  }, []);

  useEffect(() => { particlesRef.current = particles; }, [particles]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const player = playerPosition.current;
      const collected = particlesRef.current.filter((particle) => Math.hypot(
        particle.x - player.x, (particle.y - player.y) * 9,
      ) < 85);
      if (collected.length === 0) return;
      onHeal(collected.length * 5);
      const ids = new Set(collected.map((particle) => particle.id));
      setParticles((current) => current.filter((particle) => !ids.has(particle.id)));
    }, 100);
    return () => window.clearInterval(timer);
  }, [onHeal, playerPosition]);

  return { particles, dropHealth };
}
