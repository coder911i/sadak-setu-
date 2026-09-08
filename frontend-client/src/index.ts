import { ApiClient } from './api-client';
import {
  AuthTokens,
  User,
  Road,
  Inspection,
  DamageDetection,
  MaintenanceCase,
  VerificationResult,
} from './types';

export * from './types';
export * from './api-client';

export class SadakSetuSdk {
  public client: ApiClient;

  constructor(options: {
    baseUrl?: string;
    getToken: () => string | null;
    setToken: (token: string) => void;
    onUnauthorized?: () => void;
  }) {
    this.client = new ApiClient(options);
  }

  // Authentication
  auth = {
    login: (body: { email: string; password: string }) =>
      this.client.post<AuthTokens>('/auth/login', body),
    register: (body: { email: string; password: string; fullName: string; role?: string }) =>
      this.client.post<AuthTokens>('/auth/register', body),
    me: () => this.client.get<User>('/auth/me'),
    refresh: (refreshToken: string) =>
      this.client.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }),
    logout: (refreshToken?: string) =>
      this.client.post<null>('/auth/logout', { refreshToken }),
  };

  // Roads
  roads = {
    list: (query?: Record<string, any>) => this.client.get<Road[]>('/roads', query),
    getById: (id: string) => this.client.get<Road>(`/roads/${id}`),
    create: (data: any) => this.client.post<Road>('/roads', data),
    getHealth: (id: string) => this.client.get<any>(`/roads/${id}/health`),
    getHistory: (id: string) => this.client.get<any>(`/roads/${id}/history`),
    getInspections: (id: string) => this.client.get<Inspection[]>(`/roads/${id}/inspections`),
    getMaintenance: (id: string) => this.client.get<MaintenanceCase[]>(`/roads/${id}/maintenance`),
  };

  // Inspections
  inspections = {
    list: (query?: Record<string, any>) => this.client.get<Inspection[]>('/inspections', query),
    getById: (id: string) => this.client.get<Inspection>(`/inspections/${id}`),
    start: (data: { roadId: string; inspectionType?: string; remarks?: string }) =>
      this.client.post<Inspection>('/inspections', data),
    complete: (id: string, data: { totalDistanceMeters?: number; remarks?: string }) =>
      this.client.post<Inspection>(`/inspections/${id}/complete`, data),
    getFusion: (id: string) => this.client.get<any>(`/inspections/${id}/fusion`),
  };

  // Media & Uploads
  media = {
    upload: (formData: FormData) => this.client.post<any>('/media/upload', formData),
    getById: (id: string) => this.client.get<any>(`/media/${id}`),
  };

  // AI Inference & Corrections
  ai = {
    analyzeImage: (data: { mediaUrl: string; inspectionId: string; mediaId?: string; latitude?: number; longitude?: number; chainage?: number }) =>
      this.client.post<any>('/ai/analyze-image', data),
    correctDamage: (id: string, data: { damageType?: string; severity?: string; notes?: string }) =>
      this.client.patch<DamageDetection>(`/ai/analysis/${id}/correct`, data),
  };

  // Maintenance & Lifecycle
  maintenance = {
    listCases: (query?: Record<string, any>) => this.client.get<MaintenanceCase[]>('/maintenance/cases', query),
    getCaseById: (id: string) => this.client.get<MaintenanceCase>(`/maintenance/cases/${id}`),
    createCase: (data: any) => this.client.post<MaintenanceCase>('/maintenance/cases', data),
    assignTeam: (caseId: string, data: { teamId: string; expectedCompletionDate?: string; notes?: string }) =>
      this.client.post<MaintenanceCase>(`/maintenance/cases/${caseId}/assign`, data),
    acceptCase: (caseId: string) => this.client.post<MaintenanceCase>(`/maintenance/cases/${caseId}/accept`),
    startWork: (caseId: string) => this.client.post<MaintenanceCase>(`/maintenance/cases/${caseId}/start`),
    submitRepair: (caseId: string, data: { afterMediaUrl: string; notes?: string; latitude?: number; longitude?: number }) =>
      this.client.post<{ caseId: string; status: string; verification: VerificationResult }>(`/maintenance/cases/${caseId}/submit-repair`, data),
    closeCase: (caseId: string) => this.client.post<MaintenanceCase>(`/maintenance/cases/${caseId}/close`),
    overrideVerification: (caseId: string, data: { action: 'APPROVE' | 'REJECT' | 'RETURN_TO_TEAM'; reason: string }) =>
      this.client.post<MaintenanceCase>(`/verification/${caseId}/override`, data),
  };

  // Analytics
  analytics = {
    overview: () => this.client.get<any>('/analytics/overview'),
    roads: () => this.client.get<any>('/analytics/roads'),
    damage: () => this.client.get<any>('/analytics/damage'),
    maintenance: () => this.client.get<any>('/analytics/maintenance'),
    verification: () => this.client.get<any>('/analytics/verification'),
  };
}
