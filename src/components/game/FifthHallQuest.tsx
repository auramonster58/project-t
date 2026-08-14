import type { ChaseMonsterData, FifthHallQuestState } from '../../hooks/useFifthHallQuest';
import { FIFTH_HALL_CHEST, FIFTH_HALL_NOTE, FIRST_HALL_EXCALIBUR_KEY } from '../../hooks/useFifthHallQuest';
import { horrorMonsterSheet } from '../../lib/spriteData';
import { PixelSprite } from './PixelSprite';

type FifthHallQuestProps = {
  state: FifthHallQuestState;
  monster: ChaseMonsterData | null;
};

export function FifthHallQuest({ state, monster }: FifthHallQuestProps) {
  const hasKey = state === 'complete' || state === 'chest-scare' || state === 'finished';
  const isOpened = state === 'chest-scare' || state === 'finished';
  return <>
    <div className={`quest-chest ${hasKey ? 'quest-chest--unlocked' : ''} ${isOpened ? 'quest-chest--opened' : ''}`}
      style={{ left: FIFTH_HALL_CHEST.x, top: `${FIFTH_HALL_CHEST.y}%` }}>
      <i /><span>◆</span><small>{state === 'complete' ? 'T · ОТКРЫТЬ СУНДУК'
        : isOpened ? 'ПУСТО' : 'НУЖЕН КЛЮЧ'}</small>
    </div>
    <div className="quest-note" style={{ left: FIFTH_HALL_NOTE.x, top: `${FIFTH_HALL_NOTE.y}%` }}>
      <span>▱</span><small><b>T</b> ОТКРЫТЬ ЗАПИСКУ</small>
    </div>
    {(state === 'chase' || state === 'scare') && <div className="quest-key"
      style={{ left: FIRST_HALL_EXCALIBUR_KEY.x, top: `${FIRST_HALL_EXCALIBUR_KEY.y}%` }}>
      <span>◆</span><small>КЛЮЧ ОТ ЭКСКАЛИБУРА</small></div>}
    {monster && <ChaseMonster monster={monster} />}
  </>;
}

export function QuestNoteOverlay({ open }: { open: boolean }) {
  return open ? <div className="quest-note-modal"><article><b>ЭТО ВАЖНО</b>
    <p>Ключ от Экскалибура находится в первом зале. Возвращайся туда, но не останавливайся.</p>
    <small>Нажми T, чтобы закрыть</small></article></div> : null;
}

function ChaseMonster({ monster }: { monster: ChaseMonsterData }) {
  return <div className="quest-chase-monster" style={{ left: monster.x, top: `${monster.y}%`,
    '--monster-facing': monster.facing } as React.CSSProperties}>
    <PixelSprite animation="run" sheet={horrorMonsterSheet} />
  </div>;
}
