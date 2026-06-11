import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  align?: 'left' | 'center';
  light?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  align = 'center',
  light = false,
}) => (
  <div className={`mb-10 md:mb-14 ${align === 'center' ? 'text-center' : 'text-left'}`}>
    {eyebrow && (
      <span className={`font-display text-xs font-bold tracking-[0.35em] uppercase mb-3 block ${light ? 'text-primary' : 'text-primary'}`}>
        {eyebrow}
      </span>
    )}
    <h2 className={`font-display text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-wide ${light ? 'text-white' : 'text-secondary'}`}>
      {title}
    </h2>
    <div className={`mt-4 h-1 w-16 bg-primary ${align === 'center' ? 'mx-auto' : ''}`} />
  </div>
);
