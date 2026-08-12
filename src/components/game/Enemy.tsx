export type EnemyData = { id: number; room: number; x: number; y: number; health: number };

type EnemyProps = { enemy: EnemyData; isAttacking: boolean; isTargeted: boolean; isRevealed: boolean };

export function Enemy({ enemy, isAttacking, isTargeted, isRevealed }: EnemyProps) {
  return (
    <div
      className={`gate-guard ${isAttacking ? 'gate-guard--attacking' : ''} ${isRevealed ? 'gate-guard--revealed' : ''} ${enemy.health === 0 ? 'gate-guard--defeated' : ''}`}
      style={{ left: enemy.x, top: `${enemy.y}%`, zIndex: Math.round(enemy.y) + 10 }}
    >
      {(isTargeted || isRevealed) && enemy.health > 0 && <span className="local-enemy-health"><i style={{ width: `${enemy.health}%` }} /></span>}
      <span className="guard-head" />
      <span className="guard-body" />
      <span className="guard-spear" />
    </div>
  );
}
