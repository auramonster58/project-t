import type { EnemyData } from '../components/game/Enemy';

export const ROOM_COUNT = 10;
export const FINAL_ROOM = ROOM_COUNT - 1;
export const ROOM_WIDTH = 2200;
export const WORLD_WIDTH = ROOM_COUNT * ROOM_WIDTH;
export const PORTAL_POSITION = { x: FINAL_ROOM * ROOM_WIDTH + 1350, y: 56 };
export const PLAY_MIN_Y = 28;
export const PLAY_MAX_Y = 72;
export const PASSAGE_WIDTH = 650;
export const PASSAGE_MIN_Y = 45;
export const PASSAGE_MAX_Y = 57;
export const UPPER_ROOM_INDEX = 2;
export const UPPER_ROOM_MIN_Y = 10;
export const UPPER_ROOM_LEFT = 520;
export const UPPER_ROOM_RIGHT = 1180;
export const UPPER_ROOM_DOOR_LEFT = 760;
export const UPPER_ROOM_DOOR_RIGHT = 940;
export const THIRD_PASSAGE_CENTER = 3 * ROOM_WIDTH - PASSAGE_WIDTH / 2;

const ENEMY_COUNTS = [4, 5, 6, 4, 5, 6, 5, 6, 7];
const Y_POSITIONS = [46, 55, 50, 53, 47, 56];
const ARCHER_X_POSITIONS = [1260, 1390, 1510];

export type TrapData = { id: number; room: number; x: number; y: number };

export function createDecoyGuards(): EnemyData[] {
  return [
    { id: 9101, x: THIRD_PASSAGE_CENTER - 48, y: 46, patrolDirection: 1 as const },
    { id: 9102, x: THIRD_PASSAGE_CENTER - 16, y: 50, patrolDirection: 1 as const },
    { id: 9103, x: THIRD_PASSAGE_CENTER + 16, y: 54, patrolDirection: -1 as const },
    { id: 9104, x: THIRD_PASSAGE_CENTER + 48, y: 57, patrolDirection: -1 as const },
  ].map((guard) => ({ ...guard, room: 2, health: 100, kind: 'guard' as const }));
}

export function isInTorchLight(enemy: EnemyData) {
  if (enemy.room > 1) return false;
  const localX = enemy.x - enemy.room * ROOM_WIDTH;
  const nearestTorchX = Math.min(Math.abs(localX - 125), Math.abs(localX - (ROOM_WIDTH - 125)));
  return Math.hypot(nearestTorchX, (80 - enemy.y) * 7) < 460;
}

export function createEnemies(): EnemyData[] {
  return ENEMY_COUNTS.flatMap((count, room) => Array.from({ length: count }, (_, index) => index)
    .filter((index) => room !== 2 || index === 0 || index % 2 === 0)
    .map((index) => {
      const isArcher = index > 0 && index % 2 === 1;
      const archerIndex = Math.floor(index / 2);
      return {
        id: room * 10 + index,
        room,
        x: room * ROOM_WIDTH + (isArcher
          ? ARCHER_X_POSITIONS[archerIndex % ARCHER_X_POSITIONS.length]
          : 260 + index * (1080 / Math.max(1, count - 1))),
        y: Y_POSITIONS[(index + room * 2) % Y_POSITIONS.length],
        health: 100,
        kind: isArcher ? 'archer' as const : 'guard' as const,
        patrolDirection: (index + room) % 2 === 0 ? 1 as const : -1 as const,
      };
    }));
}

export function createTraps(): TrapData[] {
  return Array.from({ length: ROOM_COUNT - 1 }, (_, room) => [
    { id: room * 2, room, x: room * ROOM_WIDTH + 550, y: 55 },
    { id: room * 2 + 1, room, x: room * ROOM_WIDTH + 1080, y: 47 },
  ]).flat();
}
