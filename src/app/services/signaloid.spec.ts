// Partially generated using AI assistance.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as rxjs from 'rxjs';
import { Signaloid } from './signaloid';
import { environment } from '../../environments/environment';

describe('Signaloid', () => {
  let service: Signaloid;
  let httpMock: HttpTestingController;
  const mockApiBase = 'https://api.signaloid.com';

  beforeEach(() => {
    vi.stubGlobal('ngDevMode', false);

    // Fast-forward RxJS timer loops instantly so they don't leak out of the test context
    vi.spyOn(rxjs, 'timer').mockReturnValue(rxjs.of(0));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    TestBed.configureTestingModule({
      providers: [Signaloid, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(Signaloid);
    httpMock = TestBed.inject(HttpTestingController);

    environment.signaloidApiBase = mockApiBase;
  });

  afterEach(() => {
    if (httpMock) {
      httpMock.verify();
    }
    vi.restoreAllMocks();
  });

  it('should create the service instance', () => {
    expect(service).toBeTruthy();
  });

  it('should execute the full non-ephemeral pipeline successfully', async () => {
    environment.ephemeral = false;
    environment.signaloidBuildId = 'static-build-123';

    const params = { amount: 100, minRate: 1.1, maxRate: 1.3 };
    const executionPromise = service.execute(params);

    await vi.waitFor(() => {
      const taskReq = httpMock.expectOne(`${mockApiBase}/builds/static-build-123/tasks`);
      expect(taskReq.request.method).toBe('POST');
      expect(taskReq.request.body).toEqual({ Arguments: '100 1.1 1.3' });
      taskReq.flush({ TaskID: 'task-abc' });
    });

    await vi.waitFor(() => {
      const statusReq = httpMock.expectOne(`${mockApiBase}/tasks/task-abc`);
      expect(statusReq.request.method).toBe('GET');
      statusReq.flush({ Status: 'Completed' });
    });

    await vi.waitFor(() => {
      const outputUrlReq = httpMock.expectOne(`${mockApiBase}/tasks/task-abc/outputs`);
      expect(outputUrlReq.request.method).toBe('GET');
      outputUrlReq.flush({ Stdout: 'https://storage.signaloid.com/stdout.txt' });
    });

    await vi.waitFor(() => {
      const rawStdoutReq = httpMock.expectOne('https://storage.signaloid.com/stdout.txt');
      expect(rawStdoutReq.request.method).toBe('GET');
      rawStdoutReq.flush('Calculated mean: 120.50Ux1234567890abcdef1234567890abcdef12345678');
    });

    await vi.waitFor(() => {
      const samplesReq = httpMock.expectOne((req) => req.url === `${mockApiBase}/samples`);
      expect(samplesReq.request.method).toBe('POST');
      expect(samplesReq.request.body).toEqual({
        payload: 'Ux1234567890abcdef1234567890abcdef12345678',
      });
      samplesReq.flush({ Samples: [119.2, 120.5, 121.8], Count: 3 });
    });

    const result = await executionPromise;

    expect(result.mean).toBe(120.5);
    expect(result.uxString).toBe('Ux1234567890abcdef1234567890abcdef12345678');
    expect(result.samples).toEqual([119.2, 120.5, 121.8]);
  });

  it('should compile source code first when configured in ephemeral mode', async () => {
    environment.ephemeral = true;

    const params = { amount: 50, minRate: 1.0, maxRate: 1.0 };
    const executionPromise = service.execute(params);

    await vi.waitFor(() => {
      const sourceReq = httpMock.expectOne('compute/main.cpp');
      expect(sourceReq.request.method).toBe('GET');
      sourceReq.flush('int main() { return 0; }');
    });

    await vi.waitFor(() => {
      const buildReq = httpMock.expectOne(`${mockApiBase}/sourcecode/builds`);
      expect(buildReq.request.method).toBe('POST');
      buildReq.flush({ BuildID: 'ephemeral-build-999' });
    });

    await vi.waitFor(() => {
      const buildStatusReq = httpMock.expectOne(`${mockApiBase}/builds/ephemeral-build-999`);
      expect(buildStatusReq.request.method).toBe('GET');
      buildStatusReq.flush({ Status: 'Completed' });
    });

    await vi.waitFor(() => {
      const taskReq = httpMock.expectOne(`${mockApiBase}/builds/ephemeral-build-999/tasks`);
      taskReq.flush({ TaskID: 'task-xyz' });
    });

    await vi.waitFor(() => {
      httpMock.expectOne(`${mockApiBase}/tasks/task-xyz`).flush({ Status: 'Completed' });
    });

    await vi.waitFor(() => {
      httpMock.expectOne(`${mockApiBase}/tasks/task-xyz/outputs`).flush({ Stdout: 'http://out' });
    });

    await vi.waitFor(() => {
      httpMock.expectOne('http://out').flush('1.0Uxabcdefabcdefabcdefabcdefabcdefabcdefabcdef');
    });

    await vi.waitFor(() => {
      httpMock.expectOne((req) => req.url === `${mockApiBase}/samples`).flush({ Samples: [1.0] });
    });

    await executionPromise;
  });

  it('should reject execution and throw when a polled process resolves to a failure state', async () => {
    environment.ephemeral = false;
    environment.signaloidBuildId = 'static-build-123';

    const params = { amount: 10, minRate: 2.0, maxRate: 3.0 };
    const executionPromise = service.execute(params);

    await vi.waitFor(() => {
      const taskReq = httpMock.expectOne(`${mockApiBase}/builds/static-build-123/tasks`);
      taskReq.flush({ TaskID: 'failed-task' });
    });

    await vi.waitFor(() => {
      const statusReq = httpMock.expectOne(`${mockApiBase}/tasks/failed-task`);
      statusReq.flush({ Status: 'Cancelled' });
    });

    await expect(executionPromise).rejects.toThrow(
      'Signaloid process ended prematurely: Cancelled',
    );
  });

  it('should throw an explicit parsing error when stdout lacks a valid Ux tracking key', async () => {
    environment.ephemeral = false;
    environment.signaloidBuildId = 'static-build-123';

    const params = { amount: 10, minRate: 2.0, maxRate: 3.0 };
    const executionPromise = service.execute(params);

    await vi.waitFor(() => {
      httpMock
        .expectOne(`${mockApiBase}/builds/static-build-123/tasks`)
        .flush({ TaskID: 'bad-output-task' });
    });

    await vi.waitFor(() => {
      httpMock.expectOne(`${mockApiBase}/tasks/bad-output-task`).flush({ Status: 'Completed' });
    });

    await vi.waitFor(() => {
      httpMock
        .expectOne(`${mockApiBase}/tasks/bad-output-task/outputs`)
        .flush({ Stdout: 'http://bad-out' });
    });

    await vi.waitFor(() => {
      httpMock
        .expectOne('http://bad-out')
        .flush('Plain standard layout without distribution hashes');
    });

    await expect(executionPromise).rejects.toThrow('No valid Ux distribution found in stdout.');
  });
});
