import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';
import { ApiResponse } from '../utils/api-response';
import { ReportType } from '@prisma/client';

export class ReportController {
  static async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, format } = req.body;
      const reportType = type || ReportType.ROAD_HEALTH;
      const reportFormat = (format || 'JSON').toUpperCase();

      const result = await reportService.generateReport(reportType, reportFormat as any, req.user!.userId);

      if (reportFormat === 'CSV') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="sadak-setu-report-${Date.now()}.csv"`);
        return res.status(200).send(result.data);
      }

      return ApiResponse.created(res, result, 'Report generated successfully');
    } catch (error) {
      next(error);
    }
  }
}
