import { prisma } from '../config/database';
import { Device, DeviceTelemetry, DeviceStatus, Prisma } from '@prisma/client';

export class DeviceRepository {
  async findById(id: string): Promise<Device | null> {
    return prisma.device.findUnique({
      where: { id },
      include: {
        telemetry: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
    });
  }

  async findByCode(deviceCode: string): Promise<Device | null> {
    return prisma.device.findUnique({ where: { deviceCode } });
  }

  async create(data: Prisma.DeviceCreateInput): Promise<Device> {
    return prisma.device.create({ data });
  }

  async update(id: string, data: Prisma.DeviceUpdateInput): Promise<Device> {
    return prisma.device.update({ where: { id }, data });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: DeviceStatus;
  }): Promise<{ devices: Device[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DeviceWhereInput = {
      ...(params.status && { status: params.status }),
    };

    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.device.count({ where }),
    ]);

    return { devices, total };
  }

  // Telemetry
  async createTelemetry(data: Prisma.DeviceTelemetryCreateInput): Promise<DeviceTelemetry> {
    // Also update device lastSeenAt
    await prisma.device.update({
      where: { id: data.device.connect?.id },
      data: { lastSeenAt: new Date() },
    });

    return prisma.deviceTelemetry.create({ data });
  }

  async createManyTelemetry(data: Prisma.DeviceTelemetryCreateManyInput[]) {
    return prisma.deviceTelemetry.createMany({ data });
  }

  async getTelemetry(params: {
    deviceId?: string;
    inspectionId?: string;
    limit?: number;
  }): Promise<DeviceTelemetry[]> {
    return prisma.deviceTelemetry.findMany({
      where: {
        ...(params.deviceId && { deviceId: params.deviceId }),
        ...(params.inspectionId && { inspectionId: params.inspectionId }),
      },
      orderBy: { timestamp: 'desc' },
      take: params.limit || 100,
    });
  }
}

export const deviceRepository = new DeviceRepository();
