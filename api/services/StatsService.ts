import {
  LicenseRepository,
  ProjectRepository,
  DownloadLogRepository,
} from '../repositories/index';
import {
  DashboardStats,
  ActivityItem,
  UserRole,
  ProjectType,
  LicenseStatus,
} from '../../shared/types';

export class StatsService {
  private licenseRepository = new LicenseRepository();
  private projectRepository = new ProjectRepository();
  private downloadLogRepository = new DownloadLogRepository();

  getDashboardStats(userId: number, role: UserRole): DashboardStats {
    try {
      const licenses = this.licenseRepository.findAllByUserId(userId);
      const projects = this.projectRepository.findAllByUserId(userId);
      const now = new Date();

      let totalLicenses = 0;
      let activeLicenses = 0;
      let expiringLicenses = 0;
      let expiredLicenses = 0;
      const licenseByType: Record<ProjectType, number> = {
        website: 0,
        app: 0,
        packaging: 0,
        advertising: 0,
      };

      for (const license of licenses) {
        const status = this.calculateLicenseStatus(license.endDate);
        totalLicenses++;

        if (status === 'active') activeLicenses++;
        else if (status === 'expiring') expiringLicenses++;
        else if (status === 'expired') expiredLicenses++;

        for (const type of license.allowedProjectTypes) {
          licenseByType[type]++;
        }
      }

      const totalProjects = projects.length;
      const activeProjects = projects.filter((p) => !p.isArchived).length;

      const monthlyDownloads = this.downloadLogRepository.countByUserIdAndMonth(
        userId,
        now.getFullYear(),
        now.getMonth() + 1
      );
      const totalDownloads = this.downloadLogRepository.countByUserId(userId);

      const recentActivities = this.getRecentActivities(userId, licenses, projects);

      return {
        totalLicenses,
        activeLicenses,
        expiringLicenses,
        expiredLicenses,
        totalProjects,
        activeProjects,
        monthlyDownloads,
        totalDownloads,
        licenseByType,
        recentActivities,
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return {
        totalLicenses: 0,
        activeLicenses: 0,
        expiringLicenses: 0,
        expiredLicenses: 0,
        totalProjects: 0,
        activeProjects: 0,
        monthlyDownloads: 0,
        totalDownloads: 0,
        licenseByType: {
          website: 0,
          app: 0,
          packaging: 0,
          advertising: 0,
        },
        recentActivities: [],
      };
    }
  }

  private calculateLicenseStatus(endDate: string): LicenseStatus {
    const now = new Date();
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'expired';
    if (diffDays <= 30) return 'expiring';
    return 'active';
  }

  private getRecentActivities(
    userId: number,
    licenses: any[],
    projects: any[]
  ): ActivityItem[] {
    const activities: ActivityItem[] = [];

    for (const license of licenses) {
      const status = this.calculateLicenseStatus(license.endDate);

      activities.push({
        id: license.id,
        type: 'purchase',
        description: `购买字体授权 #${license.id}`,
        timestamp: license.purchaseDate,
        metadata: {
          licenseId: license.id,
          fontId: license.fontId,
          price: license.price,
        },
      });

      if (status === 'expired') {
        activities.push({
          id: license.id + 10000,
          type: 'license_expire',
          description: `授权 #${license.id} 已过期`,
          timestamp: license.endDate,
          metadata: {
            licenseId: license.id,
            fontId: license.fontId,
          },
        });
      }
    }

    for (const project of projects) {
      activities.push({
        id: project.id + 20000,
        type: 'project_create',
        description: `创建项目「${project.name}」`,
        timestamp: project.createdAt,
        metadata: {
          projectId: project.id,
          projectName: project.name,
          projectType: project.type,
        },
      });
    }

    const downloadLogs = this.downloadLogRepository.findRecentByUserId(userId, 10);
    for (const log of downloadLogs) {
      activities.push({
        id: log.id + 30000,
        type: 'download',
        description: `下载字体 #${log.fontId} 字重 ${log.weight}`,
        timestamp: log.downloadedAt,
        metadata: {
          downloadLogId: log.id,
          fontId: log.fontId,
          projectId: log.projectId,
          weight: log.weight,
        },
      });
    }

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities.slice(0, 20);
  }
}
