import { prisma } from '../config/database';
import { MaintenanceStatus, VerificationStatus } from '@prisma/client';

export class AnalyticsService {
  async getOverview() {
    const [
      totalRoads,
      totalInspections,
      totalDamages,
      totalMaintenanceCases,
      openCases,
      verifiedCases,
      devicesCount,
    ] = await Promise.all([
      prisma.road.count(),
      prisma.inspection.count(),
      prisma.damageDetection.count(),
      prisma.maintenanceCase.count(),
      prisma.maintenanceCase.count({ where: { status: { in: [MaintenanceStatus.OPEN, MaintenanceStatus.ASSIGNED, MaintenanceStatus.IN_PROGRESS] } } }),
      prisma.maintenanceCase.count({ where: { status: MaintenanceStatus.VERIFIED } }),
      prisma.device.count(),
    ]);

    // Average health score
    const healthScores = await prisma.roadHealthScore.findMany({
      orderBy: { calculatedAt: 'desc' },
      take: 100,
      select: { score: true },
    });
    const avgScore =
      healthScores.length > 0
        ? parseFloat((healthScores.reduce((acc, s) => acc + s.score, 0) / healthScores.length).toFixed(1))
        : 82.5;

    return {
      totalRoads,
      totalInspections,
      totalDamages,
      totalMaintenanceCases,
      openCases,
      verifiedCases,
      activeDevices: devicesCount,
      networkAverageHealthScore: avgScore,
    };
  }

  async getRoadAnalytics() {
    const roads = await prisma.road.findMany({
      include: {
        healthScores: { orderBy: { calculatedAt: 'desc' }, take: 1 },
        _count: { select: { inspections: true, maintenanceCases: true } },
      },
    });

    return roads.map((r) => ({
      id: r.id,
      roadCode: r.roadCode,
      name: r.name,
      state: r.state,
      district: r.district,
      lengthKm: r.lengthKm,
      latestHealthScore: r.healthScores[0]?.score ?? 100,
      totalInspections: r._count.inspections,
      totalCases: r._count.maintenanceCases,
      status: r.status,
    }));
  }

  async getDamageDistribution() {
    const [byType, bySeverity] = await Promise.all([
      prisma.damageDetection.groupBy({
        by: ['damageType'],
        _count: { id: true },
      }),
      prisma.damageDetection.groupBy({
        by: ['severity'],
        _count: { id: true },
      }),
    ]);

    return {
      byType: byType.map((t) => ({ type: t.damageType, count: t._count.id })),
      bySeverity: bySeverity.map((s) => ({ severity: s.severity, count: s._count.id })),
    };
  }

  async getMaintenanceAnalytics() {
    const [byStatus, byPriority] = await Promise.all([
      prisma.maintenanceCase.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.maintenanceCase.groupBy({
        by: ['priority'],
        _count: { id: true },
      }),
    ]);

    return {
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      byPriority: byPriority.map((p) => ({ priority: p.priority, count: p._count.id })),
    };
  }

  async getVerificationAnalytics() {
    const [results, totalVerifications] = await Promise.all([
      prisma.verificationResult.groupBy({
        by: ['result'],
        _count: { id: true },
        _avg: { confidence: true, defectReduction: true },
      }),
      prisma.verificationResult.count(),
    ]);

    const verifiedCount = results.find((r) => r.result === VerificationStatus.VERIFIED)?._count.id || 0;
    const successRate = totalVerifications > 0 ? parseFloat(((verifiedCount / totalVerifications) * 100).toFixed(1)) : 0;

    return {
      totalVerifications,
      successRatePercentage: successRate,
      breakdown: results.map((r) => ({
        verdict: r.result,
        count: r._count.id,
        avgConfidence: r._avg.confidence ? parseFloat((r._avg.confidence * 100).toFixed(1)) : null,
        avgDefectReduction: r._avg.defectReduction ? parseFloat(r._avg.defectReduction.toFixed(1)) : null,
      })),
    };
  }
}

export const analyticsService = new AnalyticsService();
