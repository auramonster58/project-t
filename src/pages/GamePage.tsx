import { useCallback, useEffect, useRef, useState } from 'react';
import { CastleScene } from '../components/game/CastleScene';
import { GameHud } from '../components/game/GameHud';
import { Knight } from '../components/game/Knight';
import { TouchControls } from '../components/game/TouchControls';
import { Enemy, type EnemyData } from '../components/game/Enemy';
import { useKnightControls } from '../hooks/useKnightControls';
import '../styles/game-scene.css';
import '../styles/game-ui.css';

export function GamePage() {
  const [enemies, setEnemies] = useState<EnemyData[]>([
    { id: 1, x: 850, y: 40, health: 100 },
    { id: 2, x: 1520, y: 69, health: 100 },
    { id: 3, x: 2250, y: 48, health: 100 },
  ]);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [showDamage, setShowDamage] = useState(false);

  const strikeEnemy = useCallback((worldX: number, y: number) => {
    setEnemies((current) => {
      const target = current.filter((enemy) => enemy.health > 0)
        .sort((a, b) => Math.abs(a.x - worldX) - Math.abs(b.x - worldX))[0];
      if (!target || Math.abs(target.x - worldX) > 180 || Math.abs(target.y - y) > 17) return current;
      setShowDamage(true);
      window.setTimeout(() => setShowDamage(false), 420);
      return current.map((enemy) => enemy.id === target.id
        ? { ...enemy, health: Math.max(0, enemy.health - 25) }
        : enemy);
    });
  }, []);

  const controls = useKnightControls(strikeEnemy);
  const positionRef = useRef({ x: controls.worldX, y: controls.y });
  const enemiesRef = useRef(enemies);
  useEffect(() => { positionRef.current = { x: controls.worldX, y: controls.y }; }, [controls.worldX, controls.y]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const player = positionRef.current;
      const isHit = enemiesRef.current.some((enemy) => enemy.health > 0
        && Math.abs(enemy.x - player.x) < 135 && Math.abs(enemy.y - player.y) < 15);
      if (isHit) setPlayerHealth((health) => Math.max(0, health - 10));
    }, 900);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0 || (event.target as HTMLElement).closest('button, a')) return;
      controls.attack();
    };
    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [controls.attack]);

  return (
    <main className="game-page">
      <div className="scrolling-world" style={{ transform: `translate3d(${-controls.cameraX}px, 0, 0)` }}>
        <CastleScene />
        {enemies.map((enemy) => <Enemy key={enemy.id} enemy={enemy} isAttacking={enemy.health > 0
          && Math.abs(enemy.x - controls.worldX) < 135 && Math.abs(enemy.y - controls.y) < 15} />)}
      </div>
      <GameHud playerHealth={playerHealth} enemyHealth={Math.max(0, ...enemies.map((enemy) => enemy.health))} showDamage={showDamage} />
      <Knight screenX={controls.screenX} y={controls.y} facing={controls.facing} isMoving={controls.isMoving} isAttacking={controls.isAttacking} />
      <div className="game-tip"><b>M1</b> удар · <b>WASD</b> движение · исследуй коридор →</div>
      {enemies.every((enemy) => enemy.health === 0) && <div className="victory">Коридор очищен!</div>}
      {playerHealth === 0 && <div className="defeat">Рыцарь повержен</div>}
      <TouchControls onMove={controls.move} onAttack={controls.attack} />
    </main>
  );
}
