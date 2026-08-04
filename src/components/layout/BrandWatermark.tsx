import { type FC } from 'react';

/** Marca de agua fija del logo Team Asfalto y Gas, detrás del contenido. */
export const BrandWatermark: FC = () => (
  <div
    aria-hidden="true"
    className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none select-none"
  >
    <img
      src="/assets/logo/logo-team-asfaltoygas-bg.webp"
      alt=""
      decoding="async"
      className="w-[min(92vw,960px)] h-auto opacity-[0.10]"
    />
  </div>
);
