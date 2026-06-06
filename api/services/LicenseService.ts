import { LicenseRepository, FontRepository } from '../repositories/index';
import { License, LicenseStatus, ProjectType, Font } from '../../shared/types';

export class LicenseService {
  private licenseRepository = new LicenseRepository();
  private fontRepository = new FontRepository();

  getUserLicenses(
    userId: number,
    options?: { status?: string; page?: number; pageSize?: number }
  ): { data: License[]; total: number } {
    try {
      const result = this.licenseRepository.findByUserId(userId, options);
      result.data.forEach((license) => this.updateLicenseStatus(license.id));
      return this.licenseRepository.findByUserId(userId, options);
    } catch (error) {
      console.error('Get user licenses error:', error);
      return { data: [], total: 0 };
    }
  }

  getLicenseById(
    id: number,
    userId: number
  ): (License & { font: Font }) | undefined {
    try {
      this.updateLicenseStatus(id);
      return this.licenseRepository.findByIdAndUserId(id, userId);
    } catch (error) {
      console.error('Get license by id error:', error);
      return undefined;
    }
  }

  purchaseLicense(
    userId: number,
    fontId: number,
    options: {
      durationMonths: number;
      allowedProjectTypes: ProjectType[];
      maxProjects: number;
    }
  ): License {
    try {
      const font = this.fontRepository.findById(fontId);
      if (!font) {
        throw new Error('Font not found');
      }

      const now = new Date();
      const startDate = now.toISOString();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + options.durationMonths);

      const transactionId = this.generateTransactionId();

      const price = this.calculatePrice(font.price, options.durationMonths);

      const license = this.licenseRepository.create({
        fontId,
        userId,
        startDate,
        endDate: endDate.toISOString(),
        status: 'active',
        allowedProjectTypes: options.allowedProjectTypes,
        maxProjects: options.maxProjects,
        price,
        transactionId,
      });

      return license;
    } catch (error) {
      console.error('Purchase license error:', error);
      throw error;
    }
  }

  updateLicense(
    id: number,
    userId: number,
    data: {
      allowedProjectTypes?: ProjectType[];
      endDate?: string;
    }
  ): boolean {
    try {
      const license = this.licenseRepository.findByIdAndUserId(id, userId);
      if (!license) {
        return false;
      }

      const updateData: {
        allowedProjectTypes?: ProjectType[];
        endDate?: string;
        status?: LicenseStatus;
      } = {};

      if (data.allowedProjectTypes !== undefined) {
        updateData.allowedProjectTypes = data.allowedProjectTypes;
      }

      if (data.endDate !== undefined) {
        updateData.endDate = data.endDate;
        const newStatus = this.calculateLicenseStatus(data.endDate);
        updateData.status = newStatus;
      }

      return this.licenseRepository.update(id, updateData);
    } catch (error) {
      console.error('Update license error:', error);
      return false;
    }
  }

  renewLicense(
    id: number,
    userId: number,
    durationMonths: number
  ): boolean {
    try {
      const license = this.licenseRepository.findByIdAndUserId(id, userId);
      if (!license) {
        return false;
      }

      const currentEndDate = new Date(license.endDate);
      const now = new Date();
      const startDate = currentEndDate > now ? currentEndDate : now;
      const newEndDate = new Date(startDate);
      newEndDate.setMonth(newEndDate.getMonth() + durationMonths);

      const newStatus = this.calculateLicenseStatus(newEndDate.toISOString());

      return this.licenseRepository.update(id, {
        endDate: newEndDate.toISOString(),
        status: newStatus,
      });
    } catch (error) {
      console.error('Renew license error:', error);
      return false;
    }
  }

  private updateLicenseStatus(id: number): void {
    try {
      const license = this.licenseRepository.findById(id);
      if (!license) return;

      const currentStatus = license.status;
      const newStatus = this.calculateLicenseStatus(license.endDate);

      if (currentStatus !== newStatus) {
        this.licenseRepository.update(id, { status: newStatus });
      }
    } catch (error) {
      console.error('Update license status error:', error);
    }
  }

  private calculateLicenseStatus(endDate: string): LicenseStatus {
    const now = new Date();
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return 'expired';
    } else if (diffDays <= 30) {
      return 'expiring';
    }
    return 'active';
  }

  private generateTransactionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `TXN${timestamp}${random}`;
  }

  private calculatePrice(basePrice: number, durationMonths: number): number {
    const yearlyDiscount = durationMonths >= 12 ? 0.8 : 1;
    return Math.round(basePrice * (durationMonths / 12) * yearlyDiscount * 100) / 100;
  }
}
