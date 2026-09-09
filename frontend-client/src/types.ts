export type Role = 'ADMIN' | 'ROAD_INSPECTOR' | 'MAINTENANCE_TEAM' | 'AUTHORITY';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type RoadStatus = 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'CRITICAL_CONDITION' | 'SURVEY_REQUIRED' | 'DECOMMISSIONED';
export type InspectionType = 'ROUTINE_SURVEY' | 'CITIZEN_REPORT_FOLLOWUP' | 'POST_MONSOON_AUDIT' | 'EMERGENCY_ASSESSMENT' | 'CONTRACTOR_VERIFICATION';
export type InspectionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'ANALYZING' | 'COMPLETED' | 'CANCELLED';
export type DamageType = 'POTHOLE' | 'CRACK' | 'SURFACE_DAMAGE' | 'EDGE_DAMAGE';
export type DamageSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PriorityLevel = 'IMMEDIATE' | 'HIGH' | 'MONITOR';
export type MaintenanceStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'REPAIR_SUBMITTED' | 'AI_VERIFICATION' | 'VERIFIED' | 'CLOSED' | 'RETURNED_TO_TEAM' | 'REOPENED';
export type VerificationStatus = 'VERIFIED' | 'NOT_VERIFIED' | 'REVIEW_REQUIRED';
export type DeviceType = 'SMARTPHONE' | 'ESP32_SENSOR' | 'DASHCAM_AI' | 'OBU_TELEMATICS';
export type DeviceStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OFFLINE';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export interface AuthTokens {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Road {
  id: string;
  roadCode: string;
  name: string;
  state: string;
  district: string;
  block?: string;
  village?: string;
  lengthKm: number;
  latitude: number;
  longitude: number;
  status: RoadStatus;
  healthScores?: RoadHealthScore[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadHealthScore {
  id: string;
  roadId: string;
  score: number;
  severityIndex: number;
  densityIndex: number;
  vibrationIndex: number;
  locationIndex: number;
  calculatedAt: string;
}

export interface Inspection {
  id: string;
  roadId: string;
  inspectorId: string;
  inspectionType: InspectionType;
  status: InspectionStatus;
  startedAt?: string;
  completedAt?: string;
  totalDistanceMeters: number;
  remarks?: string;
  road?: { id: string; name: string; roadCode: string };
  inspector?: { id: string; fullName: string; email: string };
}

export interface DamageDetection {
  id: string;
  inspectionId: string;
  mediaId?: string;
  damageType: DamageType;
  severity: DamageSeverity;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  latitude?: number;
  longitude?: number;
  chainage?: number;
  source: string;
  isCorrected: boolean;
}

export interface MaintenanceCase {
  id: string;
  caseNumber: string;
  roadId: string;
  priority: PriorityLevel;
  status: MaintenanceStatus;
  description: string;
  assignedTeamId?: string;
  expectedCompletionDate?: string;
  road?: { id: string; name: string; roadCode: string };
  assignedTeam?: { id: string; fullName: string };
  verification?: { result: VerificationStatus; confidence: number };
  createdAt: string;
}

export interface VerificationResult {
  id: string;
  maintenanceCaseId: string;
  beforeMediaUrl: string;
  afterMediaUrl: string;
  result: VerificationStatus;
  confidence: number;
  reason: string;
  visualSimilarity?: number;
  defectReduction?: number;
  verifiedAt: string;
  verifiedBy: string;
  isManualOverride: boolean;
}

export interface Device {
  id: string;
  deviceCode: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  firmwareVersion?: string;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceTelemetry {
  id: string;
  deviceId: string;
  inspectionId?: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed: number;
  accelerometerX: number;
  accelerometerY: number;
  accelerometerZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  vibrationIntensity: number;
}
