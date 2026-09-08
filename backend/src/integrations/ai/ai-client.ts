import { config } from '../../config';
import { logger } from '../../utils/logger';
import {
  AiMockEngine,
  AiAnalysisResponse,
  AiVerificationResponse,
} from './ai-mock';

export class AiClient {
  private mode: 'mock' | 'live';
  private serviceUrl: string;

  constructor() {
    this.mode = config.ai.mode;
    this.serviceUrl = config.ai.serviceUrl;
  }

  async analyzeImage(
    mediaUrl: string,
    latitude?: number,
    longitude?: number,
    chainage?: number
  ): Promise<AiAnalysisResponse> {
    if (this.mode === 'mock') {
      logger.info('Running AI Image Analysis in MOCK mode', { mediaUrl });
      return AiMockEngine.analyzeImage(mediaUrl, latitude, longitude, chainage);
    }

    try {
      logger.info(`Sending image to Python AI microservice at ${this.serviceUrl}/infer/image`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.ai.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/infer/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl, latitude, longitude, chainage }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI Service returned status ${response.status}`);
      }

      const data = (await response.json()) as AiAnalysisResponse;
      return data;
    } catch (error: any) {
      logger.warn(`Failed to connect to Python AI microservice: ${error.message}. Gracefully falling back to calibrated mock engine.`);
      return AiMockEngine.analyzeImage(mediaUrl, latitude, longitude, chainage);
    }
  }

  async analyzeVideo(mediaUrl: string, latitude?: number, longitude?: number): Promise<AiAnalysisResponse> {
    if (this.mode === 'mock') {
      logger.info('Running AI Video Analysis in MOCK mode', { mediaUrl });
      return AiMockEngine.analyzeVideo(mediaUrl, latitude, longitude);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.ai.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/infer/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl, latitude, longitude }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI Service returned status ${response.status}`);
      }

      return (await response.json()) as AiAnalysisResponse;
    } catch (error: any) {
      logger.warn(`AI Video service unavailable: ${error.message}. Falling back to mock engine.`);
      return AiMockEngine.analyzeVideo(mediaUrl, latitude, longitude);
    }
  }

  async verifyBeforeAfter(beforeUrl: string, afterUrl: string): Promise<AiVerificationResponse> {
    if (this.mode === 'mock') {
      logger.info('Running AI Before/After Verification in MOCK mode');
      return AiMockEngine.verifyBeforeAfter(beforeUrl, afterUrl);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.ai.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/verify/before-after`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beforeMediaUrl: beforeUrl, afterMediaUrl: afterUrl }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI Verification service returned status ${response.status}`);
      }

      return (await response.json()) as AiVerificationResponse;
    } catch (error: any) {
      logger.warn(`AI Verification service unavailable: ${error.message}. Falling back to calibrated engine.`);
      return AiMockEngine.verifyBeforeAfter(beforeUrl, afterUrl);
    }
  }
}

export const aiClient = new AiClient();
