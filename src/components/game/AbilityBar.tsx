import type { AbilityCooldowns } from '../../hooks/useKnightAbilities';
import type { Weapon } from '../../lib/gameCombat';

type AbilityBarProps = {
  cooldowns: AbilityCooldowns;
  weapon: Weapon;
  rageActive: boolean;
  autoAimActive: boolean;
  healingActive: boolean;
  owlSightActive: boolean;
  hermesActive: boolean;
  canHeal: boolean;
  onPrimary: () => void;
  onHeal: () => void;
  onUtility: () => void;
};

type AbilityButtonProps = {
  icon: string;
  hotkey: number;
  label: string;
  cooldown: number;
  active: boolean;
  disabled?: boolean;
  onUse: () => void;
};

function AbilityButton({ icon, hotkey, label, cooldown, active, disabled = false, onUse }: AbilityButtonProps) {
  const unavailable = disabled || (cooldown > 0 && !active);
  return (
    <button className={`ability-button ${active ? 'ability-button--active' : ''}`} disabled={unavailable} onClick={onUse}>
      <span className="ability-hotkey">{hotkey}</span>
      <span className="ability-icon">{icon}</span>
      <span className="ability-label">{label}</span>
      {cooldown > 0 && !active && <span className="ability-cooldown">{cooldown}</span>}
    </button>
  );
}

export function AbilityBar(props: AbilityBarProps) {
  const isSword = props.weapon === 'sword';
  return (
    <div className="ability-bar" aria-label="Способности рыцаря">
      <AbilityButton icon={isSword ? '⚔' : '◎'} hotkey={1} label={isSword ? 'Ярость' : 'Автоаим'}
        cooldown={props.cooldowns.primary} active={isSword ? props.rageActive : props.autoAimActive} onUse={props.onPrimary} />
      <AbilityButton icon="♥" hotkey={2} label="Лечение" cooldown={props.cooldowns.heal}
        active={props.healingActive} disabled={!props.canHeal} onUse={props.onHeal} />
      <AbilityButton icon={isSword ? '◉' : '➶'} hotkey={3} label={isSword ? 'Зрение совы' : 'Гермес'}
        cooldown={props.cooldowns.utility} active={isSword ? props.owlSightActive : props.hermesActive} onUse={props.onUtility} />
    </div>
  );
}
