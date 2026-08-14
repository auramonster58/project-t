import { useCallback, useEffect, useRef, useState } from 'react';
import type { Weapon } from '../lib/gameCombat';

export type AbilitySlot = 'primary' | 'heal' | 'utility';
export type AbilityCooldowns = Record<AbilitySlot, number>;

const EMPTY_COOLDOWNS: AbilityCooldowns = { primary: 0, heal: 0, utility: 0 };
const DURATIONS = { rage: 7_000, autoAim: 4_000, owlSight: 3_000, hermes: 10_000 };

export function useKnightAbilities(weapon: Weapon, onHeal: () => void, canHeal: boolean) {
  const cooldownEnds = useRef<AbilityCooldowns>({ ...EMPTY_COOLDOWNS });
  const [cooldowns, setCooldowns] = useState<AbilityCooldowns>({ ...EMPTY_COOLDOWNS });
  const [rageActive, setRageActive] = useState(false);
  const [autoAimActive, setAutoAimActive] = useState(false);
  const [healingActive, setHealingActive] = useState(false);
  const [owlSightActive, setOwlSightActive] = useState(false);
  const [hermesActive, setHermesActive] = useState(false);
  const primaryTimer = useRef<number>();
  const healTimer = useRef<number>();
  const utilityTimer = useRef<number>();

  const startCooldown = useCallback((slot: AbilitySlot, seconds: number) => {
    if (cooldownEnds.current[slot] > Date.now()) return false;
    cooldownEnds.current[slot] = Date.now() + seconds * 1000;
    setCooldowns((current) => ({ ...current, [slot]: seconds }));
    return true;
  }, []);

  const activatePrimary = useCallback(() => {
    const isSword = weapon === 'sword';
    if (!startCooldown('primary', isSword ? 90 : 60)) return;
    if (isSword) setRageActive(true); else setAutoAimActive(true);
    window.clearTimeout(primaryTimer.current);
    primaryTimer.current = window.setTimeout(() => {
      setRageActive(false); setAutoAimActive(false);
    }, isSword ? DURATIONS.rage : DURATIONS.autoAim);
  }, [startCooldown, weapon]);

  const activateHeal = useCallback(() => {
    if (!canHeal || !startCooldown('heal', 70)) return;
    setHealingActive(true);
    let ticks = 0;
    window.clearInterval(healTimer.current);
    healTimer.current = window.setInterval(() => {
      onHeal(); ticks += 1;
      if (ticks < 5) return;
      window.clearInterval(healTimer.current); setHealingActive(false);
    }, 800);
  }, [canHeal, onHeal, startCooldown]);

  const activateUtility = useCallback(() => {
    const isSword = weapon === 'sword';
    if (!startCooldown('utility', isSword ? 90 : 120)) return;
    if (isSword) setOwlSightActive(true); else setHermesActive(true);
    window.clearTimeout(utilityTimer.current);
    utilityTimer.current = window.setTimeout(() => {
      setOwlSightActive(false); setHermesActive(false);
    }, isSword ? DURATIONS.owlSight : DURATIONS.hermes);
  }, [startCooldown, weapon]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      setCooldowns({
        primary: Math.max(0, Math.ceil((cooldownEnds.current.primary - now) / 1000)),
        heal: Math.max(0, Math.ceil((cooldownEnds.current.heal - now) / 1000)),
        utility: Math.max(0, Math.ceil((cooldownEnds.current.utility - now) / 1000)),
      });
    }, 250);
    return () => {
      window.clearInterval(timer); window.clearTimeout(primaryTimer.current);
      window.clearInterval(healTimer.current); window.clearTimeout(utilityTimer.current);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code === 'Digit1') activatePrimary();
      if (event.code === 'Digit2') activateHeal();
      if (event.code === 'Digit3') activateUtility();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activateHeal, activatePrimary, activateUtility]);

  return { cooldowns, rageActive, autoAimActive, healingActive, owlSightActive, hermesActive,
    activatePrimary, activateHeal, activateUtility };
}
