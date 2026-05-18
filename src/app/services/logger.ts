import { Injectable, isDevMode } from '@angular/core';

enum LogLevel {
  DEBUG = 0,
  WARN = 1,
  ERROR = 2,
}

/**
 * Global application logger that handles message filtering based on the environment.
 *
 * In development mode (isDevMode() = true), all log levels (DEBUG, WARN, ERROR) are active.
 * In production mode, verbose outputs are silenced, restricting console emission exclusively
 * to errors.
 */
@Injectable({
  providedIn: 'root',
})
export class Logger {
  private readonly _verbosity: LogLevel = isDevMode() ? LogLevel.DEBUG : LogLevel.ERROR;

  log(message: any, ...args: any[]) {
    if (this._verbosity <= LogLevel.DEBUG) {
      console.log(`[DEBUG]:`, message, ...args);
    }
  }

  warn(message: any, ...args: any[]) {
    if (this._verbosity <= LogLevel.WARN) {
      console.warn(`[WARN]:`, message, ...args);
    }
  }

  error(message: any, ...args: any[]) {
    if (this._verbosity <= LogLevel.ERROR) {
      console.error(`[ERROR]:`, message, ...args);
    }
  }
}
