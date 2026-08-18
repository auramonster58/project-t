import { useCallback, useEffect, useRef, useState } from 'react';

type TargetPhase = 'waiting' | 'ready';

export type HunterSkillState = {
  target: { id: number; x: number; y: number; phase: TargetPhase };
  hits: number;
  misses: number;
  tutorial: boolean;
  hunterLooking: boolean;
};

const REQUIRED_HITS = 4;
const MAX_MISSES = 2;

function createTarget(id: number) {
  return { id, x: 18 + Math.random() * 64, y: 22 + Math.random() * 54,
    phase: 'waiting' as const };
}

export function useHunterSkillCheck(onFail: () => void, onComplete: () => void) {
  const [skillCheck, setSkillCheck] = useState<HunterSkillState | null>(null);
  const skillRef = useRef(skillCheck);
  const tutorialSeen = useRef(false);
  skillRef.current = skillCheck;

  const startSkillCheck = useCallback(() => {
    setSkillCheck({ target: createTarget(0), hits: 0, misses: 0,
      tutorial: !tutorialSeen.current, hunterLooking: false });
  }, []);

  const resetSkillCheck = useCallback(() => setSkillCheck(null), []);

  const beginSkillCheck = useCallback(() => {
    tutorialSeen.current = true;
    setSkillCheck((current) => current ? { ...current, tutorial: false } : current);
  }, []);

  const pressSkillCheck = useCallback(() => {
    const current = skillRef.current;
    if (!current || current.tutorial) return;
    if (current.target.phase === 'ready') {
      if (current.hits + 1 >= REQUIRED_HITS) {
        resetSkillCheck();
        onComplete();
        return;
      }
      setSkillCheck({ ...current, hits: current.hits + 1,
        hunterLooking: false, target: createTarget(current.target.id + 1) });
      return;
    }
    const misses = current.misses + 1;
    if (misses >= MAX_MISSES) {
      resetSkillCheck();
      onFail();
      return;
    }
    setSkillCheck({ ...current, misses, hunterLooking: true });
  }, [onComplete, onFail, resetSkillCheck]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (!skillRef.current || event.repeat || event.code !== 'KeyA') return;
      event.preventDefault();
      if (skillRef.current.tutorial) beginSkillCheck();
      else pressSkillCheck();
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [beginSkillCheck, pressSkillCheck]);

  useEffect(() => {
    if (!skillCheck || skillCheck.tutorial) return;
    if (skillCheck.target.phase === 'ready') {
      const timer = window.setTimeout(() => {
        resetSkillCheck();
        onFail();
      }, 850);
      return () => window.clearTimeout(timer);
    }
    const delay = skillCheck.hunterLooking ? 950 : 650 + Math.random() * 800;
    const timer = window.setTimeout(() => setSkillCheck((current) => current ? {
      ...current, hunterLooking: false,
      target: { ...current.target, phase: 'ready' },
    } : current), delay);
    return () => window.clearTimeout(timer);
  }, [onFail, resetSkillCheck, skillCheck]);

  return { beginSkillCheck, pressSkillCheck, resetSkillCheck, skillCheck,
    skillCheckRef: skillRef, startSkillCheck };
}
