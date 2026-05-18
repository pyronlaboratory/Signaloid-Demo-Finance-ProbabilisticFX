import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { Logger } from './logger';

/**
 * Interfaces for API Type Safety
 */
export interface ConversionParams {
  amount: number;
  minRate: number;
  maxRate: number;
}

export interface SignaloidResult {
  mean: number;
  samples: number[];
  uxString: string;
}

interface BuildResponse {
  BuildID: string;
}

interface TaskResponse {
  TaskID: string;
}

interface StatusResponse {
  Status: string;
}

interface TaskOutputResponse {
  Stdout: string;
  Stderr: string;
}

interface SamplesResponse {
  Samples: number[];
  Count: number;
}

/**
 * Service responsible for managing the execution lifecycle of probabilistic
 * computing workloads.
 *
 * Provides an asynchronous pipeline interface to compile, execute, and extract
 * stochastic data distributions from the Signaloid Cloud platform.
 */
@Injectable({
  providedIn: 'root',
})
export class Signaloid {
  /**
   * For local development, paste the Signaloid API key here as a plain string.
   *
   * For production, route API calls through a serverless proxy and store the key
   * in the platform's environment variables so it never reaches the browser bundle.
   * @See Deployment notes in the README for details.
   */
  private readonly API_KEY = '';
  private runtimeBuildId: string | null = null;

  constructor(
    private http: HttpClient,
    private logger: Logger,
  ) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: this.API_KEY,
      'Content-Type': 'application/json',
    });
  }

  async execute(params: ConversionParams): Promise<SignaloidResult> {
    const { amount, minRate, maxRate } = params;
    try {
      this.logger.log('Signaloid Execution Started');
      const apiBase = environment.signaloidApiBase;

      // Lookup build
      const buildId = await this.getBuildId(apiBase);

      // Execute the task
      const taskId = await this.submitTask(apiBase, buildId, `${amount} ${minRate} ${maxRate}`);
      await this.pollStatus(`${apiBase}/tasks/${taskId}`, 'Task');

      // Get the results
      const stdout = await this.getTaskStdout(apiBase, taskId);
      const { mean, uxString } = this.extractUxStringValues(stdout);
      this.logger.log('Raw Stdout:', stdout);
      this.logger.log('Decoded Value:', mean);
      this.logger.log('Ux String:', uxString);

      // Sampling
      const samples = await this.getSamples(apiBase, uxString);
      this.logger.log(`Samples Received: ${samples.length}`);
      this.logger.log('Signaloid Execution Completed');

      return { mean, samples, uxString };
    } catch (error) {
      this.logger.error('Signaloid Pipeline Failed:', error);
      throw error;
    }
  }

  private async submitBuild(apiBase: string, applicationCode: string): Promise<string> {
    const body = { Code: applicationCode, Language: 'C++' };
    const res: any = await firstValueFrom(
      this.http.post<BuildResponse>(`${apiBase}/sourcecode/builds`, body, {
        headers: this.headers,
      }),
    );
    return res.BuildID;
  }

  private async submitTask(apiBase: string, buildId: string, args: string): Promise<string> {
    const body = { Arguments: args };
    const res: any = await firstValueFrom(
      this.http.post<TaskResponse>(`${apiBase}/builds/${buildId}/tasks`, body, {
        headers: this.headers,
      }),
    );
    return res.TaskID;
  }

  private async pollStatus(url: string, label: string): Promise<void> {
    const terminalStates = ['Completed', 'Cancelled', 'Stopped'];
    let status = 'Pending';
    let retryCount = 0;

    while (!terminalStates.includes(status)) {
      const delay = Math.min(Math.pow(2, retryCount) * 1000, 5000);
      await firstValueFrom(timer(delay));

      const res: any = await firstValueFrom(
        this.http.get<StatusResponse>(url, { headers: this.headers }),
      );

      status = res.Status;
      this.logger.log(`[Polling ${label}] Status: ${status} (Next check in ${delay}ms)`);

      retryCount++;

      if (status === 'Cancelled' || status === 'Stopped') {
        throw new Error(`Signaloid process ended prematurely: ${status}`);
      }
    }
  }

  private async getBuildId(apiBase: string): Promise<string> {
    // Using static build
    if (!environment.ephemeral) {
      this.logger.log(`Using static build: ${environment.signaloidBuildId}`);
      return environment.signaloidBuildId;
    }

    // Ephemeral runtime mode (cached)
    if (this.runtimeBuildId) {
      this.logger.log(`Using cached runtime build: ${this.runtimeBuildId}`);
      return this.runtimeBuildId;
    }

    // Ephemeral runtime mode (first-time compilation)
    this.logger.log('Ephemeral mode active. Compiling C++ source...');

    const sourceCode = await firstValueFrom(
      this.http.get('compute/main.cpp', { responseType: 'text' }),
    );

    this.runtimeBuildId = await this.submitBuild(apiBase, sourceCode);
    await this.pollStatus(`${apiBase}/builds/${this.runtimeBuildId}`, 'Build');

    return this.runtimeBuildId;
  }

  private async getTaskStdout(apiBase: string, taskId: string): Promise<string> {
    const res = await firstValueFrom(
      this.http.get<TaskOutputResponse>(`${apiBase}/tasks/${taskId}/outputs`, {
        headers: this.headers,
      }),
    );
    return firstValueFrom(this.http.get(res.Stdout, { responseType: 'text' }));
  }

  private async getSamples(
    apiBase: string,
    uxString: string,
    count: number = 1000,
  ): Promise<number[]> {
    const res = await firstValueFrom(
      this.http.post<SamplesResponse>(
        `${apiBase}/samples`,
        { payload: uxString },
        { headers: this.headers, params: { count: count.toString() } },
      ),
    );
    return res.Samples;
  }

  private extractUxStringValues(stdout: string): { mean: number; uxString: string } {
    const regex = /([-+]?(?:\d+\.\d*|\.\d+)(?:[eE][-+]?\d+)?)(Ux[0-9a-fA-F]{40,})/g;
    let match;
    let lastMatch;

    // We loop to find the last occurrence in case multiple values were printed
    while ((match = regex.exec(stdout)) !== null) {
      lastMatch = match;
    }

    if (!lastMatch) throw new Error('No valid Ux distribution found in stdout.');

    return {
      mean: parseFloat(lastMatch[1]),
      uxString: lastMatch[2],
    };
  }
}
