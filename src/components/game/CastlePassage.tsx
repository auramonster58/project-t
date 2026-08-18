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
      <i className="passage-doorway passage-doorway--entry"><b /><b /></i>
      <i className="passage-doorway passage-doorway--exit"><b /><b /></i>
      {room === 2 && showAftermath && <PassageAftermath guardsReleased={guardsReleased} />}
    </div>
  );
}
