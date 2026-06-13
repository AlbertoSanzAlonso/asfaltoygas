import React from 'react';

type SmokeParticle = {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  opacity: number;
  blur: number;
  kind: 'speck' | 'puff';
};

const seeded = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

const PARTICLES: SmokeParticle[] = Array.from({ length: 52 }, (_, i) => {
  const kind = seeded(i * 7.3) > 0.58 ? 'puff' : 'speck';
  return {
    id: i,
    left: seeded(i * 1.1) * 100,
    size: kind === 'puff' ? 16 + seeded(i * 2.3) * 32 : 3 + seeded(i * 2.3) * 6,
    delay: seeded(i * 3.7) * 10,
    duration: kind === 'puff' ? 4.5 + seeded(i * 4.1) * 3.5 : 2 + seeded(i * 4.1) * 2.5,
    drift: (seeded(i * 5.9) - 0.5) * (kind === 'puff' ? 70 : 35),
    opacity: kind === 'puff' ? 0.5 + seeded(i * 6.2) * 0.4 : 0.65 + seeded(i * 6.2) * 0.3,
    blur: kind === 'puff' ? 8 + seeded(i * 8.1) * 12 : 1 + seeded(i * 8.1) * 2,
    kind,
  };
});

export const HeroSmokeEffect: React.FC = () => (
  <div className="hero-smoke" aria-hidden="true">
    <div className="hero-smoke__emit" />
    {PARTICLES.map((p) => (
      <span
        key={p.id}
        className={`hero-smoke__particle hero-smoke__particle--${p.kind}`}
        style={
          {
            '--left': `${p.left}%`,
            '--size': `${p.size}px`,
            '--delay': `${p.delay}s`,
            '--duration': `${p.duration}s`,
            '--drift': `${p.drift}px`,
            '--opacity': p.opacity,
            '--blur': `${p.blur}px`,
          } as React.CSSProperties
        }
      />
    ))}
  </div>
);
