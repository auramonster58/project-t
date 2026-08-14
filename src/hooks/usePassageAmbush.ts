import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { PASSAGE_MAX_Y, PASSAGE_MIN_Y, PASSAGE_WIDTH, ROOM_WIDTH } from '../lib/gameData';

type PlayerPosition = { x: number; y: number };
export type AmbushPhase = 'dormant' | 'hunting' | 'fake-death' | 'aftermath';
export type AmbusherData = { id: number; x: number; y: number; health: number; facing: 1 | -1; isHit: boolean };
export type AmbushStrike = { x: number; y: number; damage: number | null };

const ROOM_INDEX = 2;
const PASSAGE_START = (ROOM_INDEX + 1) * ROOM_WIDTH - PASSAGE_WIDTH;
const PASSAGE_CENTER = PASSAGE_START + PASSAGE_WIDTH / 2;

function createAmbushers(): AmbusherData[] {
  return [
    { id: 9001, x: PASSAGE_CENTER - 285, y: 50, health: 100, facing: 1, isHit: false },
    { id: 9002, x: PASSAGE_CENTER + 285, y: 54, health: 100, facing: -1, isHit: false },
  ];
}

export function usePassageAmbush(player: MutableRefObject<PlayerPosition>, bossMode: boolean) {
  const [phase, setPhase] = useState<AmbushPhase>('dormant');
  const [ambushers, setAmbushers] = useState<AmbusherData[]>([]);
  const [resolved, setResolved] = useState(false);
  const [respawnRequested, setRespawnRequested] = useState(false);
  const phaseRef = useRef<AmbushPhase>('dormant');
  const ambushersRef = useRef<AmbusherData[]>([]);
  const timers = useRef(new Set<number>());

  const changePhase = useCallback((next: AmbushPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  useEffect(() => { ambushersRef.current = ambushers; }, [ambushers]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const position = player.current;
      if (phaseRef.current === 'dormant' && Math.abs(position.x - PASSAGE_CENTER) < 75) {
        setAmbushers(createAmbushers());
        changePhase('hunting');
        return;
      }
      if (phaseRef.current !== 'hunting') return;
      setAmbushers((current) => current.map((monster) => monster.health === 0 ? monster : {
        ...monster,
        x: monster.x + Math.sign(position.x - monster.x) * 8,
        y: Math.min(PASSAGE_MAX_Y, Math.max(PASSAGE_MIN_Y,
          monster.y + Math.sign(position.y - monster.y) * 0.45)),
        facing: position.x >= monster.x ? 1 : -1,
      }));
      const isCaught = ambushersRef.current.some((monster) => monster.health > 0
        && Math.hypot(monster.x - position.x, (monster.y - position.y) * 9) < 105);
      if (!bossMode && isCaught) {
        changePhase('fake-death');
        const deathTimer = window.setTimeout(() => {
          timers.current.delete(deathTimer);
          setRespawnRequested(true);
        }, 1400);
        timers.current.add(deathTimer);
      }
    }, 80);
    return () => window.clearInterval(timer);
  }, [bossMode, changePhase, player]);

  const attack = useCallback((x: number, y: number, facing: 1 | -1, range: number) => {
    if (phaseRef.current !== 'hunting') return null;
    const target = ambushersRef.current.filter((monster) => monster.health > 0
      && (monster.x - x) * facing >= -30
      && Math.hypot(monster.x - x, (monster.y - y) * 9) <= range)
      .sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0];
    if (!target) return null;
    const damage = bossMode ? target.health : null;
    setAmbushers((current) => current.map((monster) => monster.id === target.id
      ? { ...monster, health: damage === null ? monster.health : 0, isHit: true } : monster));
    const hitTimer = window.setTimeout(() => {
      timers.current.delete(hitTimer);
      setAmbushers((current) => current.map((monster) => monster.id === target.id
        ? { ...monster, isHit: false } : monster));
    }, 500);
    timers.current.add(hitTimer);
    if (bossMode && ambushersRef.current.filter((monster) => monster.health > 0 && monster.id !== target.id).length === 0) {
      setResolved(true);
      changePhase('aftermath');
      const clearTimer = window.setTimeout(() => {
        timers.current.delete(clearTimer);
        setAmbushers([]);
      }, 750);
      timers.current.add(clearTimer);
    }
    return { x: target.x, y: target.y, damage } satisfies AmbushStrike;
  }, [bossMode, changePhase]);

  const restoreResolved = useCallback((wasResolved: boolean) => {
    if (!wasResolved) return;
    setResolved(true);
    changePhase('aftermath');
  }, [changePhase]);

  const finishRespawn = useCallback(() => {
    setRespawnRequested(false);
    setAmbushers([]);
    setResolved(true);
    changePhase('aftermath');
  }, [changePhase]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  return { phase, ambushers, resolved, respawnRequested, attack, restoreResolved, finishRespawn };
}
