import pino from 'pino';

export const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'production'
      ? undefined
      : { target: 'pino/file', options: { destination: 1 } },
});

export type Level = 'info' | 'warn' | 'error' | 'debug';

// Platform-level console log (per-tenant logs are written via TenantDB.log()).
export function clog(level: Level, scope: string, message: string, meta?: unknown): void {
  pinoLogger[level]({ scope, meta }, message);
}
