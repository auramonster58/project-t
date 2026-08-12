import type { EnemyData } from '../components/game/Enemy';

export const ROOM_COUNT = 8;
export const FINAL_ROOM = ROOM_COUNT - 1;
export const ROOM_WIDTH = 1150;
export const WORLD_WIDTH = ROOM_COUNT * ROOM_WIDTH;
export const PORTAL_POSITION = { x: FINAL_ROOM * ROOM_WIDTH + 760, y: 55 };

const ENEMY_COUNTS = [4, 5, 6, 4, 5, 6, 5];
const Y_POSITIONS = [38, 68, 49, 73, 33, 59];

export function createEnemies(): EnemyData[] {
  return ENEMY_COUNTS.flatMap((count, room) => Array.from({ length: count }, (_, index) => ({
    id: room * 10 + index,
    room,
    x: room * ROOM_WIDTH + 210 + index * (720 / Math.max(1, count - 1)),
    y: Y_POSITIONS[(index + room * 2) % Y_POSITIONS.length],
    health: 100,
  })));
}
