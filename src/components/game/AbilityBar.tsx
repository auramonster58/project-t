import type { AbilityCooldowns } from '../../hooks/useKnightAbilities';

type AbilityBarProps = {
  cooldowns: AbilityCooldowns;
  damageBoosted: boolean;
  owlSightActive: boolean;
  canHeal: boolean;
  onDamage: () => void;
  onHeal: () => void;
  onOwlSight: () => void;
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
  return (
    <div className="ability-bar" aria-label="Способности рыцаря">
      <AbilityButton icon="⚔" hotkey={1} label="Урон ×2" cooldown={props.cooldowns.damage}
        active={props.damageBoosted} onUse={props.onDamage} />
      <AbilityButton icon="♥" hotkey={2} label="Лечение" cooldown={props.cooldowns.heal}
        active={false} disabled={!props.canHeal} onUse={props.onHeal} />
      <AbilityButton icon="◉" hotkey={3} label="Зрение совы" cooldown={props.cooldowns.owlSight}
        active={props.owlSightActive} onUse={props.onOwlSight} />
    </div>
  );
}
