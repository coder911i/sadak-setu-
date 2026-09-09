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

    // LIVE mode: no fallback — failures must propagate
    logger.info(`[LIVE] Sending image to Python AI microservice at ${this.serviceUrl}/infer/image`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.ai.timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${this.serviceUrl}/infer/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl, latitude, longitude, chainage }),
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      const msg = `[LIVE] AI service unreachable at ${this.serviceUrl}: ${err.message}`;
      logger.error(msg);
      throw { statusCode: 503, message: msg, code: 'AI_SERVICE_UNAVAILABLE' };
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const msg = `[LIVE] AI service returned HTTP ${response.status}: ${body}`;
      logger.error(msg);
      throw { statusCode: 502, message: msg, code: 'AI_SERVICE_ERROR' };
    }

    return (await response.json()) as AiAnalysisResponse;
  }

  async analyzeVideo(mediaUrl: string, latitude?: number, longitude?: number): Promise<AiAnalysisResponse> {
    if (this.mode === 'mock') {
      logger.info('Running AI Video Analysis in MOCK mode', { mediaUrl });
      return AiMockEngine.analyzeVideo(mediaUrl, latitude, longitude);
    }

    // LIVE mode: no fallback
    logger.info(`[LIVE] Sending video to Python AI microservice at ${this.serviceUrl}/infer/video`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.ai.timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${this.serviceUrl}/infer/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl, latitude, longitude }),
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      const msg = `[LIVE] AI video service unreachable at ${this.serviceUrl}: ${err.message}`;
      logger.error(msg);
      throw { statusCode: 503, message: msg, code: 'AI_SERVICE_UNAVAILABLE' };
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const msg = `[LIVE] AI video service returned HTTP ${response.status}: ${body}`;
      logger.error(msg);
      throw { statusCode: 502, message: msg, code: 'AI_SERVICE_ERROR' };
    }

    return (await response.json()) as AiAnalysisResponse;
  }

  async verifyBeforeAfter(beforeUrl: string, afterUrl: string): Promise<AiVerificationResponse> {
    if (this.mode === 'mock') {
      logger.info('Running AI Before/After Verification in MOCK mode');
      return AiMockEngine.verifyBeforeAfter(beforeUrl, afterUrl);
    }

    // LIVE mode: no fallback
    logger.info(`[LIVE] Sending verification request to ${this.serviceUrl}/verify/before-after`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.ai.timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${this.serviceUrl}/verify/before-after`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beforeMediaUrl: beforeUrl, afterMediaUrl: afterUrl }),
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      const msg = `[LIVE] AI verification service unreachable at ${this.serviceUrl}: ${err.message}`;
      logger.error(msg);
      throw { statusCode: 503, message: msg, code: 'AI_SERVICE_UNAVAILABLE' };
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const msg = `[LIVE] AI verification service returned HTTP ${response.status}: ${body}`;
      logger.error(msg);
      throw { statusCode: 502, message: msg, code: 'AI_SERVICE_ERROR' };
    }

    return (await response.json()) as AiVerificationResponse;
  }
}

export const aiClient = new AiClient();
