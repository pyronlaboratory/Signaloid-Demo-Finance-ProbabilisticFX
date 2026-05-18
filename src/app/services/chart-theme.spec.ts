// Partially generated using AI assistance.
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChartThemeService } from './chart-theme';

describe('ChartThemeService', () => {
  let service: ChartThemeService;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should create the service instance', () => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartThemeService);

    expect(service).toBeTruthy();
  });

  it('should read and map css properties from the document root style context', () => {
    const mockStyle = {
      getPropertyValue: vi.fn().mockImplementation((prop: string) => {
        switch (prop) {
          case '--primary':
            return '#0070f3 ';
          case '--accent':
            return ' #ff0070';
          case '--divider':
            return '#eaeaea';
          case '--text-primary':
            return '#000000';
          case '--text-accent':
            return '#ffffff';
          case '--text-secondary':
            return '#666666';
          case '--text-muted':
            return '#888888';
          case '--plot-lines':
            return '#cccccc';
          default:
            return '';
        }
      }),
    } as unknown as CSSStyleDeclaration;

    vi.spyOn(window, 'getComputedStyle').mockReturnValue(mockStyle);

    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartThemeService);

    const activeTheme = service.theme();

    expect(activeTheme.primary).toBe('#0070f3');
    expect(activeTheme.accent).toBe('#ff0070');
    expect(activeTheme.plotLines).toBe('#cccccc');
    expect(mockStyle.getPropertyValue).toHaveBeenCalledWith('--primary');
  });

  it('should handle missing css variable declarations gracefully with empty strings', () => {
    const mockStyle = {
      getPropertyValue: vi.fn().mockReturnValue(''),
    } as unknown as CSSStyleDeclaration;

    vi.spyOn(window, 'getComputedStyle').mockReturnValue(mockStyle);

    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartThemeService);

    const activeTheme = service.theme();

    expect(activeTheme.primary).toBe('');
    expect(activeTheme.accent).toBe('');
    expect(activeTheme.textPrimary).toBe('');
  });
});
