import { auditRepository } from '../repositories/audit.repository';

export class AuditService {
  async getLogs(params: {
    page?: number;
    limit?: number;
    userId?: string;
    entity?: string;
    action?: string;
  }) {
    return auditRepository.findAll(params);
  }
}

export const auditService = new AuditService();
