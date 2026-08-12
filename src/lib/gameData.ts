import type { EnemyData } from '../components/game/Enemy';

export const ROOM_COUNT = 10;
export const FINAL_ROOM = ROOM_COUNT - 1;
export const ROOM_WIDTH = 1150;
export const WORLD_WIDTH = ROOM_COUNT * ROOM_WIDTH;
export const PORTAL_POSITION = { x: FINAL_ROOM * ROOM_WIDTH + 760, y: 55 };

const ENEMY_COUNTS = [4, 5, 6, 4, 5, 6, 5, 6, 7];
const Y_POSITIONS = [38, 68, 49, 73, 33, 59];
const ARCHER_X_POSITIONS = [ROOM_WIDTH * 0.5, ROOM_WIDTH - 220, ROOM_WIDTH * 0.6];

export type TrapData = { id: number; room: number; x: number; y: number };

export function createEnemies(): EnemyData[] {
  return ENEMY_COUNTS.flatMap((count, room) => Array.from({ length: count }, (_, index) => {
    const isArcher = index > 0 && index % 2 === 1;
    const archerIndex = Math.floor(index / 2);
    return {
      id: room * 10 + index,
      room,
      x: room * ROOM_WIDTH + (isArcher
        ? ARCHER_X_POSITIONS[archerIndex % ARCHER_X_POSITIONS.length]
        : 210 + index * (720 / Math.max(1, count - 1))),
      y: Y_POSITIONS[(index + room * 2) % Y_POSITIONS.length],
      health: 100,
      kind: isArcher ? 'archer' as const : 'guard' as const,
      patrolDirection: (index + room) % 2 === 0 ? 1 as const : -1 as const,
    };
  }));
}

export function createTraps(): TrapData[] {
  return Array.from({ length: ROOM_COUNT - 1 }, (_, room) => [
    { id: room * 2, room, x: room * ROOM_WIDTH + 430, y: 62 },
    { id: room * 2 + 1, room, x: room * ROOM_WIDTH + 760, y: 43 },
  ]).flat();
}
