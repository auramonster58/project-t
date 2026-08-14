import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { ROOM_WIDTH } from '../lib/gameData';

type PlayerPosition = { x: number; y: number };
export type ChaseMonsterData = { x: number; y: number; facing: 1 | -1 };
export type FifthHallQuestState = 'waiting' | 'note-read' | 'chase' | 'scare' | 'complete' | 'chest-scare' | 'finished';

export const FIFTH_HALL_CHEST = { x: 4 * ROOM_WIDTH + 690, y: 48 };
export const FIFTH_HALL_NOTE = { x: 4 * ROOM_WIDTH + 1030, y: 55 };
export const FIRST_HALL_EXCALIBUR_KEY = { x: 690, y: 52 };

export function useFifthHallQuest(player: MutableRefObject<PlayerPosition>, teleport: (x: number, y: number) => void) {
  const [state, setState] = useState<FifthHallQuestState>('waiting');
  const [noteOpen, setNoteOpen] = useState(false);
  const [monster, setMonster] = useState<ChaseMonsterData | null>(null);
  const returnPosition = useRef(FIFTH_HALL_NOTE);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const restore = useCallback((noteRead: boolean, keyCollected: boolean, chestOpened = false) => {
    if (chestOpened) setState('finished');
    else if (keyCollected) setState('complete');
    else if (noteRead) setState('note-read');
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyT' || event.repeat || stateRef.current === 'chase'
        || stateRef.current === 'scare' || stateRef.current === 'chest-scare') return;
      const position = player.current;
      if (stateRef.current === 'complete'
        && Math.hypot(position.x - FIFTH_HALL_CHEST.x, (position.y - FIFTH_HALL_CHEST.y) * 9) <= 145) {
        setNoteOpen(false);
        setState('chest-scare');
        return;
      }
      if (Math.hypot(position.x - FIFTH_HALL_NOTE.x, (position.y - FIFTH_HALL_NOTE.y) * 9) > 135) return;
      setNoteOpen((current) => !current);
      if (stateRef.current === 'waiting') setState('note-read');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [player]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const position = player.current;
      if (stateRef.current === 'note-read' && position.x >= 3 * ROOM_WIDTH + 1550
        && position.x <= 4 * ROOM_WIDTH - 70) {
        returnPosition.current = { x: position.x, y: position.y };
        setNoteOpen(false);
        setMonster({ x: 4 * ROOM_WIDTH - 35, y: position.y, facing: -1 });
        setState('chase');
        return;
      }
      if (stateRef.current !== 'chase') return;
      setMonster((current) => current ? {
        x: current.x + Math.sign(position.x - current.x) * 18,
        y: current.y + Math.sign(position.y - current.y) * 0.38,
        facing: position.x >= current.x ? 1 : -1,
      } : null);
      if (Math.hypot(position.x - FIRST_HALL_EXCALIBUR_KEY.x,
        (position.y - FIRST_HALL_EXCALIBUR_KEY.y) * 9) < 90) {
        setState('scare');
      }
    }, 60);
    return () => window.clearInterval(timer);
  }, [player]);

  const finishScare = useCallback(() => {
    teleport(returnPosition.current.x, returnPosition.current.y);
    setMonster(null);
    setState('complete');
  }, [teleport]);

  const finishChestScare = useCallback(() => setState('finished'), []);

  return { state, noteOpen, monster, restore, finishScare, finishChestScare };
}
