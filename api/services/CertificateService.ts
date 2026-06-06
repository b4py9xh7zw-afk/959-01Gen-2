import { CertificateRepository } from '../repositories/index';

export class CertificateService {
  private certificateRepository = new CertificateRepository();

  getUserCertificates(
    userId: number,
    options?: { page?: number; pageSize?: number }
  ): { data: any[]; total: number } {
    try {
      return this.certificateRepository.findByUserId(userId, options);
    } catch (error) {
      console.error('Get user certificates error:', error);
      return { data: [], total: 0 };
    }
  }

  getCertificateById(id: number, userId: number): any | undefined {
    try {
      return this.certificateRepository.findByIdAndUserId(id, userId);
    } catch (error) {
      console.error('Get certificate by id error:', error);
      return undefined;
    }
  }

  exportCertificate(
    id: number,
    userId: number
  ): { success: boolean; data: string } {
    try {
      const certificate = this.certificateRepository.findByIdAndUserId(id, userId);

      if (!certificate) {
        return { success: false, data: '' };
      }

      const exportData = {
        certificate: {
          id: certificate.id,
          certificateNumber: certificate.certificateNumber,
          issuedAt: certificate.issuedAt,
          validFrom: certificate.validFrom,
          validTo: certificate.validTo,
          digitalSignature: certificate.digitalSignature,
        },
        project: certificate.project,
        license: certificate.license,
        font: certificate.font,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };

      return {
        success: true,
        data: JSON.stringify(exportData, null, 2),
      };
    } catch (error) {
      console.error('Export certificate error:', error);
      return { success: false, data: '' };
    }
  }
}
