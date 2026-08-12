import { ROOM_COUNT, ROOM_WIDTH } from '../../lib/gameData';

type CastleSceneProps = { unlockedRoom: number };

export function CastleScene({ unlockedRoom }: CastleSceneProps) {
  return (
    <div className="castle-interior" aria-hidden="true">
      <div className="stone-floor" />
      <div className="hall-wall hall-wall--top" />
      <div className="hall-wall hall-wall--bottom" />
      {Array.from({ length: ROOM_COUNT }, (_, room) => (
        <div className={`castle-room castle-room--${room + 1}`} style={{ left: room * ROOM_WIDTH }} key={room}>
          <span className="room-title">{room === ROOM_COUNT - 1 ? 'КРУГ СУДЬБЫ' : `ЗАЛ ${room + 1}`}</span>
          <i className="room-pillar pillar-a" /><i className="room-pillar pillar-b" />
          <i className="room-torch torch-a" /><i className="room-torch torch-b" />
          {room > unlockedRoom && <span className="room-darkness" />}
        </div>
      ))}
      {Array.from({ length: ROOM_COUNT - 1 }, (_, door) => (
        <div className={`room-door ${unlockedRoom > door ? 'room-door--open' : ''}`} style={{ left: (door + 1) * ROOM_WIDTH }} key={door}>
          <span>{unlockedRoom > door ? 'ОТКРЫТО' : 'НУЖЕН КЛЮЧ'}</span>
        </div>
      ))}
      <div className="floor-mist" />
    </div>
  );
}
