import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AbilityBar } from '../components/game/AbilityBar';
import { AmbushMonster } from '../components/game/AmbushMonster';
import { ArrowShot } from '../components/game/ArrowShot';
import { CastleScene } from '../components/game/CastleScene';
import { ChestMimicScreamer } from '../components/game/ChestMimicScreamer';
import { CastleTrap, ExitPortal, KeyDrop } from '../components/game/CastleProgress';
import { Enemy } from '../components/game/Enemy';
import { FakeDeathOverlay } from '../components/game/FakeDeathOverlay';
import { FifthHallQuest, QuestNoteOverlay } from '../components/game/FifthHallQuest';
import { GameHud } from '../components/game/GameHud';
import { GameResult } from '../components/game/GameResult';
import { HealthParticle } from '../components/game/HealthParticle';
import { Knight } from '../components/game/Knight';
import { QuestScreamer } from '../components/game/QuestScreamer';
import { TouchControls } from '../components/game/TouchControls';
import { WeaponSwitch } from '../components/game/WeaponSwitch';
import { useKnightAbilities } from '../hooks/useKnightAbilities';
import { useArrowShots } from '../hooks/useArrowShots';
import { useEnemyArchers } from '../hooks/useEnemyArchers';
import { useEnemyGuards } from '../hooks/useEnemyGuards';
import { useHealthParticles } from '../hooks/useHealthParticles';
import { FIFTH_HALL_CHEST, useFifthHallQuest } from '../hooks/useFifthHallQuest';
import { useKnightControls } from '../hooks/useKnightControls';
import { usePassageAmbush, type AmbushStrike } from '../hooks/usePassageAmbush';
import { usePlayerHealth } from '../hooks/usePlayerHealth';
import { useWeaponSwitch } from '../hooks/useWeaponSwitch';
import { combatDistance, CROSSBOW_DAMAGE, selectTarget, SWORD_DAMAGE } from '../lib/gameCombat';
import { createDecoyGuards, createEnemies, createTraps, FINAL_ROOM, isInTorchLight, PORTAL_POSITION,
  ROOM_WIDTH, THIRD_PASSAGE_CENTER, UPPER_ROOM_INDEX, WORLD_WIDTH } from '../lib/gameData';
import { loadGameSave, saveGame } from '../lib/gameSave';
import { playScreamerSound } from '../lib/screamerSound';
import '../styles/game-scene.css';
import '../styles/game-ui.css';
import '../styles/screamers.css';
import '../styles/pixel-game.css';

type DroppedKey = { room: number; x: number; y: number };

type GameSessionProps = {
  onRestart: () => void;
  onExitMenu: () => void;
  bossMode?: boolean;
  userId: string;
};

export function GameSession({ onRestart, onExitMenu, bossMode = false, userId }: GameSessionProps) {
  const [enemies, setEnemies] = useState(createEnemies);
  const traps = useMemo(createTraps, []);
  const [keys, setKeys] = useState<DroppedKey[]>([]);
  const { arrows, shootArrow } = useArrowShots();
  const [hitEnemies, setHitEnemies] = useState<Set<number>>(() => new Set());
  const { weapon, switchWeapon } = useWeaponSwitch();
  const [unlockedRoom, setUnlockedRoom] = useState(0);
  const player = usePlayerHealth(bossMode);
  const [shownDamage, setShownDamage] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [upperRoomUnlocked, setUpperRoomUnlocked] = useState(false);
  const [scarePhase, setScarePhase] = useState<'idle' | 'screamer' | 'defeat'>('idle');
  const [decoyGuardsReleased, setDecoyGuardsReleased] = useState(false);
  const [saveReady, setSaveReady] = useState(false);
  const [playerDefeatVisible, setPlayerDefeatVisible] = useState(false);
  const [completionVisible, setCompletionVisible] = useState(false);
  const droppedHealthEnemies = useRef(new Set<number>());
  const ambushAttackRef = useRef<(x: number, y: number, facing: 1 | -1, range: number) => AmbushStrike | null>(() => null);
  const fifthQuestRestoreRef = useRef<(noteRead: boolean, keyCollected: boolean, chestOpened: boolean) => void>(() => undefined);
  const enemyHealthSignature = enemies.map((enemy) => `${enemy.id}:${enemy.health}`).join('|');
  const abilities = useKnightAbilities(weapon, player.heal, player.health > 0 && player.health < 100);

  useEffect(() => {
    let active = true;
    loadGameSave(userId).then((saved) => {
      if (!active || !saved) return;
      const healthById = new Map(saved.enemies.map((enemy) => [enemy.id, enemy.health]));
      setEnemies((current) => {
        const restored = saved.decoyGuardsReleased
          ? [...current, ...createDecoyGuards().filter((guard) => !current.some((enemy) => enemy.id === guard.id))]
          : current;
        return restored.map((enemy) => ({ ...enemy, health: healthById.get(enemy.id) ?? enemy.health }));
      });
      setUnlockedRoom(Math.min(FINAL_ROOM, saved.unlockedRoom));
      setKeys(saved.keys);
      setCompleted(saved.completed);
      setUpperRoomUnlocked(saved.ambushResolved ?? false);
      setDecoyGuardsReleased(saved.decoyGuardsReleased ?? false);
      fifthQuestRestoreRef.current(saved.fifthHallNoteRead ?? false, saved.fifthHallKeyCollected ?? false,
        saved.fifthHallChestOpened ?? false);
      ambushRestoreRef.current(saved.ambushResolved ?? false);
      player.restoreHealth(saved.playerHealth);
    }).catch(() => undefined).finally(() => {
      if (active) setSaveReady(true);
    });
    return () => { active = false; };
  }, [player.restoreHealth, userId]);

  const dropHealthRef = useRef<(x: number, y: number) => void>(() => undefined);
  const ambushRestoreRef = useRef<(resolved: boolean) => void>(() => undefined);
  const strikeEnemy = useCallback((worldX: number, y: number, facing: 1 | -1) => {
    const ambushStrike = ambushAttackRef.current(worldX, y, facing, weapon === 'crossbow' ? 900 : 185);
    if (ambushStrike) {
      if (weapon === 'crossbow') shootArrow(worldX, y, ambushStrike.x, ambushStrike.y);
      if (ambushStrike.damage !== null) {
        setShownDamage(Math.round(ambushStrike.damage));
        window.setTimeout(() => setShownDamage(null), 420);
      }
      return;
    }
    setEnemies((current) => {
      const target = selectTarget(current, { weapon, worldX, y, facing, unlockedRoom,
        autoAim: weapon === 'crossbow' && abilities.autoAimActive });
      if (!target) {
        if (weapon === 'crossbow') shootArrow(worldX, y, worldX + facing * 900, y);
        return current;
      }
      const regularDamage = weapon === 'crossbow' ? CROSSBOW_DAMAGE : abilities.rageActive ? SWORD_DAMAGE * 2 : SWORD_DAMAGE;
      const damage = bossMode ? target.health : regularDamage;
      const isLastInRoom = target.health <= damage && current
        .filter((enemy) => enemy.room === target.room && enemy.health > 0).length === 1;
      if (isLastInRoom) {
        setKeys((drops) => drops.some((key) => key.room === target.room)
          ? drops : [...drops, { room: target.room, x: target.x, y: target.y }]);
      }
      if (target.health <= damage && !droppedHealthEnemies.current.has(target.id)) {
        droppedHealthEnemies.current.add(target.id);
        dropHealthRef.current(target.x, target.y);
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
  }, [abilities.autoAimActive, abilities.rageActive, bossMode, shootArrow, unlockedRoom, weapon]);

  const maxWorldX = unlockedRoom === FINAL_ROOM ? WORLD_WIDTH - 100 : (unlockedRoom + 1) * ROOM_WIDTH - 90;
  const instantShot = weapon === 'crossbow' && abilities.hermesActive;
  const summonedBlockers = useMemo(() => enemies.filter((enemy) => enemy.id >= 9101 && enemy.id <= 9104), [enemies]);
  const controls = useKnightControls(strikeEnemy, maxWorldX, WORLD_WIDTH, ROOM_WIDTH, instantShot,
    bossMode ? 2 : 1, upperRoomUnlocked, summonedBlockers, player.health > 0 && !completed);
  const positionRef = useRef({ x: controls.worldX, y: controls.y });
  const ambush = usePassageAmbush(positionRef, bossMode);
  const fifthQuest = useFifthHallQuest(positionRef, controls.teleport);
  fifthQuestRestoreRef.current = fifthQuest.restore;
  ambushAttackRef.current = ambush.attack;
  ambushRestoreRef.current = ambush.restoreResolved;

  useEffect(() => {
    if (!saveReady) return;
    const timer = window.setTimeout(() => {
      saveGame(userId, {
        unlockedRoom,
        playerHealth: player.health,
        enemies: enemies.map(({ id, health }) => ({ id, health })),
        keys,
        completed,
        ambushResolved: ambush.resolved,
        decoyGuardsReleased,
        fifthHallNoteRead: fifthQuest.state !== 'waiting',
        fifthHallKeyCollected: ['complete', 'chest-scare', 'finished'].includes(fifthQuest.state),
        fifthHallChestOpened: fifthQuest.state === 'finished',
      }).catch(() => undefined);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [ambush.resolved, completed, decoyGuardsReleased, enemyHealthSignature, fifthQuest.state, keys,
    player.health, saveReady, unlockedRoom, userId]);

  const healthDrops = useHealthParticles(positionRef, player.heal);
  dropHealthRef.current = healthDrops.dropHealth;
  const { enemyArrows, shootingArchers } = useEnemyArchers(
    enemies, setEnemies, positionRef, unlockedRoom, player.takeDamage,
  );
  const guardAttacks = useEnemyGuards(enemies, setEnemies, positionRef, unlockedRoom,
    ambush.resolved, player.takeDamage);
  useEffect(() => { positionRef.current = { x: controls.worldX, y: controls.y }; }, [controls.worldX, controls.y]);

  useEffect(() => {
    if (player.health > 0) {
      setPlayerDefeatVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setPlayerDefeatVisible(true), 850);
    return () => window.clearTimeout(timer);
  }, [player.health]);

  useEffect(() => {
    if (!completed) {
      setCompletionVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setCompletionVisible(true), 900);
    return () => window.clearTimeout(timer);
  }, [completed]);

  useEffect(() => {
    if (ambush.resolved) setUpperRoomUnlocked(true);
  }, [ambush.resolved]);

  useEffect(() => {
    const isNearDecoys = Math.abs(controls.worldX - THIRD_PASSAGE_CENTER) < 430;
    if (!ambush.resolved || decoyGuardsReleased || !isNearDecoys) return;
    setDecoyGuardsReleased(true);
    setEnemies((current) => [...current, ...createDecoyGuards()
      .filter((guard) => !current.some((enemy) => enemy.id === guard.id))]);
  }, [ambush.resolved, controls.worldX, decoyGuardsReleased]);

  useEffect(() => {
    const isDeepInsideUpperRoom = Math.floor(controls.worldX / ROOM_WIDTH) === UPPER_ROOM_INDEX
      && controls.y <= 17;
    if (!upperRoomUnlocked || !isDeepInsideUpperRoom || scarePhase !== 'idle') return;
    setScarePhase('screamer');
  }, [controls.worldX, controls.y, scarePhase, upperRoomUnlocked]);

  useEffect(() => {
    if (scarePhase !== 'screamer') return;
    const stopSound = playScreamerSound('beast');
    const timer = window.setTimeout(() => setScarePhase('defeat'), 1350);
    return () => {
      window.clearTimeout(timer);
      stopSound();
    };
  }, [scarePhase]);

  useEffect(() => {
    if (fifthQuest.state !== 'scare') return;
    const stopSound = playScreamerSound('chase');
    const timer = window.setTimeout(fifthQuest.finishScare, 1100);
    return () => {
      window.clearTimeout(timer);
      stopSound();
    };
  }, [fifthQuest.finishScare, fifthQuest.state]);

  useEffect(() => {
    if (ambush.phase !== 'fake-death') return;
    const stopSound = playScreamerSound('beast');
    return stopSound;
  }, [ambush.phase]);

  useEffect(() => {
    if (fifthQuest.state !== 'chest-scare') return;
    const stopSound = playScreamerSound('mimic');
    const timer = window.setTimeout(fifthQuest.finishChestScare, 3000);
    return () => {
      window.clearTimeout(timer);
      stopSound();
    };
  }, [fifthQuest.finishChestScare, fifthQuest.state]);

  useEffect(() => {
    if (!ambush.respawnRequested) return;
    controls.teleport(150, 52);
    player.restoreHealth(100);
    ambush.finishRespawn();
  }, [ambush.finishRespawn, ambush.respawnRequested, controls.teleport, player.restoreHealth]);

  const nearestEnemy = useMemo(() => enemies.filter((enemy) => enemy.health > 0)
    .sort((a, b) => combatDistance(controls.worldX, controls.y, a) - combatDistance(controls.worldX, controls.y, b))[0],
  [controls.worldX, controls.y, enemies]);
  const nearestIsVisible = nearestEnemy && combatDistance(controls.worldX, controls.y, nearestEnemy) <= 360;

  useEffect(() => {
    const timer = window.setInterval(() => {
      const position = positionRef.current;
      const trapHit = traps.some((trap) => trap.room <= unlockedRoom
        && Math.hypot(trap.x - position.x, (trap.y - position.y) * 9) < 70);
      if (trapHit) player.takeDamage(10);
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
  const torchRoom = currentRoom <= 2 ? currentRoom - 1 : null;
  const torchLeftX = torchRoom === null ? 0 : torchRoom * ROOM_WIDTH + 125 - controls.cameraX;
  const torchRightX = torchRoom === null ? 0 : (torchRoom + 1) * ROOM_WIDTH - 125 - controls.cameraX;
  return (
    <main className={`game-page ${torchRoom !== null ? 'game-page--torch-lit' : ''} ${weapon === 'sword' && abilities.owlSightActive ? 'game-page--owl-sight' : ''}`} style={{ '--light-x': `${controls.screenX}px`, '--light-y': `${controls.y}%` } as React.CSSProperties}>
      <div className="scrolling-world" style={{ width: WORLD_WIDTH, transform: `translate3d(${-controls.cameraX}px, 0, 0)` }}>
        <CastleScene unlockedRoom={unlockedRoom} ambushResolved={ambush.resolved}
          decoyGuardsReleased={decoyGuardsReleased} />
        {enemies.map((enemy) => <Enemy key={enemy.id} enemy={enemy} facing={enemy.x > controls.worldX ? -1 : 1}
          isTargeted={nearestIsVisible && nearestEnemy.id === enemy.id}
          attackPhase={guardAttacks[enemy.id] ?? 'idle'}
          isShooting={shootingArchers.has(enemy.id)}
          isRevealed={weapon === 'sword' && abilities.owlSightActive} isHit={hitEnemies.has(enemy.id)}
          isInLight={combatDistance(controls.worldX, controls.y, enemy) <= 360 || isInTorchLight(enemy)} />)}
        {ambush.ambushers.map((monster) => <AmbushMonster key={monster.id} monster={monster} bossMode={bossMode} />)}
        <FifthHallQuest state={fifthQuest.state} monster={fifthQuest.monster} />
        {traps.map((trap) => <CastleTrap key={trap.id} x={trap.x} y={trap.y} />)}
        {arrows.map((arrow) => <ArrowShot key={arrow.id} arrow={arrow} />)}
        {enemyArrows.map((arrow) => <ArrowShot key={arrow.id} arrow={arrow} />)}
        {keys.map((key) => <KeyDrop key={key.room} x={key.x} y={key.y} />)}
        {healthDrops.particles.map((particle) => <HealthParticle key={particle.id} particle={particle} />)}
        <ExitPortal {...PORTAL_POSITION} active={unlockedRoom === FINAL_ROOM} />
      </div>
      {torchRoom !== null && <div className="torch-screen-light" aria-hidden="true">
        <i style={{ left: torchLeftX }} /><i style={{ left: torchRightX }} />
      </div>}
      <div className="player-aura" style={{ left: controls.screenX, top: `${controls.y}%` }} />
      <GameHud playerHealth={player.health} enemyHealth={nearestIsVisible ? nearestEnemy.health : null} room={currentRoom} shownDamage={shownDamage} />
      <button className="exit-menu-button" onClick={onExitMenu}>ВЫЙТИ В МЕНЮ</button>
      <WeaponSwitch weapon={weapon} onSwitch={switchWeapon} />
      <AbilityBar weapon={weapon} cooldowns={abilities.cooldowns} rageActive={abilities.rageActive}
        autoAimActive={abilities.autoAimActive} healingActive={abilities.healingActive} owlSightActive={abilities.owlSightActive}
        hermesActive={abilities.hermesActive} canHeal={player.health > 0 && player.health < 100}
        onPrimary={abilities.activatePrimary} onHeal={abilities.activateHeal} onUtility={abilities.activateUtility} />
      <div className={player.isImmune ? 'player-immune' : ''}>
        <Knight weapon={weapon} screenX={controls.screenX} y={controls.y} facing={controls.facing}
          direction={controls.direction}
          health={player.health} isMoving={controls.isMoving} isRunning={controls.isMoving && abilities.hermesActive}
          isAttacking={controls.isAttacking} isBlocking={player.isImmune && !controls.isMoving}
          isVictorious={completed} attackSequence={controls.attackSequence} />
      </div>
      <div className="game-tip"><b>Q</b> сменить оружие · <b>M1</b> атаковать</div>
      {ambush.phase === 'hunting' && <div className="ambush-warning">ЗАСАДА · ОНИ ИДУТ С ДВУХ СТОРОН</div>}
      {ambush.phase === 'fake-death' && <FakeDeathOverlay weapon={weapon} />}
      {scarePhase === 'screamer' && <FakeDeathOverlay weapon={weapon} />}
      {fifthQuest.state === 'scare' && <QuestScreamer />}
      {fifthQuest.state === 'chest-scare' && <ChestMimicScreamer weapon={weapon}
        originX={FIFTH_HALL_CHEST.x - controls.cameraX} originY={FIFTH_HALL_CHEST.y} />}
      <QuestNoteOverlay open={fifthQuest.noteOpen} />
      {scarePhase === 'defeat' && <GameResult title="ТЕБЯ НАПУГАЛИ" subtitle="Верхняя комната оказалась ловушкой"
        onRestart={onRestart} onExitMenu={onExitMenu} />}
      {completionVisible && <GameResult title="ЗАМОК ПРОЙДЕН" subtitle="Ты достиг Круга судьбы"
        onRestart={onRestart} onExitMenu={onExitMenu} />}
      {playerDefeatVisible && <GameResult title="РЫЦАРЬ ПОВЕРЖЕН" subtitle="Попробуй пройти замок ещё раз"
        onRestart={onRestart} onExitMenu={onExitMenu} />}
      <TouchControls onMove={controls.move} onAttack={controls.attack} />
    </main>
  );
}
