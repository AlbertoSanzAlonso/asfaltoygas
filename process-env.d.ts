/**
 * Declaración mínima de `process` para builds Vercel/TS sin depender
 * de que @types/node se resuelva en todos los tsconfig.
 */
declare const process: {
  env: Record<string, string | undefined>;
};
