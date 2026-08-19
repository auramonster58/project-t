import { useEffect, useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type { ArrowData } from '../components/game/ArrowShot';
import type { EnemyData } from '../components/game/Enemy';
import { combatDistance } from '../lib/gameCombat';
import { PLAY_MAX_Y, PLAY_MIN_Y, ROOM_WIDTH } from '../lib/gameData';

type PlayerPosition = { x: number; y: number };
type SetEnemies = Dispatch<SetStateAction<EnemyData[]>>;

const ARCHER_RANGE = ROOM_WIDTH / 2;
const SHOT_COOLDOWN_MS = 2_000;
const ARROW_FLIGHT_MS = 520;
const ENEMY_ARROW_DAMAGE = 17;

export function useEnemyArchers(
  enemies: EnemyData[],
  setEnemies: SetEnemies,
  playerPosition: MutableRefObject<PlayerPosition>,
  unlockedRoom: number,
  onPlayerHit: (damage: number) => void,
) {
  const [enemyArrows, setEnemyArrows] = useState<ArrowData[]>([]);
  const [shootingArchers, setShootingArchers] = useState<Set<number>>(() => new Set());
  const enemiesRef = useRef(enemies);
  const lastShots = useRef(new Map<number, number>());
  const nextArrowId = useRef(10_000);
  const effectTimers = useRef(new Set<number>());

  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEnemies((current) => current.map((enemy) => {
        if (enemy.kind !== 'archer' || enemy.health === 0) return enemy;
        const nextY = enemy.y + enemy.patrolDirection * 0.7;
        if (nextY < PLAY_MIN_Y || nextY > PLAY_MAX_Y) {
          return { ...enemy, patrolDirection: -enemy.patrolDirection as 1 | -1 };
        }
        return { ...enemy, y: nextY };
      }));
    }, 100);
    return () => window.clearInterval(timer);
  }, [setEnemies]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const player = playerPosition.current;
      const now = Date.now();
      enemiesRef.current.forEach((enemy) => {
        const lastShot = lastShots.current.get(enemy.id) ?? 0;
        const canSeePlayer = enemy.kind === 'archer' && enemy.health > 0
          && enemy.room === Math.floor(player.x / ROOM_WIDTH) && enemy.room <= unlockedRoom
          && combatDistance(player.x, player.y, enemy) <= ARCHER_RANGE
          && Math.abs(enemy.y - player.y) <= 9;
        if (!canSeePlayer || now - lastShot < SHOT_COOLDOWN_MS) return;
        lastShots.current.set(enemy.id, now);
        setShootingArchers((current) => new Set(current).add(enemy.id));
        const shootingTimer = window.setTimeout(() => {
          effectTimers.current.delete(shootingTimer);
          setShootingArchers((current) => {
          const next = new Set(current);
          next.delete(enemy.id);
          return next;
          });
        }, 560);
        effectTimers.current.add(shootingTimer);
        const id = nextArrowId.current += 1;
        const target = { x: player.x, y: player.y };
        setEnemyArrows((current) => [...current, {
          id, x: enemy.x, y: enemy.y, targetX: target.x, targetY: target.y,
          flightMs: ARROW_FLIGHT_MS, hostile: true,
        }]);
        const arrowTimer = window.setTimeout(() => {
          effectTimers.current.delete(arrowTimer);
          setEnemyArrows((current) => current.filter((arrow) => arrow.id !== id));
          const currentPlayer = playerPosition.current;
          if (Math.hypot(currentPlayer.x - target.x, (currentPlayer.y - target.y) * 9) < 75) onPlayerHit(ENEMY_ARROW_DAMAGE);
        }, ARROW_FLIGHT_MS);
        effectTimers.current.add(arrowTimer);
      });
    }, 200);
    return () => window.clearInterval(timer);
  }, [onPlayerHit, playerPosition, unlockedRoom]);

  useEffect(() => () => effectTimers.current.forEach((timer) => window.clearTimeout(timer)), []);

  return { enemyArrows, shootingArchers };
}
