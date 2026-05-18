// Partially generated using AI assistance.
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger } from './logger';

describe('Logger', () => {
  let service: Logger;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should create the service instance when in development mode', () => {
    vi.stubGlobal('ngDevMode', true);

    TestBed.configureTestingModule({});
    service = TestBed.inject(Logger);

    expect(service).toBeTruthy();
  });

  it('should print debug messages to console log when in development mode', () => {
    vi.stubGlobal('ngDevMode', true);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    TestBed.configureTestingModule({});
    service = TestBed.inject(Logger);

    service.log('Session started', { userId: 42 });

    expect(consoleSpy).toHaveBeenCalledWith('[DEBUG]:', 'Session started', { userId: 42 });
  });

  it('should suppress debug and warning logs when in production mode', () => {
    vi.stubGlobal('ngDevMode', false);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    TestBed.configureTestingModule({});
    service = TestBed.inject(Logger);

    service.log('Hidden debug message');
    service.warn('Hidden warning message');

    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should always print error messages regardless of environment mode', () => {
    vi.stubGlobal('ngDevMode', false);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    TestBed.configureTestingModule({});
    service = TestBed.inject(Logger);

    service.error('Critical database connection failure');

    expect(errorSpy).toHaveBeenCalledWith('[ERROR]:', 'Critical database connection failure');
  });
});
