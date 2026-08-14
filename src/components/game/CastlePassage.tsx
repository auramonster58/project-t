import { PassageAftermath } from './PassageAftermath';

type CastlePassageProps = {
  room: number;
  showAftermath: boolean;
  guardsReleased: boolean;
};

export function CastlePassage({ room, showAftermath, guardsReleased }: CastlePassageProps) {
  return (
    <div className={`castle-passage castle-passage--${room % 3}`}>
      <i className="passage-solid-wall passage-solid-wall--top" />
      <i className="passage-runner" />
      <i className="passage-solid-wall passage-solid-wall--bottom" />
      <i className="passage-entry-wall"><span>ПЕРЕХОДНАЯ<br />КОМНАТА</span></i>
      {room === 2 && showAftermath && <PassageAftermath guardsReleased={guardsReleased} />}
    </div>
  );
}
