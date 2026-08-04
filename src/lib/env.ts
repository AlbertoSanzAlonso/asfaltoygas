/** Lectura segura de variables de entorno (Node / Vercel) sin tipar `process` global. */
export function getEnv(name: string): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[name];
}
