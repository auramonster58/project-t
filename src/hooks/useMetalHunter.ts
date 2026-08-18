import { useCallback, useEffect, useRef, useState } from 'react';
import { playMetalHunterSound } from '../lib/metalHunterSound';
import { useHunterSkillCheck } from './useHunterSkillCheck';

type Position = { x: number; y: number };
type HunterPhase = 'inactive' | 'warning' | 'chase' | 'cooldown';
export function useMetalHunter(player: React.RefObject<Position>, enabled: boolean,
  isHidden: boolean, onCaught: () => void) {
  const [phase, setPhase] = useState<HunterPhase>('inactive');
  const [position, setPosition] = useState({ x: 0, y: 52 });
  const [facing, setFacing] = useState<1 | -1>(1);
  const positionRef = useRef(position);
  const target = useRef({ x: 0, y: 52, updatedAt: 0 });
  const safeUntil = useRef(0);
  const caughtRef = useRef(onCaught);
  caughtRef.current = onCaught;
  positionRef.current = position;
  const failCheck = useCallback(() => {
    safeUntil.current = Date.now() + 2500;
    caughtRef.current();
    setPhase('cooldown');
  }, []);

  const completeCheck = useCallback(() => {
    safeUntil.current = Date.now() + 6500;
    setPhase('cooldown');
  }, []);

  const skill = useHunterSkillCheck(failCheck, completeCheck);

  useEffect(() => {
    if (!enabled) {
      setPhase('inactive');
      skill.resetSkillCheck();
      return;
    }
    if (phase !== 'inactive' && phase !== 'cooldown') return;
    const current = player.current;
    if (!current) return;
    const appear = () => {
      const side = Math.random() > .5 ? 1 : -1;
      setPosition({ x: Math.max(80, current.x + side * 720), y: current.y });
      setFacing(side > 0 ? -1 : 1);
      setPhase('warning');
    };
    if (phase === 'inactive') appear();
    else {
      const timer = window.setTimeout(appear, 4200);
      return () => window.clearTimeout(timer);
    }
  }, [enabled, phase, player, skill.resetSkillCheck]);

  useEffect(() => {
    if (phase !== 'warning') return;
    const stopSound = playMetalHunterSound(false);
    const timer = window.setTimeout(() => setPhase('chase'), 3000);
    return () => { window.clearTimeout(timer); stopSound(); };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'chase' || skill.skillCheck) return;
    const stopSound = playMetalHunterSound(true);
    const leaveTimer = window.setTimeout(() => setPhase('cooldown'), 11000);
    return () => { window.clearTimeout(leaveTimer); stopSound(); };
  }, [phase, skill.skillCheck]);

  useEffect(() => {
    if (phase !== 'chase') return;
    const timer = window.setInterval(() => {
      const now = Date.now();
      const currentPlayer = player.current;
      if (!currentPlayer) return;
      const hunter = positionRef.current;
      if (now >= target.current.updatedAt) {
        target.current = { x: currentPlayer.x + (Math.random() - .5) * 520,
          y: currentPlayer.y + (Math.random() - .5) * 14, updatedAt: now + 1100 };
      }
      const dx = target.current.x - hunter.x;
      const dy = target.current.y - hunter.y;
      setFacing(dx >= 0 ? 1 : -1);
      setPosition({ x: hunter.x + Math.sign(dx) * Math.min(Math.abs(dx), 34),
        y: hunter.y + Math.sign(dy) * Math.min(Math.abs(dy), 1.8) });
      const distance = Math.hypot(currentPlayer.x - hunter.x, (currentPlayer.y - hunter.y) * 9);
      if (now < safeUntil.current || skill.skillCheckRef.current || distance > 175) return;
      if (isHidden) {
        skill.startSkillCheck();
      } else {
        safeUntil.current = now + 3500;
        caughtRef.current();
        setPhase('cooldown');
      }
    }, 70);
    return () => window.clearInterval(timer);
  }, [isHidden, phase, player, skill.skillCheckRef, skill.startSkillCheck]);

  return { beginSkillCheck: skill.beginSkillCheck, facing, phase, position,
    pressSkillCheck: skill.pressSkillCheck, skillCheck: skill.skillCheck };
}
