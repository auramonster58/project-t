import type { EnemyData } from '../components/game/Enemy';

export type Weapon = 'sword' | 'crossbow';

type TargetOptions = {
  weapon: Weapon;
  worldX: number;
  y: number;
  facing: 1 | -1;
  unlockedRoom: number;
  autoAim: boolean;
};

export const SWORD_DAMAGE = 25;
export const CROSSBOW_DAMAGE = 34;

export function combatDistance(x: number, y: number, enemy: EnemyData) {
  return Math.hypot(enemy.x - x, (enemy.y - y) * 9);
}

export function selectTarget(enemies: EnemyData[], options: TargetOptions) {
  const alive = enemies.filter((enemy) => enemy.health > 0);
  if (options.weapon === 'sword') {
    const target = alive.sort((a, b) => combatDistance(options.worldX, options.y, a)
      - combatDistance(options.worldX, options.y, b))[0];
    return target && combatDistance(options.worldX, options.y, target) <= 185 ? target : null;
  }

  const reachable = alive.filter((enemy) => enemy.room <= options.unlockedRoom);
  const candidates = options.autoAim ? reachable : reachable.filter((enemy) => {
    const isAhead = (enemy.x - options.worldX) * options.facing >= 0;
    return isAhead && Math.abs(enemy.y - options.y) <= 5;
  });
  const target = candidates.sort((a, b) => combatDistance(options.worldX, options.y, a)
    - combatDistance(options.worldX, options.y, b))[0];
  return target && combatDistance(options.worldX, options.y, target) <= 900 ? target : null;
}
