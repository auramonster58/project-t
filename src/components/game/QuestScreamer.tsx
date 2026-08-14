import { ScreamerEffects } from './ScreamerEffects';

export function QuestScreamer() {
  return (
    <div className="quest-screamer" role="alert">
      <ScreamerEffects />
      <figure className="quest-screamer__face">
        <i className="quest-screamer__eye quest-screamer__eye--left"><b /></i>
        <i className="quest-screamer__eye quest-screamer__eye--right"><b /></i>
        <span className="quest-screamer__mouth"><b /><b /><b /><b /><b /><b /><b /></span>
      </figure>
      <strong>НЕ ОГЛЯДЫВАЙСЯ</strong>
      <small>КЛЮЧ БЫЛ ПРИМАНКОЙ</small>
    </div>
  );
}
