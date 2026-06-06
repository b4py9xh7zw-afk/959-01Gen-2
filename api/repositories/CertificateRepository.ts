import { getDb } from '../database';
import type { Certificate, Project, License, Font } from '../../shared/types';

export class CertificateRepository {
  private db = getDb();

  private mapRowToCertificate(
    row: any
  ): Certificate & { project: Project; license: License; font: Font } {
    return {
      id: row.id,
      projectId: row.project_id,
      licenseId: row.license_id,
      fontId: row.font_id,
      issuedAt: row.issued_at,
      validFrom: row.valid_from,
      validTo: row.valid_to,
      certificateNumber: row.certificate_number,
      digitalSignature: row.digital_signature,
      project: {
        id: row.project_id,
        name: row.project_name,
        description: row.project_description,
        type: row.project_type,
        userId: row.project_user_id,
        licenseId: row.project_license_id,
        isArchived: Boolean(row.project_is_archived),
        createdAt: row.project_created_at,
        startDate: row.project_start_date,
        endDate: row.project_end_date,
      },
      license: {
        id: row.license_id,
        fontId: row.license_font_id,
        userId: row.license_user_id,
        purchaseDate: row.license_purchase_date,
        startDate: row.license_start_date,
        endDate: row.license_end_date,
        status: row.license_status,
        allowedProjectTypes: JSON.parse(row.license_allowed_project_types),
        maxProjects: row.license_max_projects,
        usedProjects: row.license_used_projects,
        price: row.license_price,
        transactionId: row.license_transaction_id,
      },
      font: {
        id: row.font_id,
        name: row.font_name,
        family: row.font_family,
        designer: row.font_designer,
        description: row.font_description,
        previewText: row.font_preview_text,
        weights: JSON.parse(row.font_weights),
        languages: JSON.parse(row.font_languages),
        style: row.font_style,
        price: row.font_price,
        currency: row.font_currency,
        coverImage: row.font_cover_image,
        sampleImages: JSON.parse(row.font_sample_images || '[]'),
        createdAt: row.font_created_at,
      },
    };
  }

  findByUserId(
    userId: number,
    options?: { page?: number; pageSize?: number }
  ): {
    data: (Certificate & { project: Project; license: License; font: Font })[];
    total: number;
  } {
    const { page = 1, pageSize = 10 } = options || {};

    const totalRow = this.db
      .prepare(
        `SELECT COUNT(*) as count 
         FROM certificates c
         INNER JOIN projects p ON c.project_id = p.id
         WHERE p.user_id = ?`
      )
      .get(userId) as any;
    const total = totalRow.count;

    const offset = (page - 1) * pageSize;
    const rows = this.db
      .prepare(
        `SELECT c.*,
                p.id as project_id,
                p.name as project_name,
                p.description as project_description,
                p.type as project_type,
                p.user_id as project_user_id,
                p.license_id as project_license_id,
                p.is_archived as project_is_archived,
                p.created_at as project_created_at,
                p.start_date as project_start_date,
                p.end_date as project_end_date,
                l.id as license_id,
                l.font_id as license_font_id,
                l.user_id as license_user_id,
                l.purchase_date as license_purchase_date,
                l.start_date as license_start_date,
                l.end_date as license_end_date,
                l.status as license_status,
                l.allowed_project_types as license_allowed_project_types,
                l.max_projects as license_max_projects,
                l.used_projects as license_used_projects,
                l.price as license_price,
                l.transaction_id as license_transaction_id,
                f.id as font_id,
                f.name as font_name,
                f.family as font_family,
                f.designer as font_designer,
                f.description as font_description,
                f.preview_text as font_preview_text,
                f.weights as font_weights,
                f.languages as font_languages,
                f.style as font_style,
                f.price as font_price,
                f.currency as font_currency,
                f.cover_image as font_cover_image,
                f.sample_images as font_sample_images,
                f.created_at as font_created_at
         FROM certificates c
         INNER JOIN projects p ON c.project_id = p.id
         INNER JOIN licenses l ON c.license_id = l.id
         INNER JOIN fonts f ON c.font_id = f.id
         WHERE p.user_id = ?
         ORDER BY c.issued_at DESC
         LIMIT ? OFFSET ?`
      )
      .all(userId, pageSize, offset) as any[];

    return {
      data: rows.map((row) => this.mapRowToCertificate(row)),
      total,
    };
  }

  findById(
    id: number,
    userId?: number
  ): (Certificate & { project: Project; license: License; font: Font }) | undefined {
    const whereClauses: string[] = ['c.id = ?'];
    const params: any[] = [id];

    if (userId !== undefined) {
      whereClauses.push('p.user_id = ?');
      params.push(userId);
    }

    const row = this.db
      .prepare(
        `SELECT c.*,
                p.id as project_id,
                p.name as project_name,
                p.description as project_description,
                p.type as project_type,
                p.user_id as project_user_id,
                p.license_id as project_license_id,
                p.is_archived as project_is_archived,
                p.created_at as project_created_at,
                p.start_date as project_start_date,
                p.end_date as project_end_date,
                l.id as license_id,
                l.font_id as license_font_id,
                l.user_id as license_user_id,
                l.purchase_date as license_purchase_date,
                l.start_date as license_start_date,
                l.end_date as license_end_date,
                l.status as license_status,
                l.allowed_project_types as license_allowed_project_types,
                l.max_projects as license_max_projects,
                l.used_projects as license_used_projects,
                l.price as license_price,
                l.transaction_id as license_transaction_id,
                f.id as font_id,
                f.name as font_name,
                f.family as font_family,
                f.designer as font_designer,
                f.description as font_description,
                f.preview_text as font_preview_text,
                f.weights as font_weights,
                f.languages as font_languages,
                f.style as font_style,
                f.price as font_price,
                f.currency as font_currency,
                f.cover_image as font_cover_image,
                f.sample_images as font_sample_images,
                f.created_at as font_created_at
         FROM certificates c
         INNER JOIN projects p ON c.project_id = p.id
         INNER JOIN licenses l ON c.license_id = l.id
         INNER JOIN fonts f ON c.font_id = f.id
         WHERE ${whereClauses.join(' AND ')}`
      )
      .get(...params) as any;

    if (!row) return undefined;

    return this.mapRowToCertificate(row);
  }

  create(data: Omit<Certificate, 'id' | 'issuedAt'>): Certificate {
    const result = this.db
      .prepare(
        `INSERT INTO certificates (project_id, license_id, font_id, valid_from, valid_to, certificate_number, digital_signature)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.projectId,
        data.licenseId,
        data.fontId,
        data.validFrom,
        data.validTo,
        data.certificateNumber,
        data.digitalSignature
      );

    const id = result.lastInsertRowid as number;
    const row = this.db.prepare(
      `SELECT id, project_id, license_id, font_id, issued_at, valid_from, valid_to, certificate_number, digital_signature
       FROM certificates WHERE id = ?`
    ).get(id) as any;

    return {
      id: row.id,
      projectId: row.project_id,
      licenseId: row.license_id,
      fontId: row.font_id,
      issuedAt: row.issued_at,
      validFrom: row.valid_from,
      validTo: row.valid_to,
      certificateNumber: row.certificate_number,
      digitalSignature: row.digital_signature,
    };
  }

  findByIdAndUserId(
    id: number,
    userId: number
  ): (Certificate & { project: Project; license: License; font: Font }) | undefined {
    return this.findById(id, userId);
  }
}
