export const logger = {
  info: (message: string) => {
    process.stdout.write(`[INFO] ${message}\n`);
  },
  error: (message: string) => {
    process.stderr.write(`[ERROR] ${message}\n`);
  },
  fatal: (message: string) => {
    process.stderr.write(`[FATAL] ${message}\n`);
    process.exit(1);
  },
};
