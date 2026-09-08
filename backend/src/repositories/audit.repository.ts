import { prisma } from '../config/database';
import { AuditLog, Prisma } from '@prisma/client';

export class AuditRepository {
  async log(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
  }): Promise<AuditLog> {
    return prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        metadata: data.metadata || {},
        ipAddress: data.ipAddress,
      },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    userId?: string;
    entity?: string;
    action?: string;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {
      ...(params.userId && { userId: params.userId }),
      ...(params.entity && { entity: params.entity }),
      ...(params.action && { action: params.action }),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }
}

export const auditRepository = new AuditRepository();
