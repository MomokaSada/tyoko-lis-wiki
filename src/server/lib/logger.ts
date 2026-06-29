const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  warn: (...args: unknown[]) => {
    if (!isProduction) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
  info: (...args: unknown[]) => {
    if (!isProduction) {
      console.log(...args);
    }
  },
};
