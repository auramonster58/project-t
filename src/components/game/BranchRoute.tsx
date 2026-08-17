import { useEffect } from 'react';
import { useBranchControls } from '../../hooks/useBranchControls';
import type { BranchRoute as BranchRouteName } from '../../lib/gameSave';
import { GameResult } from './GameResult';
import { Knight } from './Knight';
import { RoomDecor } from './RoomDecor';
import { TouchControls } from './TouchControls';

type BranchRouteProps = {
  route: BranchRouteName;
  initialDistance?: number;
  completed: boolean;
  onComplete: () => void;
  onExitMenu: () => void;
  onProgress: (distance: number) => void;
  onRestart: () => void;
};

export function BranchRoute(props: BranchRouteProps) {
  const controls = useBranchControls(props.route, props.initialDistance);
  const viewportHeight = typeof window === 'undefined' ? 800 : window.innerHeight;
  const viewportWidth = typeof window === 'undefined' ? 1200 : window.innerWidth;
  const worldY = controls.distance * viewportHeight / 100;
  const cameraY = Math.min(4 * viewportHeight, Math.max(0, worldY - viewportHeight / 2));
  const screenY = (worldY - cameraY) / viewportHeight * 100;

  useEffect(() => props.onProgress(controls.distance), [controls.distance, props.onProgress]);
  useEffect(() => {
    if (controls.completed && !props.completed) props.onComplete();
  }, [controls.completed, props.completed, props.onComplete]);

  const rooms = Array.from({ length: 5 }, (_, index) => props.route === 'up' ? 5 - index : index + 1);
  return (
    <main className={`game-page branch-route branch-route--${props.route}`}>
      <div className="branch-world" style={{ transform: `translate3d(0, ${-cameraY}px, 0)` }}>
        {rooms.map((room) => <section className="branch-room" key={room}>
          <RoomDecor room={room} />
          <i className="branch-wall branch-wall--left" />
          <i className="branch-wall branch-wall--right" />
          <span>ВЕТКА · КОМНАТА {room}</span>
          <b>{props.route === 'up' ? '↑' : '↓'}</b>
        </section>)}
      </div>
      <header className="branch-hud">
        <strong>{props.route === 'up' ? 'ВЕРХНИЙ' : 'НИЖНИЙ'} ПУТЬ</strong>
        <span>КОМНАТА {controls.room} / 5</span>
      </header>
      <button className="exit-menu-button" onClick={props.onExitMenu}>ВЫЙТИ В МЕНЮ</button>
      <Knight weapon="sword" screenX={viewportWidth * controls.lane / 100} y={screenY}
        facing={controls.direction === 'left' ? -1 : 1} direction={controls.direction} health={100}
        isMoving={controls.isMoving} isRunning={false} isAttacking={controls.isAttacking}
        isBlocking={false} isVictorious={props.completed} attackSequence={controls.attackSequence} />
      <TouchControls onMove={controls.move} onAttack={controls.attack} />
      {props.completed && <GameResult
        title={props.route === 'up' ? 'ТЫ СПАСЁН' : 'ТЬМА ПРИНЯЛА ТЕБЯ'}
        subtitle={props.route === 'up' ? 'Ты выбрался из проклятого замка' : 'Ты остался частью замка'}
        onRestart={props.onRestart} onExitMenu={props.onExitMenu} />}
    </main>
  );
}
