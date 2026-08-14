import type { HealthParticleData } from '../../hooks/useHealthParticles';

export function HealthParticle({ particle }: { particle: HealthParticleData }) {
  return (
    <div className="health-particle" style={{ left: particle.x, top: `${particle.y}%` }}>
      <span>+</span>
    </div>
  );
}
