import { prisma } from '../config/database';
import { ReportType } from '@prisma/client';

export class ReportService {
  async generateReport(type: ReportType, format: 'JSON' | 'CSV', userId: string) {
    let data: any[] = [];
    let title = '';

    if (type === ReportType.ROAD_HEALTH) {
      title = 'Sadak Setu - Comprehensive Road Health Report';
      const roads = await prisma.road.findMany({
        include: {
          healthScores: { orderBy: { calculatedAt: 'desc' }, take: 1 },
          _count: { select: { inspections: true, maintenanceCases: true } },
        },
      });

      data = roads.map((r) => ({
        RoadCode: r.roadCode,
        Name: r.name,
        State: r.state,
        District: r.district,
        LengthKm: r.lengthKm,
        HealthScore: r.healthScores[0]?.score ?? 100,
        TotalInspections: r._count.inspections,
        TotalMaintenanceCases: r._count.maintenanceCases,
        Status: r.status,
      }));
    } else if (type === ReportType.DAMAGE_AUDIT) {
      title = 'Sadak Setu - AI Detected Damage Audit';
      const damages = await prisma.damageDetection.findMany({
        include: { inspection: { include: { road: true } } },
        take: 200,
        orderBy: { createdAt: 'desc' },
      });

      data = damages.map((d) => ({
        ID: d.id,
        Road: d.inspection.road.name,
        RoadCode: d.inspection.road.roadCode,
        DamageType: d.damageType,
        Severity: d.severity,
        Confidence: `${(d.confidence * 100).toFixed(1)}%`,
        ChainageMeters: d.chainage ?? 'N/A',
        Source: d.source,
        DetectedAt: d.createdAt.toISOString(),
      }));
    } else {
      title = 'Sadak Setu - Maintenance Lifecycle Status Report';
      const cases = await prisma.maintenanceCase.findMany({
        include: {
          road: true,
          assignedTeam: true,
          verification: true,
        },
        take: 200,
        orderBy: { createdAt: 'desc' },
      });

      data = cases.map((c) => ({
        CaseNumber: c.caseNumber,
        Road: c.road.name,
        Priority: c.priority,
        Status: c.status,
        AssignedTeam: c.assignedTeam?.fullName ?? 'Unassigned',
        VerificationStatus: c.verification?.result ?? 'Pending',
        Confidence: c.verification?.confidence ? `${(c.verification.confidence * 100).toFixed(1)}%` : 'N/A',
        CreatedAt: c.createdAt.toISOString(),
      }));
    }

    // Convert to CSV string if requested
    let outputContent: any = data;
    if (format === 'CSV' && data.length > 0) {
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((h) => {
              const val = row[h] !== undefined ? `${row[h]}`.replace(/"/g, '""') : '';
              return `"${val}"`;
            })
            .join(',')
        ),
      ];
      outputContent = csvRows.join('\n');
    }

    const reportRecord = await prisma.report.create({
      data: {
        title,
        type,
        format,
        createdById: userId,
        parameters: { count: data.length },
      },
    });

    return {
      reportId: reportRecord.id,
      title,
      type,
      format,
      generatedAt: reportRecord.createdAt,
      data: outputContent,
    };
  }
}

export const reportService = new ReportService();
