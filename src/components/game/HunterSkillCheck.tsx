import type { HunterSkillState } from '../../hooks/useHunterSkillCheck';

type HunterSkillCheckProps = { state: HunterSkillState; onBegin: () => void };

export function HunterSkillCheck({ state, onBegin }: HunterSkillCheckProps) {
  if (state.tutorial) {
    return (
      <section className="hunter-tutorial" aria-label="Обучение скиллчеку">
        <small>ПЕРЕД ПЕРВЫМ ИСПЫТАНИЕМ</small>
        <strong>НЕ ВЫДАВАЙ СЕБЯ</strong>
        <p>Шары появляются в разных местах. Жди, пока шар станет <b>жёлтым</b> и над ним появится <b>!</b>.</p>
        <p>Только тогда нажми клавишу <kbd>A</kbd>. Спамить нельзя: промах заставит охотника посмотреть на шкаф.</p>
        <button onClick={onBegin}><kbd>A</kbd> ПОНЯТНО</button>
      </section>
    );
  }

  const isReady = state.target.phase === 'ready';
  return (
    <section className={`hunter-skill-check ${state.hunterLooking ? 'hunter-skill-check--danger' : ''}`}
      aria-label="Испытание в шкафу">
      <header><strong>НЕ ШЕВЕЛИСЬ</strong><span>Успех {state.hits}/4 · Ошибки {state.misses}/2</span></header>
      <div className="hunter-target-area">
        <i className={`hunter-target ${isReady ? 'hunter-target--ready' : ''}`}
          style={{ left: `${state.target.x}%`, top: `${state.target.y}%` }}>
          {isReady && <b>!</b>}
        </i>
      </div>
      <footer><kbd>A</kbd> нажми, только когда шар жёлтый и горит <b>!</b></footer>
    </section>
  );
}
