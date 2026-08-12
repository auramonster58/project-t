import { useCallback, useEffect, useState } from 'react';
import type { Weapon } from '../lib/gameCombat';

export function useWeaponSwitch() {
  const [weapon, setWeapon] = useState<Weapon>('sword');
  const switchWeapon = useCallback(() => {
    setWeapon((current) => current === 'sword' ? 'crossbow' : 'sword');
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyQ' || event.repeat) return;
      event.preventDefault();
      switchWeapon();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [switchWeapon]);

  return { weapon, switchWeapon };
}
