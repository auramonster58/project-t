import type { Weapon } from '../../lib/gameCombat';

type WeaponSwitchProps = { weapon: Weapon; onSwitch: () => void };

export function WeaponSwitch({ weapon, onSwitch }: WeaponSwitchProps) {
  const isSword = weapon === 'sword';
  return (
    <button className="weapon-switch" onClick={onSwitch} aria-label="Сменить оружие">
      <b>Q</b><span>{isSword ? '⚔ МЕЧ' : '🏹 АРБАЛЕТ'}</span>
    </button>
  );
}
