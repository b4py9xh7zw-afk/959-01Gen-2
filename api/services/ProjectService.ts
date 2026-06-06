import {
  ProjectRepository,
  LicenseRepository,
  CertificateRepository,
  FontRepository,
} from '../repositories/index.js';
import {
  Project,
  ProjectType,
  License,
  Font,
  LicenseStatus,
} from '../../shared/types.js';

export class ProjectService {
  private projectRepository = new ProjectRepository();
  private licenseRepository = new LicenseRepository();
  private certificateRepository = new CertificateRepository();
  private fontRepository = new FontRepository();

  getUserProjects(
    userId: number,
    options?: {
      type?: string;
      isArchived?: boolean;
      page?: number;
      pageSize?: number;
    }
  ): { data: Project[]; total: number } {
    try {
      return this.projectRepository.findByUserId(userId, options);
    } catch (error) {
      console.error('Get user projects error:', error);
      return { data: [], total: 0 };
    }
  }

  getProjectById(
    id: number,
    userId: number
  ): (Project & { license: License & { font: Font } }) | undefined {
    try {
      return this.projectRepository.findByIdAndUserId(id, userId);
    } catch (error) {
      console.error('Get project by id error:', error);
      return undefined;
    }
  }

  createProject(
    userId: number,
    data: {
      name: string;
      description?: string;
      type: ProjectType;
      licenseId: number;
      startDate: string;
      endDate?: string;
    }
  ): Project {
    try {
      const license = this.licenseRepository.findByIdAndUserId(data.licenseId, userId);

      if (!license) {
        throw new Error('License not found');
      }

      if (license.status === 'expired') {
        throw new Error('License has expired, cannot create new project');
      }

      if (!license.allowedProjectTypes.includes(data.type)) {
        throw new Error('Project type not allowed by this license');
      }

      if (license.usedProjects >= license.maxProjects) {
        throw new Error('License project quota exceeded');
      }

      const projectData = {
        name: data.name,
        description: data.description || '',
        type: data.type,
        userId,
        licenseId: data.licenseId,
        startDate: data.startDate,
        endDate: data.endDate,
        isArchived: false,
      };
      const project = this.projectRepository.create(projectData);

      this.licenseRepository.update(data.licenseId, {
        usedProjects: license.usedProjects + 1,
      });

      this.createCertificate(project, license);

      return project;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  }

  private createCertificate(project: Project, license: License & { font: Font }): void {
    try {
      const certificateNumber = this.generateCertificateNumber();
      const digitalSignature = this.generateDigitalSignature();

      this.certificateRepository.create({
        projectId: project.id,
        licenseId: project.licenseId,
        fontId: license.fontId,
        validFrom: project.startDate,
        validTo: license.endDate,
        certificateNumber,
        digitalSignature,
      });
    } catch (error) {
      console.error('Create certificate error:', error);
    }
  }

  private generateCertificateNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `CERT-${year}${month}${day}-${random}`;
  }

  private generateDigitalSignature(): string {
    const chars = '0123456789abcdef';
    let sig = 'SIG-0x';
    for (let i = 0; i < 40; i++) {
      sig += chars[Math.floor(Math.random() * chars.length)];
    }
    return sig;
  }
}
