type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private format(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const sanitizedMeta = meta ? this.sanitize(meta) : undefined;
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(sanitizedMeta && { meta: sanitizedMeta }),
    });
  }

  private sanitize(data: any): any {
    if (!data || typeof data !== 'object') return data;
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'refreshToken', 'secret', 'apiKey', 'apiKeyHash'];
    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
    }
    return sanitized;
  }

  info(message: string, meta?: any) {
    console.log(this.format('info', message, meta));
  }

  warn(message: string, meta?: any) {
    console.warn(this.format('warn', message, meta));
  }

  error(message: string, meta?: any) {
    console.error(this.format('error', message, meta));
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('debug', message, meta));
    }
  }
}

export const logger = new Logger();
