import { prisma } from '../config/database';
import { auditRepository } from '../repositories/audit.repository';

export class ConfigService {
  async getAllConfig() {
    return prisma.systemConfiguration.findMany();
  }

  async setConfig(key: string, value: any, description?: string, userId?: string) {
    const stringVal = typeof value === 'string' ? value : JSON.stringify(value);

    const config = await prisma.systemConfiguration.upsert({
      where: { key },
      create: {
        key,
        value: stringVal,
        description,
        updatedById: userId,
      },
      update: {
        value: stringVal,
        description,
        updatedById: userId,
      },
    });

    await auditRepository.log({
      userId,
      action: 'CONFIG_UPDATED',
      entity: 'SystemConfiguration',
      entityId: key,
      metadata: { key, value },
    });

    return config;
  }
}

export const configService = new ConfigService();
