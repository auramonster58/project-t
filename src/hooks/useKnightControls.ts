import { useCallback, useEffect, useRef, useState } from 'react';

const WALK_SPEED = 360;
const VERTICAL_SPEED = 42;

export function useKnightControls(
  onStrike: (worldX: number, y: number, facing: 1 | -1) => void,
  maxWorldX: number,
  worldWidth: number,
  instantAttack: boolean,
) {
  const [worldX, setWorldX] = useState(150);
  const [y, setY] = useState(68);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [isMoving, setIsMoving] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const keys = useRef(new Set<string>());
  const position = useRef({ worldX, y, facing });
  const attackLocked = useRef(false);
  const maxXRef = useRef(maxWorldX);

  useEffect(() => { position.current = { worldX, y, facing }; }, [facing, worldX, y]);
  useEffect(() => { maxXRef.current = maxWorldX; }, [maxWorldX]);

  const attack = useCallback(() => {
    if (!instantAttack && attackLocked.current) return;
    attackLocked.current = !instantAttack;
    setIsAttacking(true);
    const strike = () => onStrike(position.current.worldX, position.current.y, position.current.facing);
    if (instantAttack) strike(); else window.setTimeout(strike, 140);
    window.setTimeout(() => setIsAttacking(false), instantAttack ? 100 : 360);
    if (!instantAttack) window.setTimeout(() => { attackLocked.current = false; }, 460);
  }, [instantAttack, onStrike]);

  const move = useCallback((directionX: -1 | 0 | 1, directionY: -1 | 0 | 1) => {
    if (directionX) setFacing(directionX);
    setWorldX((value) => Math.min(maxXRef.current, Math.max(80, value + directionX * 35)));
    setY((value) => Math.min(80, Math.max(28, value + directionY * 4)));
  }, []);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code.startsWith('Arrow') || ['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
        event.preventDefault(); keys.current.add(event.code);
      }
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    const blur = () => keys.current.clear();
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const seconds = Math.min((now - previous) / 1000, 0.032); previous = now;
      const left = keys.current.has('KeyA') || keys.current.has('ArrowLeft');
      const right = keys.current.has('KeyD') || keys.current.has('ArrowRight');
      const up = keys.current.has('KeyW') || keys.current.has('ArrowUp');
      const down = keys.current.has('KeyS') || keys.current.has('ArrowDown');
      const dx = left === right ? 0 : right ? 1 : -1;
      const dy = up === down ? 0 : down ? 1 : -1;
      const moving = Boolean(dx || dy);
      setIsMoving((current) => current === moving ? current : moving);
      if (dx) {
        setFacing(dx);
        setWorldX((value) => Math.min(maxXRef.current, Math.max(80, value + dx * WALK_SPEED * seconds)));
      }
      if (dy) setY((value) => Math.min(80, Math.max(28, value + dy * VERTICAL_SPEED * seconds)));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const anchor = typeof window === 'undefined' ? 300 : Math.min(window.innerWidth * 0.3, 340);
  const viewportWidth = typeof window === 'undefined' ? 1200 : window.innerWidth;
  const cameraX = Math.min(Math.max(0, worldX - anchor), Math.max(0, worldWidth - viewportWidth));
  return { worldX, cameraX, screenX: worldX - cameraX, y, facing, isMoving, isAttacking, attack, move };
}
