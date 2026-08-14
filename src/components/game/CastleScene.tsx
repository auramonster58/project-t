import { ROOM_COUNT, ROOM_WIDTH } from '../../lib/gameData';
import { CastlePassage } from './CastlePassage';
import { UpperChamber } from './UpperChamber';

type CastleSceneProps = { unlockedRoom: number; ambushResolved: boolean; decoyGuardsReleased: boolean };

export function CastleScene({ unlockedRoom, ambushResolved, decoyGuardsReleased }: CastleSceneProps) {
  return (
    <div className="castle-interior" aria-hidden="true">
      <div className="stone-floor" />
      <div className="hall-wall hall-wall--top" />
      <div className="hall-wall hall-wall--bottom" />
      {Array.from({ length: ROOM_COUNT }, (_, room) => (
        <div className={`castle-room castle-room--${room + 1}`} style={{ left: room * ROOM_WIDTH, width: ROOM_WIDTH }} key={room}>
          <span className="room-title">{room === ROOM_COUNT - 1 ? 'КРУГ СУДЬБЫ' : `ЗАЛ ${room + 1}`}</span>
          <i className="room-pillar pillar-a" /><i className="room-pillar pillar-b" />
          <i className="torch-wall torch-wall--top" /><i className="torch-wall torch-wall--bottom" />
          <i className="room-torch torch-a" /><i className="room-torch torch-b" />
          {room < 2 && <><i className="torch-light torch-light-a" /><i className="torch-light torch-light-b" /></>}
          {room === 2 && <UpperChamber isUnlocked={ambushResolved} />}
          <CastlePassage room={room} showAftermath={ambushResolved} guardsReleased={decoyGuardsReleased} />
          {room > unlockedRoom && <span className="room-darkness" />}
        </div>
      ))}
      {Array.from({ length: ROOM_COUNT - 1 }, (_, door) => (
        <div className={`room-divider ${unlockedRoom > door ? 'room-divider--open' : ''}`} style={{ left: (door + 1) * ROOM_WIDTH }} key={door}>
          <div className="room-door"><span>{unlockedRoom > door ? 'ОТКРЫТО' : 'НУЖЕН КЛЮЧ'}</span></div>
        </div>
      ))}
      <div className="floor-mist" />
    </div>
  );
}
