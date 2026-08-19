import type { BranchRoute } from '../../lib/gameSave';

type CastleForkProps = { onChoose: (route: BranchRoute) => void };

export function CastleFork({ onChoose }: CastleForkProps) {
  return (
    <aside className="castle-fork" aria-label="Выбор пути">
      <strong>ТРИ ДОРОГИ ВЕДУТ ВО ТЬМУ</strong>
      <span>Выбери путь. Назад дороги не будет.</span>
      <div>
        <button onClick={() => onChoose('up')}>↑ ВЕРХНИЙ ПУТЬ</button>
        <button onClick={() => onChoose('middle')}>→ СРЕДНИЙ ПУТЬ</button>
        <button onClick={() => onChoose('down')}>↓ НИЖНИЙ ПУТЬ</button>
      </div>
    </aside>
  );
}
