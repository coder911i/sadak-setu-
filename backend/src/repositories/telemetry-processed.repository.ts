import { prisma } from '../config/database';
import { TelemetryProcessed, Prisma } from '@prisma/client';

export class TelemetryProcessedRepository {
  async create(data: Prisma.TelemetryProcessedCreateInput): Promise<TelemetryProcessed> {
    return prisma.telemetryProcessed.create({ data });
  }

  async findManyByDevice(deviceId: string, limit = 100) {
    return prisma.telemetryProcessed.findMany({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}

export const telemetryProcessedRepository = new TelemetryProcessedRepository();
