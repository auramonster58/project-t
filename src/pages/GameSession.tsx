import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AbilityBar } from '../components/game/AbilityBar';
import { ArrowShot } from '../components/game/ArrowShot';
import { CastleScene } from '../components/game/CastleScene';
import { CastleTrap, ExitPortal, KeyDrop } from '../components/game/CastleProgress';
import { Enemy } from '../components/game/Enemy';
import { GameHud } from '../components/game/GameHud';
import { GameResult } from '../components/game/GameResult';
import { Knight } from '../components/game/Knight';
import { TouchControls } from '../components/game/TouchControls';
import { WeaponSwitch } from '../components/game/WeaponSwitch';
import { useKnightAbilities } from '../hooks/useKnightAbilities';
import { useArrowShots } from '../hooks/useArrowShots';
import { useEnemyArchers } from '../hooks/useEnemyArchers';
import { useKnightControls } from '../hooks/useKnightControls';
import { usePlayerHealth } from '../hooks/usePlayerHealth';
import { useWeaponSwitch } from '../hooks/useWeaponSwitch';
import { combatDistance, CROSSBOW_DAMAGE, selectTarget, SWORD_DAMAGE } from '../lib/gameCombat';
import { createEnemies, createTraps, FINAL_ROOM, PORTAL_POSITION, ROOM_WIDTH, WORLD_WIDTH } from '../lib/gameData';
import '../styles/game-scene.css';
import '../styles/game-ui.css';

type DroppedKey = { room: number; x: number; y: number };

type GameSessionProps = { onRestart: () => void; onExitMenu: () => void };

export function GameSession({ onRestart, onExitMenu }: GameSessionProps) {
  const [enemies, setEnemies] = useState(createEnemies);
  const traps = useMemo(createTraps, []);
  const [keys, setKeys] = useState<DroppedKey[]>([]);
  const { arrows, shootArrow } = useArrowShots();
  const [hitEnemies, setHitEnemies] = useState<Set<number>>(() => new Set());
  const { weapon, switchWeapon } = useWeaponSwitch();
  const [unlockedRoom, setUnlockedRoom] = useState(0);
  const player = usePlayerHealth();
  const [shownDamage, setShownDamage] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const abilities = useKnightAbilities(weapon, player.heal, player.health > 0 && player.health < 100);

  const strikeEnemy = useCallback((worldX: number, y: number, facing: 1 | -1) => {
    setEnemies((current) => {
      const target = selectTarget(current, { weapon, worldX, y, facing, unlockedRoom,
        autoAim: weapon === 'crossbow' && abilities.autoAimActive });
      if (!target) {
        if (weapon === 'crossbow') shootArrow(worldX, y, worldX + facing * 900, y);
        return current;
      }
      const damage = weapon === 'crossbow' ? CROSSBOW_DAMAGE : abilities.rageActive ? SWORD_DAMAGE * 2 : SWORD_DAMAGE;
      const isLastInRoom = target.health <= damage && current
        .filter((enemy) => enemy.room === target.room && enemy.health > 0).length === 1;
      if (isLastInRoom) {
        setKeys((drops) => drops.some((key) => key.room === target.room)
          ? drops : [...drops, { room: target.room, x: target.x, y: target.y }]);
      }
      if (weapon === 'crossbow') {
        shootArrow(worldX, y,
          abilities.autoAimActive ? target.x : worldX + facing * 900,
          abilities.autoAimActive ? target.y : y);
      }
      setHitEnemies((hit) => new Set(hit).add(target.id));
      window.setTimeout(() => setHitEnemies((hit) => {
        const next = new Set(hit); next.delete(target.id); return next;
      }), 900);
      setShownDamage(Math.round(damage));
      window.setTimeout(() => setShownDamage(null), 420);
      return current.map((enemy) => enemy.id === target.id
        ? { ...enemy, health: Math.max(0, enemy.health - damage) } : enemy);
    });
  }, [abilities.autoAimActive, abilities.rageActive, shootArrow, unlockedRoom, weapon]);

  const maxWorldX = unlockedRoom === FINAL_ROOM ? WORLD_WIDTH - 100 : (unlockedRoom + 1) * ROOM_WIDTH - 90;
  const instantShot = weapon === 'crossbow' && abilities.hermesActive;
  const controls = useKnightControls(strikeEnemy, maxWorldX, WORLD_WIDTH, instantShot);
  const positionRef = useRef({ x: controls.worldX, y: controls.y });
  const enemiesRef = useRef(enemies);
  const enemyArrows = useEnemyArchers(enemies, setEnemies, positionRef, unlockedRoom, player.takeDamage);
  useEffect(() => { positionRef.current = { x: controls.worldX, y: controls.y }; }, [controls.worldX, controls.y]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);

  const nearestEnemy = useMemo(() => enemies.filter((enemy) => enemy.health > 0)
    .sort((a, b) => combatDistance(controls.worldX, controls.y, a) - combatDistance(controls.worldX, controls.y, b))[0],
  [controls.worldX, controls.y, enemies]);
  const nearestIsVisible = nearestEnemy && combatDistance(controls.worldX, controls.y, nearestEnemy) <= 360;

  useEffect(() => {
    const timer = window.setInterval(() => {
      const playerPosition = positionRef.current;
      const enemyHit = enemiesRef.current.some((enemy) => enemy.kind === 'guard'
        && enemy.health > 0 && combatDistance(playerPosition.x, playerPosition.y, enemy) < 130);
      const trapHit = traps.some((trap) => trap.room <= unlockedRoom
        && Math.hypot(trap.x - playerPosition.x, (trap.y - playerPosition.y) * 9) < 70);
      if (enemyHit || trapHit) player.takeDamage(10);
    }, 900);
    return () => window.clearInterval(timer);
  }, [player.takeDamage, traps, unlockedRoom]);

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
    <main className={`game-page ${weapon === 'sword' && abilities.owlSightActive ? 'game-page--owl-sight' : ''}`} style={{ '--light-x': `${controls.screenX}px`, '--light-y': `${controls.y}%` } as React.CSSProperties}>
      <div className="scrolling-world" style={{ width: WORLD_WIDTH, transform: `translate3d(${-controls.cameraX}px, 0, 0)` }}>
        <CastleScene unlockedRoom={unlockedRoom} />
        {enemies.map((enemy) => <Enemy key={enemy.id} enemy={enemy} facing={enemy.x > controls.worldX ? -1 : 1}
          isTargeted={nearestIsVisible && nearestEnemy.id === enemy.id}
          isAttacking={enemy.kind === 'guard' && enemy.health > 0 && combatDistance(controls.worldX, controls.y, enemy) < 130}
          isRevealed={weapon === 'sword' && abilities.owlSightActive} isHit={hitEnemies.has(enemy.id)}
          isInLight={combatDistance(controls.worldX, controls.y, enemy) <= 360} />)}
        {traps.map((trap) => <CastleTrap key={trap.id} x={trap.x} y={trap.y} />)}
        {arrows.map((arrow) => <ArrowShot key={arrow.id} arrow={arrow} />)}
        {enemyArrows.map((arrow) => <ArrowShot key={arrow.id} arrow={arrow} />)}
        {keys.map((key) => <KeyDrop key={key.room} x={key.x} y={key.y} />)}
        <ExitPortal {...PORTAL_POSITION} active={unlockedRoom === FINAL_ROOM} />
      </div>
      <div className="player-aura" style={{ left: controls.screenX, top: `${controls.y}%` }} />
      <GameHud playerHealth={player.health} enemyHealth={nearestIsVisible ? nearestEnemy.health : null} room={currentRoom} shownDamage={shownDamage} />
      <button className="exit-menu-button" onClick={onExitMenu}>ВЫЙТИ В МЕНЮ</button>
      <WeaponSwitch weapon={weapon} onSwitch={switchWeapon} />
      <AbilityBar weapon={weapon} cooldowns={abilities.cooldowns} rageActive={abilities.rageActive}
        autoAimActive={abilities.autoAimActive} healingActive={abilities.healingActive} owlSightActive={abilities.owlSightActive}
        hermesActive={abilities.hermesActive} canHeal={player.health > 0 && player.health < 100}
        onPrimary={abilities.activatePrimary} onHeal={abilities.activateHeal} onUtility={abilities.activateUtility} />
      <div className={player.isImmune ? 'player-immune' : ''}>
        <Knight weapon={weapon} screenX={controls.screenX} y={controls.y} facing={controls.facing} isMoving={controls.isMoving} isAttacking={controls.isAttacking} />
      </div>
      <div className="game-tip"><b>Q</b> сменить оружие · <b>M1</b> атаковать</div>
      {completed && <GameResult title="ЗАМОК ПРОЙДЕН" subtitle="Ты достиг Круга судьбы"
        onRestart={onRestart} onExitMenu={onExitMenu} />}
      {player.health === 0 && <GameResult title="РЫЦАРЬ ПОВЕРЖЕН" subtitle="Попробуй пройти замок ещё раз"
        onRestart={onRestart} onExitMenu={onExitMenu} />}
      <TouchControls onMove={controls.move} onAttack={controls.attack} />
    </main>
  );
}
