/** Lectura segura de env en handlers API (sin tipar `process` global). */
export function getEnv(name: string): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[name];
}
