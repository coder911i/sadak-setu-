import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import createApp from '../../src/app';
import { prisma } from '../../src/config/database';
import { PasswordUtil } from '../../src/utils/password';
import { DeviceType, DeviceStatus } from '@prisma/client';

describe('Live IoT Telemetry Ingestion Pipeline (POST /api/v1/iot/telemetry)', () => {
  const app = createApp();
  const testDeviceCode1 = 'ESP32-LIVE-001';
  const testSecret1 = 'esp32_super_secret_key_1';
  let deviceId1: string;

  const testDeviceCode2 = 'ESP32-LIVE-002';
  const testSecret2 = 'esp32_super_secret_key_2';
  let deviceId2: string;

  beforeAll(async () => {
    // 1. Setup Device 1
    const secretHash1 = await PasswordUtil.hash(testSecret1);
    const d1 = await prisma.device.upsert({
      where: { deviceCode: testDeviceCode1 },
      update: { apiKeyHash: secretHash1, status: DeviceStatus.ACTIVE },
      create: {
        deviceCode: testDeviceCode1,
        name: 'ESP32 Road Survey Unit Alpha',
        type: DeviceType.ESP32_SENSOR,
        status: DeviceStatus.ACTIVE,
        firmwareVersion: 'v2.4.1',
        apiKeyHash: secretHash1,
      },
    });
    deviceId1 = d1.id;

    // 2. Setup Device 2
    const secretHash2 = await PasswordUtil.hash(testSecret2);
    const d2 = await prisma.device.upsert({
      where: { deviceCode: testDeviceCode2 },
      update: { apiKeyHash: secretHash2, status: DeviceStatus.ACTIVE },
      create: {
        deviceCode: testDeviceCode2,
        name: 'ESP32 Road Survey Unit Beta',
        type: DeviceType.ESP32_SENSOR,
        status: DeviceStatus.ACTIVE,
        firmwareVersion: 'v2.4.1',
        apiKeyHash: secretHash2,
      },
    });
    deviceId2 = d2.id;
  });

  afterAll(async () => {
    // Cleanup created telemetry and devices
    await prisma.telemetryProcessed.deleteMany({
      where: { deviceId: { in: [deviceId1, deviceId2] } },
    });
    await prisma.deviceTelemetry.deleteMany({
      where: { deviceId: { in: [deviceId1, deviceId2] } },
    });
    await prisma.device.deleteMany({
      where: { deviceCode: { in: [testDeviceCode1, testDeviceCode2] } },
    });
  });

  it('should reject request when X-Device-Secret header is missing', async () => {
    const res = await request(app)
      .post('/api/v1/iot/telemetry')
      .send({
        deviceId: testDeviceCode1,
        latitude: 27.4925,
        longitude: 77.6739,
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Missing device secret');
  });

  it('should reject request when X-Device-Secret is incorrect', async () => {
    const res = await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Secret', 'wrong_secret_token')
      .send({
        deviceId: testDeviceCode1,
        latitude: 27.4925,
        longitude: 77.6739,
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Invalid device credentials');
  });

  it('should prevent device impersonation when header X-Device-Id does not match payload deviceId', async () => {
    const res = await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Secret', testSecret1)
      .set('X-Device-Id', testDeviceCode1)
      .send({
        deviceId: testDeviceCode2, // attempting to submit on behalf of Device 2
        latitude: 27.4925,
        longitude: 77.6739,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('identity mismatch');
  });

  it('should prevent device impersonation when secret of device 1 is used for device 2', async () => {
    const res = await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Secret', testSecret1) // device 1 secret
      .send({
        deviceId: testDeviceCode2, // device 2 identity
        latitude: 27.4925,
        longitude: 77.6739,
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Invalid device credentials');
  });

  it('should successfully ingest realistic ESP32 telemetry with snake_case and separated timestamps', async () => {
    const eventTime = '2026-09-09T10:30:00.000Z';
    const res = await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Secret', testSecret1)
      .send({
        deviceId: testDeviceCode1,
        timestamp: eventTime,
        latitude: 27.4925,
        longitude: 77.6739,
        speed: 48.5,
        accel_x: 1.45,
        accel_y: -0.82,
        accel_z: 14.2,
        gyro_x: 0.12,
        gyro_y: -0.34,
        gyro_z: 0.05,
        distance_1: 45.2,
        distance_2: 38.1,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.eventTimestamp).toBe(eventTime);
    expect(res.body.data.ingestedAt).toBeDefined();
    expect(res.body.data.processedTelemetry).toBeDefined();
    expect(res.body.data.processedTelemetry.accelerationMagnitude).toBeGreaterThan(14.0);
    expect(res.body.data.processedTelemetry.ultrasonicDiff).toBeCloseTo(7.1, 1);

    // Verify raw record in NeonDB
    const rawInDb = await prisma.deviceTelemetry.findUnique({
      where: { id: res.body.data.id },
    });
    expect(rawInDb).toBeDefined();
    expect(rawInDb?.latitude).toBeCloseTo(27.4925, 4);
    expect(rawInDb?.accelerometerZ).toBeCloseTo(14.2, 1);

    // Verify processed record in NeonDB
    const processedInDb = await prisma.telemetryProcessed.findUnique({
      where: { id: res.body.data.processedTelemetry.id },
    });
    expect(processedInDb).toBeDefined();
    expect(processedInDb?.accelerationMagnitude).toBeGreaterThan(14.0);
  });

  it('should handle duplicate/replay telemetry idempotently without duplicating DB rows', async () => {
    const eventTime = '2026-09-09T10:35:00.000Z';
    const payload = {
      deviceId: testDeviceCode1,
      timestamp: eventTime,
      latitude: 27.493,
      longitude: 77.674,
      speed: 50.0,
      accelerometerX: 0.5,
      accelerometerY: 0.2,
      accelerometerZ: 9.9,
    };

    // First ingestion
    const res1 = await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Secret', testSecret1)
      .send(payload);

    expect(res1.status).toBe(201);

    // Replay same payload
    const res2 = await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Secret', testSecret1)
      .send(payload);

    expect(res2.status).toBe(200);
    expect(res2.body.message).toContain('idempotent duplicate ignored');
    expect(res2.body.data.duplicate).toBe(true);

    // Verify only 1 record exists in DB for this timestamp
    const count = await prisma.deviceTelemetry.count({
      where: { deviceId: deviceId1, timestamp: new Date(eventTime) },
    });
    expect(count).toBe(1);
  });

  it('should allow missing GPS (null or omitted) and record safe fallbacks without failing', async () => {
    const res = await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Secret', testSecret1)
      .send({
        deviceId: testDeviceCode1,
        timestamp: '2026-09-09T10:40:00.000Z',
        latitude: null, // GPS lost
        longitude: null,
        accel_z: 11.2,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.latitude).toBe(0.0);
    expect(res.body.data.longitude).toBe(0.0);
    expect(res.body.data.processedTelemetry.windowStats.gpsAvailable).toBe(false);
  });

  it('should tolerate sensor failures (corrupted / null readings) without destroying valid telemetry', async () => {
    const res = await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Secret', testSecret1)
      .send({
        deviceId: testDeviceCode1,
        timestamp: '2026-09-09T10:45:00.000Z',
        latitude: 27.501,
        longitude: 77.685,
        // Gyro disconnected / failed:
        gyro_x: null,
        gyro_y: null,
        gyro_z: null,
        // Ultrasonic disconnected:
        distance_1: null,
        distance_2: null,
        // Valid accelerometer:
        accel_x: 2.1,
        accel_y: 1.5,
        accel_z: 12.8,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // Valid data preserved:
    expect(res.body.data.latitude).toBeCloseTo(27.501, 3);
    expect(res.body.data.accelerometerZ).toBeCloseTo(12.8, 1);
    // Sensor failure safe fallbacks:
    expect(res.body.data.gyroX).toBe(0.0);
    expect(res.body.data.processedTelemetry.ultrasonicDiff).toBeNull();
    expect(res.body.data.processedTelemetry.gyroMagnitude).toBe(0.0);
  });
});
