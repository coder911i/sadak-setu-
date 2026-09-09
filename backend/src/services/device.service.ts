import { deviceRepository } from '../repositories/device.repository';
import { auditRepository } from '../repositories/audit.repository';
import { DeviceAdapter, RawTelemetryPayload } from '../integrations/iot/device-adapter';
import { IotMockGenerator } from '../integrations/iot/iot-mock';
import { DeviceStatus, DeviceType, Prisma } from '@prisma/client';
import { FeatureExtractor } from '../services/telemetry/feature-extractor';
import { telemetryProcessedRepository } from '../repositories/telemetry-processed.repository';
import { PasswordUtil } from '../utils/password';

export class DeviceService {
  async registerDevice(
    data: {
      deviceCode: string;
      name: string;
      type?: DeviceType;
      firmwareVersion?: string;
      apiKey?: string;
    },
    userId?: string
  ) {
    const existing = await deviceRepository.findByCode(data.deviceCode);
    if (existing) {
      throw { statusCode: 409, message: 'Device with this code already registered', code: 'DEVICE_EXISTS' };
    }

    let apiKeyHash: string | undefined;
    if (data.apiKey) {
      apiKeyHash = await PasswordUtil.hash(data.apiKey);
    }

    const device = await deviceRepository.create({
      deviceCode: data.deviceCode,
      name: data.name,
      type: data.type || DeviceType.SMARTPHONE,
      firmwareVersion: data.firmwareVersion,
      status: DeviceStatus.ACTIVE,
      ...(apiKeyHash && { apiKeyHash }),
    });

    await auditRepository.log({
      userId,
      action: 'DEVICE_REGISTERED',
      entity: 'Device',
      entityId: device.id,
      metadata: { deviceCode: device.deviceCode },
    });

    return device;
  }

  async getAllDevices(params: { page?: number; limit?: number; status?: DeviceStatus }) {
    return deviceRepository.findAll(params);
  }

  async getDeviceById(id: string) {
    const device = await deviceRepository.findById(id);
    if (!device) {
      throw { statusCode: 404, message: 'Device not found', code: 'DEVICE_NOT_FOUND' };
    }
    return device;
  }

  async getTelemetry(deviceId: string, inspectionId?: string, limit?: number) {
    await this.getDeviceById(deviceId);
    return deviceRepository.getTelemetry({ deviceId, inspectionId, limit });
  }

  async ingestTelemetry(deviceId: string, payload: RawTelemetryPayload) {
    await this.getDeviceById(deviceId);
    const normalized = DeviceAdapter.normalize({ ...payload, deviceId });

    // Persist raw telemetry
    const rawTelemetry = await deviceRepository.createTelemetry({
      device: { connect: { id: deviceId } },
      ...(normalized.inspectionId && { inspection: { connect: { id: normalized.inspectionId } } }),
      timestamp: normalized.timestamp,
      latitude: normalized.latitude,
      longitude: normalized.longitude,
      speed: normalized.speed,
      accelerometerX: normalized.accelerometerX,
      accelerometerY: normalized.accelerometerY,
      accelerometerZ: normalized.accelerometerZ,
      gyroX: normalized.gyroX,
      gyroY: normalized.gyroY,
      gyroZ: normalized.gyroZ,
      vibrationIntensity: normalized.vibrationIntensity,
    });

    // Feature extraction
    const extracted = FeatureExtractor.extract(normalized, payload);
    const processed = await telemetryProcessedRepository.create({
      device: { connect: { id: deviceId } },
      timestamp: normalized.timestamp,
      latitude: normalized.latitude,
      longitude: normalized.longitude,
      speed: normalized.speed,
      accelerationMagnitude: extracted.accelerationMagnitude,
      gyroMagnitude: extracted.gyroMagnitude,
      ultrasonicDiff: extracted.ultrasonicDiff,
      // Prisma Json? rejects JS null; use DbNull for SQL NULL
      windowStats: extracted.windowStats ?? Prisma.DbNull,
    });

    return {
      ...rawTelemetry,
      processedTelemetry: {
        id: processed.id,
        accelerationMagnitude: processed.accelerationMagnitude,
        gyroMagnitude: processed.gyroMagnitude,
        ultrasonicDiff: processed.ultrasonicDiff,
        windowStats: processed.windowStats,
      },
      eventTimestamp: normalized.timestamp.toISOString(),
      ingestedAt: (extracted.windowStats as any)?.ingestedAt || new Date().toISOString(),
    };
  }


  async generateMockTelemetry(deviceId: string, startLat: number, startLon: number, count = 10, inspectionId?: string) {
    await this.getDeviceById(deviceId);
    const samples = IotMockGenerator.generateTelemetryStream(deviceId, startLat, startLon, count, inspectionId);

    await deviceRepository.createManyTelemetry(
      samples.map((s) => ({
        deviceId,
        inspectionId: s.inspectionId,
        timestamp: s.timestamp,
        latitude: s.latitude,
        longitude: s.longitude,
        speed: s.speed,
        accelerometerX: s.accelerometerX,
        accelerometerY: s.accelerometerY,
        accelerometerZ: s.accelerometerZ,
        gyroX: s.gyroX,
        gyroY: s.gyroY,
        gyroZ: s.gyroZ,
        vibrationIntensity: s.vibrationIntensity,
      }))
    );

    return samples;
  }
}

export const deviceService = new DeviceService();
