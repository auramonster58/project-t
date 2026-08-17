import { useEffect, useState } from 'react';

function calculateScale() {
  if (typeof window === 'undefined') return 1;
  const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 700;
  if (!isMobile) return 1;
  return window.innerWidth > window.innerHeight ? 0.58 : 0.66;
}

export function useGameViewScale() {
  const [scale, setScale] = useState(calculateScale);

  useEffect(() => {
    const update = () => setScale(calculateScale());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return scale;
}
