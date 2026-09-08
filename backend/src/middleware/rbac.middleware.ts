import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiResponse } from '../utils/api-response';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

export const requireAdmin = requireRole(Role.ADMIN);
export const requireInspector = requireRole(Role.ADMIN, Role.ROAD_INSPECTOR);
export const requireMaintenanceTeam = requireRole(Role.ADMIN, Role.MAINTENANCE_TEAM);
export const requireAuthority = requireRole(Role.ADMIN, Role.AUTHORITY);
export const requireAuthorityOrInspector = requireRole(Role.ADMIN, Role.AUTHORITY, Role.ROAD_INSPECTOR);
