import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AbilityBar } from '../components/game/AbilityBar';
import { CastleScene } from '../components/game/CastleScene';
import { ExitPortal, KeyDrop } from '../components/game/CastleProgress';
import { Enemy, type EnemyData } from '../components/game/Enemy';
import { GameHud } from '../components/game/GameHud';
import { Knight } from '../components/game/Knight';
import { TouchControls } from '../components/game/TouchControls';
import { useKnightAbilities } from '../hooks/useKnightAbilities';
import { useKnightControls } from '../hooks/useKnightControls';
import { createEnemies, FINAL_ROOM, PORTAL_POSITION, ROOM_WIDTH, WORLD_WIDTH } from '../lib/gameData';
import '../styles/game-scene.css';
import '../styles/game-ui.css';

type DroppedKey = { room: number; x: number; y: number };

function distanceTo(x: number, y: number, enemy: EnemyData) {
  return Math.hypot(enemy.x - x, (enemy.y - y) * 9);
}

export function GamePage() {
  const [enemies, setEnemies] = useState(createEnemies);
  const [keys, setKeys] = useState<DroppedKey[]>([]);
  const [unlockedRoom, setUnlockedRoom] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [shownDamage, setShownDamage] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const heal = useCallback(() => setPlayerHealth((health) => Math.min(100, health + 25)), []);
  const abilities = useKnightAbilities(heal, playerHealth > 0 && playerHealth < 100);

  const strikeEnemy = useCallback((worldX: number, y: number) => {
    setEnemies((current) => {
      const target = current.filter((enemy) => enemy.health > 0)
        .sort((a, b) => distanceTo(worldX, y, a) - distanceTo(worldX, y, b))[0];
      if (!target || distanceTo(worldX, y, target) > 185) return current;
      const damage = abilities.damageBoosted ? 50 : 25;
      const isLastInRoom = target.health <= damage && current
        .filter((enemy) => enemy.room === target.room && enemy.health > 0).length === 1;
      if (isLastInRoom) {
        setKeys((drops) => drops.some((key) => key.room === target.room)
          ? drops : [...drops, { room: target.room, x: target.x, y: target.y }]);
      }
      setShownDamage(damage);
      window.setTimeout(() => setShownDamage(null), 420);
      if (abilities.damageBoosted) abilities.consumeDamageBoost();
      return current.map((enemy) => enemy.id === target.id
        ? { ...enemy, health: Math.max(0, enemy.health - damage) } : enemy);
    });
  }, [abilities.damageBoosted, abilities.consumeDamageBoost]);

  const maxWorldX = unlockedRoom === FINAL_ROOM ? WORLD_WIDTH - 100 : (unlockedRoom + 1) * ROOM_WIDTH - 90;
  const controls = useKnightControls(strikeEnemy, maxWorldX, WORLD_WIDTH);
  const positionRef = useRef({ x: controls.worldX, y: controls.y });
  const enemiesRef = useRef(enemies);
  useEffect(() => { positionRef.current = { x: controls.worldX, y: controls.y }; }, [controls.worldX, controls.y]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);

  const nearestEnemy = useMemo(() => enemies.filter((enemy) => enemy.health > 0)
    .sort((a, b) => distanceTo(controls.worldX, controls.y, a) - distanceTo(controls.worldX, controls.y, b))[0],
  [controls.worldX, controls.y, enemies]);
  const nearestIsVisible = nearestEnemy && distanceTo(controls.worldX, controls.y, nearestEnemy) < 430;

  useEffect(() => {
    const timer = window.setInterval(() => {
      const player = positionRef.current;
      const isHit = enemiesRef.current.some((enemy) => enemy.health > 0 && distanceTo(player.x, player.y, enemy) < 130);
      if (isHit) setPlayerHealth((health) => Math.max(0, health - 10));
    }, 900);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const key = keys.find((drop) => drop.room === unlockedRoom);
    if (!key || Math.hypot(key.x - controls.worldX, (key.y - controls.y) * 9) > 95) return;
    setKeys((drops) => drops.filter((drop) => drop.room !== key.room));
    setUnlockedRoom((room) => Math.min(FINAL_ROOM, room + 1));
  }, [controls.worldX, controls.y, keys, unlockedRoom]);

  useEffect(() => {
    if (unlockedRoom < FINAL_ROOM) return;
    if (Math.hypot(PORTAL_POSITION.x - controls.worldX, (PORTAL_POSITION.y - controls.y) * 9) < 100) setCompleted(true);
  }, [controls.worldX, controls.y, unlockedRoom]);

  useEffect(() => {
    const down = (event: MouseEvent) => {
      if (event.button === 0 && !(event.target as HTMLElement).closest('button, a')) controls.attack();
    };
    window.addEventListener('mousedown', down);
    return () => window.removeEventListener('mousedown', down);
  }, [controls.attack]);

  const currentRoom = Math.min(FINAL_ROOM + 1, Math.floor(controls.worldX / ROOM_WIDTH) + 1);
  return (
    <main className={`game-page ${abilities.owlSightActive ? 'game-page--owl-sight' : ''}`} style={{ '--light-x': `${controls.screenX}px`, '--light-y': `${controls.y}%` } as React.CSSProperties}>
      <div className="scrolling-world" style={{ transform: `translate3d(${-controls.cameraX}px, 0, 0)` }}>
        <CastleScene unlockedRoom={unlockedRoom} />
        {enemies.map((enemy) => <Enemy key={enemy.id} enemy={enemy} isTargeted={nearestIsVisible && nearestEnemy.id === enemy.id}
          isAttacking={enemy.health > 0 && distanceTo(controls.worldX, controls.y, enemy) < 130} isRevealed={abilities.owlSightActive} />)}
        {keys.map((key) => <KeyDrop key={key.room} x={key.x} y={key.y} />)}
        <ExitPortal {...PORTAL_POSITION} active={unlockedRoom === FINAL_ROOM} />
      </div>
      <div className="player-aura" style={{ left: controls.screenX, top: `${controls.y}%` }} />
      <GameHud playerHealth={playerHealth} enemyHealth={nearestIsVisible ? nearestEnemy.health : null} room={currentRoom} shownDamage={shownDamage} />
      <AbilityBar cooldowns={abilities.cooldowns} damageBoosted={abilities.damageBoosted} owlSightActive={abilities.owlSightActive} canHeal={playerHealth > 0 && playerHealth < 100}
        onDamage={abilities.activateDamage} onHeal={abilities.activateHeal} onOwlSight={abilities.activateOwlSight} />
      <Knight screenX={controls.screenX} y={controls.y} facing={controls.facing} isMoving={controls.isMoving} isAttacking={controls.isAttacking} />
      <div className="game-tip"><b>M1</b> удар · найди ключ после последнего врага</div>
      {completed && <div className="game-complete"><strong>ЗАМОК ПРОЙДЕН</strong><span>Ты достиг Круга судьбы</span></div>}
      {playerHealth === 0 && <div className="defeat">Рыцарь повержен</div>}
      <TouchControls onMove={controls.move} onAttack={controls.attack} />
    </main>
  );
}
