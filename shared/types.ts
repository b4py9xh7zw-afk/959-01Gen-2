export type UserRole = 'brand' | 'designer';

export type LicenseStatus = 'active' | 'expiring' | 'expired';

export type ProjectType = 'website' | 'app' | 'packaging' | 'advertising';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
  createdAt: string;
}

export interface Font {
  id: number;
  name: string;
  family: string;
  designer: string;
  description: string;
  previewText: string;
  weights: number[];
  languages: string[];
  style: 'serif' | 'sans-serif' | 'display' | 'monospace';
  price: number;
  currency: string;
  coverImage: string;
  sampleImages: string[];
  createdAt: string;
}

export interface License {
  id: number;
  fontId: number;
  font?: Font;
  userId: number;
  purchaseDate: string;
  startDate: string;
  endDate: string;
  status: LicenseStatus;
  allowedProjectTypes: ProjectType[];
  maxProjects: number;
  usedProjects: number;
  price: number;
  transactionId: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  type: ProjectType;
  userId: number;
  licenseId: number;
  license?: License;
  isArchived: boolean;
  createdAt: string;
  startDate: string;
  endDate?: string;
}

export interface DownloadLog {
  id: number;
  userId: number;
  fontId: number;
  projectId: number;
  weight: number;
  downloadedAt: string;
  ipAddress: string;
}

export interface Certificate {
  id: number;
  projectId: number;
  project?: Project;
  licenseId: number;
  license?: License;
  fontId: number;
  font?: Font;
  issuedAt: string;
  validFrom: string;
  validTo: string;
  certificateNumber: string;
  digitalSignature: string;
}

export interface DashboardStats {
  totalLicenses: number;
  activeLicenses: number;
  expiringLicenses: number;
  expiredLicenses: number;
  totalProjects: number;
  activeProjects: number;
  monthlyDownloads: number;
  totalDownloads: number;
  licenseByType: Record<ProjectType, number>;
  recentActivities: ActivityItem[];
}

export interface ActivityItem {
  id: number;
  type: 'purchase' | 'download' | 'project_create' | 'license_expire';
  description: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  website: '官网',
  app: 'App',
  packaging: '包装',
  advertising: '广告',
};

export const LICENSE_STATUS_LABELS: Record<LicenseStatus, string> = {
  active: '有效',
  expiring: '即将过期',
  expired: '已过期',
};

export const FONT_STYLE_LABELS: Record<string, string> = {
  serif: '衬线体',
  'sans-serif': '无衬线体',
  display: '展示体',
  monospace: '等宽体',
};

export interface DownloadableFont extends Font {
  license: License;
  project: Project;
  availableScenes: ProjectType[];
  endDate: string;
}

export interface FontDetail extends Font {
  availableScenes: ProjectType[];
  endDate: string;
  license?: License;
  project?: Project;
}

export interface DownloadRecord {
  id: number;
  fontName: string;
  weight: number;
  projectName: string;
  downloadedAt: string;
}

export const FONT_WEIGHT_LABELS: Record<number, string> = {
  100: 'Thin',
  200: 'Extra Light',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semi Bold',
  700: 'Bold',
  800: 'Extra Bold',
  900: 'Black',
};
