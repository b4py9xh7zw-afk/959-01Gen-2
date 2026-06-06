import {
  DownloadLogRepository,
  LicenseRepository,
  ProjectRepository,
  FontRepository,
} from '../repositories/index';
import { Font, License, Project, ProjectType } from '../../shared/types';

export class DownloadService {
  private downloadLogRepository = new DownloadLogRepository();
  private licenseRepository = new LicenseRepository();
  private projectRepository = new ProjectRepository();
  private fontRepository = new FontRepository();

  getDownloadableFonts(userId: number): {
    data: (Font & {
      license: License;
      project: Project;
      availableScenes: ProjectType[];
      endDate: string;
    })[];
    total: number;
  } {
    try {
      const projects = this.projectRepository.findAllByUserId(userId);
      const result: (Font & {
        license: License;
        project: Project;
        availableScenes: ProjectType[];
        endDate: string;
      })[] = [];

      for (const project of projects) {
        const projectWithLicense = this.projectRepository.findByIdAndUserId(
          project.id,
          userId
        );

        if (!projectWithLicense) continue;

        const license = projectWithLicense.license;
        const font = license.font;

        if (!font) continue;

        result.push({
          ...font,
          license: {
            id: license.id,
            fontId: license.fontId,
            userId: license.userId,
            purchaseDate: license.purchaseDate,
            startDate: license.startDate,
            endDate: license.endDate,
            status: license.status,
            allowedProjectTypes: license.allowedProjectTypes,
            maxProjects: license.maxProjects,
            usedProjects: license.usedProjects,
            price: license.price,
            transactionId: license.transactionId,
          },
          project: projectWithLicense,
          availableScenes: license.allowedProjectTypes,
          endDate: license.endDate,
        });
      }

      return {
        data: result,
        total: result.length,
      };
    } catch (error) {
      console.error('Get downloadable fonts error:', error);
      return { data: [], total: 0 };
    }
  }

  downloadFont(
    userId: number,
    fontId: number,
    projectId: number,
    weight: number,
    ipAddress: string
  ): { success: boolean; message: string } {
    try {
      const project = this.projectRepository.findByIdAndUserId(projectId, userId);

      if (!project) {
        return { success: false, message: 'Project not found' };
      }

      const license = project.license;

      if (license.status === 'expired') {
        return {
          success: false,
          message: 'License has expired, only historical project viewing is allowed',
        };
      }

      if (license.fontId !== fontId) {
        return { success: false, message: 'Font does not match the license' };
      }

      const font = this.fontRepository.findById(fontId);
      if (!font) {
        return { success: false, message: 'Font not found' };
      }

      if (!font.weights.includes(weight)) {
        return { success: false, message: 'Invalid font weight' };
      }

      this.downloadLogRepository.create({
        userId,
        fontId,
        projectId,
        weight,
        ipAddress,
      });

      return { success: true, message: 'Download successful' };
    } catch (error) {
      console.error('Download font error:', error);
      return { success: false, message: 'Download failed' };
    }
  }
}
