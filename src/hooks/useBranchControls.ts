import { useCallback, useEffect, useRef, useState } from 'react';
import type { BranchRoute } from '../lib/gameSave';
import type { MovementDirection } from '../lib/spriteData';

const BRANCH_LENGTH = 500;
const EDGE = 20;

export function useBranchControls(route: BranchRoute, initialDistance?: number,
  canControl = true, horizontalOnly = false) {
  const start = initialDistance ?? (route === 'up' ? BRANCH_LENGTH - EDGE : EDGE);
  const [distance, setDistance] = useState(start);
  const [lane, setLane] = useState(50);
  const [direction, setDirection] = useState<MovementDirection>(route === 'up' ? 'up' : 'down');
  const [isMoving, setIsMoving] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackSequence, setAttackSequence] = useState(0);
  const keys = useRef(new Set<string>());

  const move = useCallback((x: -1 | 0 | 1, y: -1 | 0 | 1) => {
    if (!canControl) return;
    const allowedY = horizontalOnly ? 0 : y;
    setIsMoving(Boolean(x || allowedY));
    if (x) setLane((value) => Math.min(80, Math.max(20, value + x * 3)));
    if (allowedY) {
      setDistance((value) => Math.min(BRANCH_LENGTH - EDGE, Math.max(EDGE, value + allowedY * 4)));
      setDirection(allowedY < 0 ? 'up' : 'down');
    } else if (x) setDirection(x < 0 ? 'left' : 'right');
  }, [canControl, horizontalOnly]);

  const attack = useCallback(() => {
    if (!canControl) return;
    setAttackSequence((value) => value + 1);
    setIsAttacking(true);
    window.setTimeout(() => setIsAttacking(false), 360);
  }, [canControl]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code.startsWith('Arrow') || ['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
        event.preventDefault();
        keys.current.add(event.code);
      }
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    const blur = () => keys.current.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!canControl) { keys.current.clear(); setIsMoving(false); return; }
      const left = keys.current.has('KeyA') || keys.current.has('ArrowLeft');
      const right = keys.current.has('KeyD') || keys.current.has('ArrowRight');
      const up = keys.current.has('KeyW') || keys.current.has('ArrowUp');
      const down = keys.current.has('KeyS') || keys.current.has('ArrowDown');
      const x = left === right ? 0 : right ? 1 : -1;
      const y = horizontalOnly || up === down ? 0 : down ? 1 : -1;
      setIsMoving(Boolean(x || y));
      if (x || y) move(x, y);
    }, 70);
    return () => window.clearInterval(timer);
  }, [canControl, horizontalOnly, move]);

  const completed = route === 'up' ? distance <= EDGE : distance >= BRANCH_LENGTH - EDGE;
  const room = Math.min(5, Math.floor((route === 'up' ? BRANCH_LENGTH - distance : distance) / 100) + 1);
  return { attack, attackSequence, completed, direction, distance, isAttacking, isMoving, lane, move, room };
}
