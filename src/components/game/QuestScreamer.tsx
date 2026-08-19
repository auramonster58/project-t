export function QuestScreamer() {
  return (
    <div className="skeleton-devour" role="alert">
      <span className="skeleton-devour__noise" aria-hidden="true" />
      <div className="skeleton-devour__beast">
        <img className="skeleton-devour__beast-image" src="/assets/skeleton-mouth-screamer.png" alt="" />
      </div>
      <span className="skeleton-devour__camera" aria-hidden="true" />
      <span className="skeleton-devour__bite" aria-hidden="true" />
      <strong>НЕ ОГЛЯДЫВАЙСЯ</strong>
    </div>
  );
}
