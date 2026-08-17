import { useEffect, useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type { EnemyData, GuardAttackPhase } from '../components/game/Enemy';
import { combatDistance } from '../lib/gameCombat';
import { PASSAGE_MAX_Y, PASSAGE_MIN_Y, PASSAGE_WIDTH, PLAY_MAX_Y, PLAY_MIN_Y, ROOM_WIDTH,
  THIRD_PASSAGE_CENTER } from '../lib/gameData';

type PlayerPosition = { x: number; y: number };
const CHASE_RANGE = 620;
const ATTACK_RANGE = 135;
const GUARD_DAMAGE = 12;

function keepGuardOutOfPassageWalls(enemy: EnemyData, nextX: number, nextY: number) {
  const passageStart = (enemy.room + 1) * ROOM_WIDTH - PASSAGE_WIDTH;
  const isOnCarpet = nextY >= PASSAGE_MIN_Y && nextY <= PASSAGE_MAX_Y;
  if (enemy.x <= passageStart && nextX > passageStart && !isOnCarpet) {
    return { x: passageStart, y: nextY };
  }
  if (nextX > passageStart) {
    return { x: nextX, y: Math.min(PASSAGE_MAX_Y, Math.max(PASSAGE_MIN_Y, nextY)) };
  }
  return { x: nextX, y: nextY };
}

export function useEnemyGuards(
  enemies: EnemyData[],
  setEnemies: Dispatch<SetStateAction<EnemyData[]>>,
  playerPosition: MutableRefObject<PlayerPosition>,
  unlockedRoom: number,
  avoidDecoys: boolean,
  onPlayerHit: (damage: number) => void,
) {
  const [attackPhases, setAttackPhases] = useState<Record<number, GuardAttackPhase>>({});
  const lockedAttacks = useRef(new Set<number>());
  const enemiesRef = useRef(enemies);
  const attackTimers = useRef(new Set<number>());

  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const player = playerPosition.current;
      setEnemies((current) => current.map((enemy) => {
        const distance = combatDistance(player.x, player.y, enemy);
        const chaseRange = enemy.kind === 'monster' ? 195 : CHASE_RANGE;
        if (enemy.kind === 'archer' || enemy.health === 0 || enemy.room > unlockedRoom
          || Math.floor(player.x / ROOM_WIDTH) !== enemy.room
          || distance > chaseRange || distance < ATTACK_RANGE - 10) return enemy;
        const xStep = Math.sign(player.x - enemy.x) * 5;
        const yStep = Math.sign(player.y - enemy.y) * 0.55;
        const roomStart = enemy.room * ROOM_WIDTH + 90;
        const roomEnd = (enemy.room + 1) * ROOM_WIDTH - 90;
        const avoidsDecoyMonsters = avoidDecoys && enemy.room === 2 && enemy.kind === 'guard';
        const chaseX = avoidsDecoyMonsters
          ? Math.min(THIRD_PASSAGE_CENTER - 470, enemy.x + xStep)
          : enemy.x + xStep;
        const nextPosition = keepGuardOutOfPassageWalls(
          enemy,
          Math.min(roomEnd, Math.max(roomStart, chaseX)),
          Math.min(PLAY_MAX_Y, Math.max(PLAY_MIN_Y, enemy.y + yStep)),
        );
        return {
          ...enemy,
          x: nextPosition.x,
          y: nextPosition.y,
        };
      }));
    }, 80);
    return () => window.clearInterval(timer);
  }, [avoidDecoys, playerPosition, setEnemies, unlockedRoom]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const player = playerPosition.current;
      enemiesRef.current.forEach((enemy) => {
        const isRepelled = avoidDecoys && enemy.room === 2 && enemy.kind === 'guard'
          && enemy.x >= THIRD_PASSAGE_CENTER - 500;
        if (enemy.kind === 'archer' || enemy.health === 0 || enemy.room > unlockedRoom || isRepelled
          || Math.floor(player.x / ROOM_WIDTH) !== enemy.room
          || combatDistance(player.x, player.y, enemy) > ATTACK_RANGE || lockedAttacks.current.has(enemy.id)) return;
        lockedAttacks.current.add(enemy.id);
        setAttackPhases((phases) => ({ ...phases, [enemy.id]: 'windup' }));
        const strikeTimer = window.setTimeout(() => {
          attackTimers.current.delete(strikeTimer);
          const currentEnemy = enemiesRef.current.find((candidate) => candidate.id === enemy.id);
          const didHit = Boolean(currentEnemy
            && Math.floor(playerPosition.current.x / ROOM_WIDTH) === currentEnemy.room
            && combatDistance(playerPosition.current.x, playerPosition.current.y, currentEnemy) <= ATTACK_RANGE + 25);
          setAttackPhases((phases) => ({ ...phases, [enemy.id]: didHit ? 'hit' : 'strike' }));
          if (didHit) onPlayerHit(GUARD_DAMAGE);
        }, 480);
        const resetTimer = window.setTimeout(() => {
          attackTimers.current.delete(resetTimer);
          setAttackPhases((phases) => ({ ...phases, [enemy.id]: 'idle' }));
          lockedAttacks.current.delete(enemy.id);
        }, 900);
        attackTimers.current.add(strikeTimer);
        attackTimers.current.add(resetTimer);
      });
    }, 160);
    return () => window.clearInterval(timer);
  }, [avoidDecoys, onPlayerHit, playerPosition, setEnemies, unlockedRoom]);

  useEffect(() => () => {
    attackTimers.current.forEach((timer) => window.clearTimeout(timer));
    attackTimers.current.clear();
  }, []);

  return attackPhases;
}
