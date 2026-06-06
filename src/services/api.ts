import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type {
  User,
  Font,
  License,
  Project,
  Certificate,
  DashboardStats,
  LoginRequest,
  LoginResponse,
  ApiResponse,
  PaginatedResponse,
  DownloadableFont,
  FontDetail,
} from '../../shared/types';

const httpClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  return response.data.data;
};

const handlePaginatedResponse = <T>(response: AxiosResponse<PaginatedResponse<T>>): PaginatedResponse<T> => {
  return {
    success: response.data.success,
    data: response.data.data,
    pagination: response.data.pagination,
  };
};

export const auth = {
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return httpClient.post<ApiResponse<LoginResponse>>('/auth/login', data).then(handleResponse);
  },
  getProfile: (): Promise<User> => {
    return httpClient.get<ApiResponse<User>>('/auth/profile').then(handleResponse);
  },
  logout: (): Promise<void> => {
    return httpClient.post<ApiResponse<void>>('/auth/logout').then(handleResponse);
  },
};

export const fonts = {
  getFonts: (params?: Record<string, any>): Promise<PaginatedResponse<Font>> => {
    return httpClient.get<PaginatedResponse<Font>>('/fonts', { params }).then(handlePaginatedResponse);
  },
  getFontById: (id: number): Promise<Font> => {
    return httpClient.get<ApiResponse<Font>>(`/fonts/${id}`).then(handleResponse);
  },
  purchaseFont: (id: number, data: Record<string, any>): Promise<License> => {
    return httpClient.post<ApiResponse<License>>(`/fonts/${id}/purchase`, data).then(handleResponse);
  },
};

export const licenses = {
  getLicenses: (params?: Record<string, any>): Promise<PaginatedResponse<License>> => {
    return httpClient.get<PaginatedResponse<License>>('/licenses', { params }).then(handlePaginatedResponse);
  },
  getLicenseById: (id: number): Promise<License> => {
    return httpClient.get<ApiResponse<License>>(`/licenses/${id}`).then(handleResponse);
  },
  updateLicense: (id: number, data: Record<string, any>): Promise<License> => {
    return httpClient.put<ApiResponse<License>>(`/licenses/${id}`, data).then(handleResponse);
  },
  renewLicense: (id: number, data: Record<string, any>): Promise<License> => {
    return httpClient.post<ApiResponse<License>>(`/licenses/${id}/renew`, data).then(handleResponse);
  },
};

export const projects = {
  getProjects: (params?: Record<string, any>): Promise<PaginatedResponse<Project>> => {
    return httpClient.get<PaginatedResponse<Project>>('/projects', { params }).then(handlePaginatedResponse);
  },
  getProjectById: (id: number): Promise<Project> => {
    return httpClient.get<ApiResponse<Project>>(`/projects/${id}`).then(handleResponse);
  },
  createProject: (data: Record<string, any>): Promise<Project> => {
    return httpClient.post<ApiResponse<Project>>('/projects', data).then(handleResponse);
  },
  archiveProject: (id: number): Promise<void> => {
    return httpClient.post<ApiResponse<void>>(`/projects/${id}/archive`).then(handleResponse);
  },
};

export const downloads = {
  getDownloadableFonts: (): Promise<DownloadableFont[]> => {
    return httpClient.get<ApiResponse<DownloadableFont[]>>('/downloads').then(handleResponse);
  },
  getFontDetail: (id: number): Promise<FontDetail> => {
    return httpClient.get<ApiResponse<FontDetail>>(`/downloads/${id}`).then(handleResponse);
  },
  downloadFont: (id: number, data: Record<string, any>): Promise<Blob> => {
    return httpClient.post(`/downloads/${id}`, data, { responseType: 'blob' }).then((res) => res.data);
  },
};

export const certificates = {
  getCertificates: (params?: Record<string, any>): Promise<PaginatedResponse<Certificate>> => {
    return httpClient.get<PaginatedResponse<Certificate>>('/certificates', { params }).then(handlePaginatedResponse);
  },
  getCertificateById: (id: number): Promise<Certificate> => {
    return httpClient.get<ApiResponse<Certificate>>(`/certificates/${id}`).then(handleResponse);
  },
  exportCertificate: (id: number): Promise<Blob> => {
    return httpClient.get(`/certificates/${id}/export`, { responseType: 'blob' }).then((res) => res.data);
  },
};

export const stats = {
  getDashboardStats: (): Promise<DashboardStats> => {
    return httpClient.get<ApiResponse<DashboardStats>>('/stats/dashboard').then(handleResponse);
  },
};

export default {
  auth,
  fonts,
  licenses,
  projects,
  downloads,
  certificates,
  stats,
};
