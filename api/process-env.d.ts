/** Ambient para handlers Vercel: permite `process.env` sin @types/node. */
declare const process: {
  env: Record<string, string | undefined>;
};
