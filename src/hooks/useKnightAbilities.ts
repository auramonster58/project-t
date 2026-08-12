import { useCallback, useEffect, useRef, useState } from 'react';

export type AbilityName = 'damage' | 'heal' | 'owlSight';
export type AbilityCooldowns = Record<AbilityName, number>;

const COOLDOWN_MS = 90_000;
const OWL_SIGHT_MS = 3_000;
const EMPTY_COOLDOWNS: AbilityCooldowns = { damage: 0, heal: 0, owlSight: 0 };

export function useKnightAbilities(onHeal: () => void, canHeal: boolean) {
  const cooldownEnds = useRef<AbilityCooldowns>({ ...EMPTY_COOLDOWNS });
  const [cooldowns, setCooldowns] = useState<AbilityCooldowns>({ ...EMPTY_COOLDOWNS });
  const [damageBoosted, setDamageBoosted] = useState(false);
  const [owlSightActive, setOwlSightActive] = useState(false);
  const owlTimer = useRef<number>();

  const startCooldown = useCallback((ability: AbilityName) => {
    if (cooldownEnds.current[ability] > Date.now()) return false;
    cooldownEnds.current[ability] = Date.now() + COOLDOWN_MS;
    setCooldowns((current) => ({ ...current, [ability]: 90 }));
    return true;
  }, []);

  const activateDamage = useCallback(() => {
    if (damageBoosted || !startCooldown('damage')) return;
    setDamageBoosted(true);
  }, [damageBoosted, startCooldown]);

  const activateHeal = useCallback(() => {
    if (!canHeal || !startCooldown('heal')) return;
    onHeal();
  }, [canHeal, onHeal, startCooldown]);

  const activateOwlSight = useCallback(() => {
    if (!startCooldown('owlSight')) return;
    setOwlSightActive(true);
    window.clearTimeout(owlTimer.current);
    owlTimer.current = window.setTimeout(() => setOwlSightActive(false), OWL_SIGHT_MS);
  }, [startCooldown]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      setCooldowns({
        damage: Math.max(0, Math.ceil((cooldownEnds.current.damage - now) / 1000)),
        heal: Math.max(0, Math.ceil((cooldownEnds.current.heal - now) / 1000)),
        owlSight: Math.max(0, Math.ceil((cooldownEnds.current.owlSight - now) / 1000)),
      });
    }, 250);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(owlTimer.current);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code === 'Digit1') activateDamage();
      if (event.code === 'Digit2') activateHeal();
      if (event.code === 'Digit3') activateOwlSight();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activateDamage, activateHeal, activateOwlSight]);

  return {
    cooldowns,
    damageBoosted,
    owlSightActive,
    activateDamage,
    activateHeal,
    activateOwlSight,
    consumeDamageBoost: () => setDamageBoosted(false),
  };
}
