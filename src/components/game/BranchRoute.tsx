import { useEffect, useRef, useState } from 'react';
import { useBranchControls } from '../../hooks/useBranchControls';
import { useGameViewScale } from '../../hooks/useGameViewScale';
import type { DialogueLine } from '../../lib/kingDialogue';
import type { Weapon } from '../../lib/gameCombat';
import type { BranchRoute as BranchRouteName } from '../../lib/gameSave';
import { horrorMonsterSheet } from '../../lib/spriteData';
import { DialogueBox } from './DialogueBox';
import { GameResult } from './GameResult';
import { Knight } from './Knight';
import { PixelSprite } from './PixelSprite';
import { RoomDecor } from './RoomDecor';
import { StationaryKing } from './StationaryKing';
import { TouchControls } from './TouchControls';
import { WeaponSwitch } from './WeaponSwitch';

type Phase = 'travel' | 'chase' | 'rescued' | 'king' | 'fight-intro' | 'fight' | 'fight-end' | 'ending';
type Props = { route: BranchRouteName; initialDistance?: number; completed: boolean;
  weapon: Weapon; onSwitchWeapon: () => void; onComplete: () => void; onExitMenu: () => void;
  onProgress: (distance: number) => void; onRestart: () => void };

const TRUE_ENDING: DialogueLine[] = [
  { speaker: 'king', emotion: 'surprised', text: 'Сын?.. Неужели это ты?' },
  { speaker: 'king', emotion: 'happy', text: 'О, сын мой! Я так долго тебя искал!' },
  { speaker: 'knight', emotion: 'talking', text: 'Встреча состоялась. Теперь уходим — замок рушится.' },
  { speaker: 'king', emotion: 'happy', text: 'Вместе. На этот раз никто не останется здесь один.' },
];
const FIGHT_INTRO: DialogueLine[] = [
  { speaker: 'king', emotion: 'afraid', text: 'Стой! Мы не можем уйти — нужно найти моего сына!' },
  { speaker: 'knight', emotion: 'angry', text: 'Назад! В темноте что-то движется.' },
];
const FIGHT_END: DialogueLine[] = [
  { speaker: 'king', emotion: 'surprised', text: 'Ты одолел его... но на шум придут другие.' },
  { speaker: 'king', emotion: 'sad', text: 'Теперь я понимаю: каждая минута здесь равна смерти.' },
  { speaker: 'knight', emotion: 'talking', text: 'Мы найдём принца. Но сначала выведем вас из замка.' },
];

export function BranchRoute(props: Props) {
  const [phase, setPhase] = useState<Phase>('travel');
  const [monsterHealth, setMonsterHealth] = useState(60);
  const canControl = phase === 'travel' || phase === 'rescued' || phase === 'fight';
  const controls = useBranchControls(props.route, props.initialDistance, canControl);
  const previousAttack = useRef(controls.attackSequence);
  const viewScale = useGameViewScale();
  const viewportHeight = typeof window === 'undefined' ? 800 : window.innerHeight;
  const viewportWidth = typeof window === 'undefined' ? 1200 : window.innerWidth;
  const worldY = controls.distance * viewportHeight / 100;
  const visibleWorldHeight = viewportHeight / viewScale;
  const cameraY = Math.min(5 * viewportHeight - visibleWorldHeight, Math.max(0, worldY - visibleWorldHeight / 2));
  const screenY = (worldY - cameraY) * viewScale / viewportHeight * 100;

  useEffect(() => props.onProgress(controls.distance), [controls.distance, props.onProgress]);
  useEffect(() => {
    if (phase !== 'travel') return;
    if (props.route === 'up' && controls.distance <= 20) setPhase('chase');
    if (props.route === 'down' && controls.distance >= 480) setPhase('rescued');
    if (props.route === 'middle' && controls.distance >= 480) setPhase('fight-intro');
  }, [controls.distance, phase, props.route]);
  useEffect(() => {
    if (phase === 'rescued' && controls.distance <= 20) setPhase('king');
  }, [controls.distance, phase]);
  useEffect(() => {
    if (phase !== 'chase') return;
    const timer = window.setTimeout(() => { setPhase('ending'); props.onComplete(); }, 4200);
    return () => window.clearTimeout(timer);
  }, [phase, props.onComplete]);
  useEffect(() => {
    if (phase !== 'fight' || controls.attackSequence === previousAttack.current) return;
    previousAttack.current = controls.attackSequence;
    setMonsterHealth((health) => {
      const next = Math.max(0, health - (props.weapon === 'sword' ? 3 : 1));
      if (next === 0) window.setTimeout(() => setPhase('fight-end'), 350);
      return next;
    });
  }, [controls.attackSequence, phase, props.weapon]);

  const finish = () => { setPhase('ending'); props.onComplete(); };
  const rooms = Array.from({ length: 5 }, (_, index) => props.route === 'up' ? 5 - index : index + 1);
  const carriesPrince = props.route === 'down' && ['rescued', 'king', 'ending'].includes(phase);
  const ending = props.route === 'up'
    ? { title: 'МОНСТР ДОГНАЛ ТЕБЯ', subtitle: 'Из верхнего пути не было выхода' }
    : props.route === 'down'
      ? { title: 'ИСТИННАЯ КОНЦОВКА', subtitle: 'Король и принц снова вместе. Вы покинули замок.' }
      : { title: 'ХОРОШАЯ КОНЦОВКА', subtitle: 'Король понял цену каждой минуты в проклятом замке.' };

  return <main className={`game-page branch-route branch-route--${props.route}`}>
    <div className="branch-world" style={{ transformOrigin: '0 0', transform: `translate3d(0, ${-cameraY * viewScale}px, 0) scale(${viewScale})` }}>
      {rooms.map((room) => <section className="branch-room" key={room}><RoomDecor room={room} />
        <i className="branch-wall branch-wall--left" /><i className="branch-wall branch-wall--right" />
        <span>ВЕТКА · КОМНАТА {room}</span><b>{props.route === 'up' ? '↑' : props.route === 'down' ? '↓' : '→'}</b></section>)}
    </div>
    <header className="branch-hud"><strong>{props.route === 'middle' ? 'СРЕДНИЙ' : props.route === 'up' ? 'ВЕРХНИЙ' : 'НИЖНИЙ'} ПУТЬ</strong><span>КОМНАТА {controls.room} / 5</span></header>
    <button className="exit-menu-button" onClick={props.onExitMenu}>ВЫЙТИ В МЕНЮ</button>
    {carriesPrince && <img className="branch-prince-carried" src="/assets/rescued-prince.png" alt="Принц на спине рыцаря" style={{ left: viewportWidth * controls.lane / 100, top: `${screenY}%` }} />}
    <Knight weapon={props.weapon} screenX={viewportWidth * controls.lane / 100} y={screenY}
      facing={controls.direction === 'left' ? -1 : 1} direction={controls.direction} health={100}
      isMoving={controls.isMoving} isRunning={phase === 'chase'} isAttacking={controls.isAttacking}
      isBlocking={false} isVictorious={phase === 'ending' && props.route !== 'up'} attackSequence={controls.attackSequence} />
    {phase === 'chase' && <div className="branch-chasing-monster"><PixelSprite sheet={horrorMonsterSheet} animation="run" direction="up" /><strong>ОН ДОГОНЯЕТ!</strong></div>}
    {['fight-intro', 'fight', 'fight-end'].includes(phase) && <><StationaryKing /><div className={`branch-boss ${monsterHealth === 0 ? 'branch-boss--dead' : ''}`}><PixelSprite sheet={horrorMonsterSheet} animation={monsterHealth === 0 ? 'dead' : phase === 'fight' ? 'attack1' : 'idle'} /><i><span style={{ width: `${monsterHealth / 60 * 100}%` }} /></i></div></>}
    {phase === 'rescued' && <div className="branch-message">ПРИНЦ НАЙДЕН · ВЕРНИСЬ К КОРОЛЮ</div>}
    {phase === 'fight' && <div className="branch-message">МЕЧ: 20 УДАРОВ · АРБАЛЕТ: 60 ВЫСТРЕЛОВ</div>}
    {phase === 'king' && <DialogueBox lines={TRUE_ENDING} onFinish={finish} />}
    {phase === 'fight-intro' && <DialogueBox lines={FIGHT_INTRO} onFinish={() => setPhase('fight')} />}
    {phase === 'fight-end' && <DialogueBox lines={FIGHT_END} onFinish={finish} />}
    <TouchControls onMove={controls.move} onAttack={controls.attack} />
    <WeaponSwitch weapon={props.weapon} onSwitch={props.onSwitchWeapon} />
    {phase === 'ending' && <GameResult title={ending.title} subtitle={ending.subtitle} onRestart={props.onRestart} onExitMenu={props.onExitMenu} />}
  </main>;
}
