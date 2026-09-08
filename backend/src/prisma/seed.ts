import { PrismaClient, Role, UserStatus, RoadStatus, InspectionType, InspectionStatus, DamageType, DamageSeverity, PriorityLevel, MaintenanceStatus, VerificationStatus, DeviceType, DeviceStatus, DetectionSource } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING SADAK SETU DATABASE (DEMO DATA) ---');

  // 1. Create Users for all 4 Roles
  const defaultPasswordHash = await bcrypt.hash('SadakSetu@2026', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sadaksetu.gov.in' },
    update: {},
    create: {
      email: 'admin@sadaksetu.gov.in',
      passwordHash: defaultPasswordHash,
      fullName: 'Vikramaditya Sharma (Chief Engineer)',
      phone: '+91 98100 12345',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const inspector = await prisma.user.upsert({
    where: { email: 'inspector@sadaksetu.gov.in' },
    update: {},
    create: {
      email: 'inspector@sadaksetu.gov.in',
      passwordHash: defaultPasswordHash,
      fullName: 'Rajesh Verma (Field Road Inspector)',
      phone: '+91 98200 23456',
      role: Role.ROAD_INSPECTOR,
      status: UserStatus.ACTIVE,
    },
  });

  const maintenanceTeam = await prisma.user.upsert({
    where: { email: 'team@sadaksetu.gov.in' },
    update: {},
    create: {
      email: 'team@sadaksetu.gov.in',
      passwordHash: defaultPasswordHash,
      fullName: 'NHAI Rapid Response Unit #4',
      phone: '+91 98300 34567',
      role: Role.MAINTENANCE_TEAM,
      status: UserStatus.ACTIVE,
    },
  });

  const authority = await prisma.user.upsert({
    where: { email: 'authority@sadaksetu.gov.in' },
    update: {},
    create: {
      email: 'authority@sadaksetu.gov.in',
      passwordHash: defaultPasswordHash,
      fullName: 'Dr. Ananya Sen (Principal Road Transport Auditor)',
      phone: '+91 98400 45678',
      role: Role.AUTHORITY,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Created Users: Admin, Inspector, Maintenance Team, Authority');

  // 2. Create Realistic Indian Roads (UP, HP, Rajasthan)
  const roadUP = await prisma.road.upsert({
    where: { roadCode: 'NH-19-UP-04' },
    update: {},
    create: {
      roadCode: 'NH-19-UP-04',
      name: 'Delhi - Agra Expressway Corridor (DEMO)',
      state: 'Uttar Pradesh',
      district: 'Mathura',
      block: 'Farah',
      village: 'Chhata',
      lengthKm: 42.5,
      latitude: 27.4924,
      longitude: 77.6737,
      status: RoadStatus.OPERATIONAL,
      routeGeoJson: { type: 'LineString', coordinates: [[77.6737, 27.4924], [77.685, 27.501]] },
    },
  });

  const roadHP = await prisma.road.upsert({
    where: { roadCode: 'NH-05-HP-12' },
    update: {},
    create: {
      roadCode: 'NH-05-HP-12',
      name: 'Hindustan-Tibet Road Kinnaur Valley (DEMO)',
      state: 'Himachal Pradesh',
      district: 'Kinnaur',
      block: 'Kalpa',
      village: 'Reckong Peo',
      lengthKm: 34.0,
      latitude: 31.542,
      longitude: 78.274,
      status: RoadStatus.UNDER_MAINTENANCE,
      routeGeoJson: { type: 'LineString', coordinates: [[78.274, 31.542], [78.291, 31.556]] },
    },
  });

  const roadRJ = await prisma.road.upsert({
    where: { roadCode: 'SH-41-RJ-08' },
    update: {},
    create: {
      roadCode: 'SH-41-RJ-08',
      name: 'Jaipur - Sikar Strategic Highway (DEMO)',
      state: 'Rajasthan',
      district: 'Jaipur',
      block: 'Chomu',
      village: 'Morija',
      lengthKm: 28.2,
      latitude: 27.165,
      longitude: 75.728,
      status: RoadStatus.OPERATIONAL,
    },
  });

  console.log('Created Roads in UP, HP, and Rajasthan');

  // 3. Create Road Segments
  const segment1 = await prisma.roadSegment.upsert({
    where: { roadId_segmentCode: { roadId: roadUP.id, segmentCode: 'KM-14-16' } },
    update: {},
    create: {
      roadId: roadUP.id,
      segmentCode: 'KM-14-16',
      chainageStart: 14000,
      chainageEnd: 16000,
      surfaceType: 'BITUMINOUS_ASPHALT',
      laneCount: 6,
      status: RoadStatus.OPERATIONAL,
    },
  });

  // 4. Create Sample IoT Devices
  const device = await prisma.device.upsert({
    where: { deviceCode: 'ESP32-SURV-001' },
    update: {},
    create: {
      deviceCode: 'ESP32-SURV-001',
      name: 'SadakSetu Fleet Telematics Node 1',
      type: DeviceType.ESP32_SENSOR,
      status: DeviceStatus.ACTIVE,
      firmwareVersion: 'v2.4.1-iot-telematics',
      lastSeenAt: new Date(),
    },
  });

  // 5. Create Inspection
  const inspection = await prisma.inspection.create({
    data: {
      roadId: roadUP.id,
      inspectorId: inspector.id,
      inspectionType: InspectionType.ROUTINE_SURVEY,
      status: InspectionStatus.COMPLETED,
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(),
      totalDistanceMeters: 4500,
      remarks: 'Comprehensive camera and vibration survey completed on Mathura section.',
    },
  });

  // 6. Media Asset & Telemetry
  const media = await prisma.mediaAsset.create({
    data: {
      inspectionId: inspection.id,
      url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=1000',
      storageKey: 'demo-media/pothole-mathura-km14.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1048576,
      latitude: 27.4925,
      longitude: 77.6739,
      chainage: 14250,
      metadata: { resolution: '1920x1080', camera: 'Sony IMX586' },
    },
  });

  await prisma.deviceTelemetry.createMany({
    data: [
      {
        deviceId: device.id,
        inspectionId: inspection.id,
        latitude: 27.4925,
        longitude: 77.6739,
        speed: 42.0,
        accelerometerX: 2.8,
        accelerometerY: -1.9,
        accelerometerZ: 14.8,
        vibrationIntensity: 5.2,
      },
      {
        deviceId: device.id,
        inspectionId: inspection.id,
        latitude: 27.4927,
        longitude: 77.6741,
        speed: 40.5,
        accelerometerX: 0.3,
        accelerometerY: 0.1,
        accelerometerZ: 9.8,
        vibrationIntensity: 0.4,
      },
    ],
  });

  // 7. Damage Detection
  const damage = await prisma.damageDetection.create({
    data: {
      inspectionId: inspection.id,
      mediaId: media.id,
      damageType: DamageType.POTHOLE,
      severity: DamageSeverity.CRITICAL,
      confidence: 0.94,
      boundingBox: { x: 180, y: 220, width: 140, height: 95 },
      latitude: 27.4925,
      longitude: 77.6739,
      chainage: 14250,
      source: DetectionSource.AI,
      notes: 'Deep structural crater detected with severe asphalt displacement.',
    },
  });

  // 8. Road Health Score
  await prisma.roadHealthScore.create({
    data: {
      roadId: roadUP.id,
      segmentId: segment1.id,
      score: 76.5,
      severityIndex: 35.0,
      densityIndex: 18.2,
      vibrationIndex: 26.0,
      locationIndex: 25.0,
      formulaVersion: '1.0.0-prototype-calibrated',
      details: { totalDefects: 1, remarks: 'Corroborated by vibration anomalies' },
    },
  });

  // 9. Maintenance Case & Lifecycle
  const mCase = await prisma.maintenanceCase.create({
    data: {
      caseNumber: 'MC-2026-00912',
      roadId: roadUP.id,
      segmentId: segment1.id,
      damageId: damage.id,
      createdById: inspector.id,
      assignedTeamId: maintenanceTeam.id,
      assignedById: admin.id,
      assignedAt: new Date(Date.now() - 1800000),
      priority: PriorityLevel.IMMEDIATE,
      priorityScore: 92.0,
      priorityReason: 'Critical pothole defect with physical vibration spike on National Highway corridor.',
      recommendedAction: 'Rapid cold-mix patching and compaction within 24 hours.',
      status: MaintenanceStatus.VERIFIED,
      description: 'Emergency repair of critical 14cm pothole on Mathura Highway chainage 14.25km.',
      expectedCompletionDate: new Date(Date.now() + 86400000),
    },
  });

  // 10. Verification Result
  await prisma.repairEvidence.createMany({
    data: [
      {
        maintenanceCaseId: mCase.id,
        uploadedById: maintenanceTeam.id,
        evidenceType: 'BEFORE',
        mediaUrl: media.url,
        storageKey: media.storageKey,
        latitude: 27.4925,
        longitude: 77.6739,
      },
      {
        maintenanceCaseId: mCase.id,
        uploadedById: maintenanceTeam.id,
        evidenceType: 'AFTER',
        mediaUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000',
        storageKey: 'demo-media/repaired-mathura-km14.jpg',
        latitude: 27.4925,
        longitude: 77.6739,
      },
    ],
  });

  await prisma.verificationResult.create({
    data: {
      maintenanceCaseId: mCase.id,
      beforeMediaUrl: media.url,
      afterMediaUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000',
      result: VerificationStatus.VERIFIED,
      confidence: 0.94,
      reason: 'AI Dual-Evidence Comparison: Crater cavity filled with dense graded asphalt and leveled to road profile. Defect eradication verified.',
      visualSimilarity: 0.89,
      defectReduction: 98.2,
      verifiedBy: 'AI_MODEL_YOLO_V8',
    },
  });

  console.log('--- SEED COMPLETED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
