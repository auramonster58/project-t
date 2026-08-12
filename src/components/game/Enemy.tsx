export type EnemyData = { id: number; x: number; y: number; health: number };

type EnemyProps = { enemy: EnemyData; isAttacking: boolean };

export function Enemy({ enemy, isAttacking }: EnemyProps) {
  return (
    <div
      className={`gate-guard ${isAttacking ? 'gate-guard--attacking' : ''} ${enemy.health === 0 ? 'gate-guard--defeated' : ''}`}
      style={{ left: enemy.x, top: `${enemy.y}%`, zIndex: Math.round(enemy.y) + 10 }}
    >
      <span className="guard-head" />
      <span className="guard-body" />
      <span className="guard-spear" />
    </div>
  );
}
