import { getDb } from '../database';
import type { License, LicenseStatus, ProjectType, Font } from '../../shared/types';

export class LicenseRepository {
  private db = getDb();

  private mapRowToLicense(row: any): License {
    return {
      id: row.id,
      fontId: row.font_id,
      userId: row.user_id,
      purchaseDate: row.purchase_date,
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      allowedProjectTypes: JSON.parse(row.allowed_project_types),
      maxProjects: row.max_projects,
      usedProjects: row.used_projects,
      price: row.price,
      transactionId: row.transaction_id,
    };
  }

  private mapRowToLicenseWithFont(row: any): License & { font: Font } {
    return {
      ...this.mapRowToLicense(row),
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
    options?: { status?: string; page?: number; pageSize?: number }
  ): { data: License[]; total: number } {
    const { page = 1, pageSize = 10, status } = options || {};

    const whereClauses: string[] = ['user_id = ?'];
    const params: any[] = [userId];

    if (status) {
      whereClauses.push('status = ?');
      params.push(status);
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

    const totalRow = this.db
      .prepare(`SELECT COUNT(*) as count FROM licenses ${whereSql}`)
      .get(...params) as any;
    const total = totalRow.count;

    const offset = (page - 1) * pageSize;
    const rows = this.db
      .prepare(`SELECT * FROM licenses ${whereSql} ORDER BY purchase_date DESC LIMIT ? OFFSET ?`)
      .all(...params, pageSize, offset) as any[];

    return {
      data: rows.map((row) => this.mapRowToLicense(row)),
      total,
    };
  }

  findById(id: number): License | undefined {
    const row = this.db.prepare('SELECT * FROM licenses WHERE id = ?').get(id) as any;

    if (!row) return undefined;

    return this.mapRowToLicense(row);
  }

  findByIdAndUserId(id: number, userId: number): (License & { font: Font }) | undefined {
    const row = this.db
      .prepare(
        `SELECT l.*, 
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
         FROM licenses l
         INNER JOIN fonts f ON l.font_id = f.id
         WHERE l.id = ? AND l.user_id = ?`
      )
      .get(id, userId) as any;

    if (!row) return undefined;

    return this.mapRowToLicenseWithFont(row);
  }

  findByIdWithFont(id: number, userId?: number): (License & { font: Font }) | undefined {
    const whereClauses: string[] = ['l.id = ?'];
    const params: any[] = [id];

    if (userId !== undefined) {
      whereClauses.push('l.user_id = ?');
      params.push(userId);
    }

    const row = this.db
      .prepare(
        `SELECT l.*, 
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
         FROM licenses l
         INNER JOIN fonts f ON l.font_id = f.id
         WHERE ${whereClauses.join(' AND ')}`
      )
      .get(...params) as any;

    if (!row) return undefined;

    return this.mapRowToLicenseWithFont(row);
  }

  create(data: Omit<License, 'id' | 'purchaseDate' | 'usedProjects'>): License {
    const result = this.db
      .prepare(
        `INSERT INTO licenses (font_id, user_id, start_date, end_date, status, allowed_project_types, max_projects, price, transaction_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.fontId,
        data.userId,
        data.startDate,
        data.endDate,
        data.status,
        JSON.stringify(data.allowedProjectTypes),
        data.maxProjects,
        data.price,
        data.transactionId
      );

    const id = result.lastInsertRowid as number;
    const license = this.findById(id);
    return license!;
  }

  update(id: number, data: Partial<License>): boolean {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.startDate !== undefined) {
      fields.push('start_date = ?');
      params.push(data.startDate);
    }
    if (data.endDate !== undefined) {
      fields.push('end_date = ?');
      params.push(data.endDate);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      params.push(data.status);
    }
    if (data.allowedProjectTypes !== undefined) {
      fields.push('allowed_project_types = ?');
      params.push(JSON.stringify(data.allowedProjectTypes));
    }
    if (data.maxProjects !== undefined) {
      fields.push('max_projects = ?');
      params.push(data.maxProjects);
    }
    if (data.usedProjects !== undefined) {
      fields.push('used_projects = ?');
      params.push(data.usedProjects);
    }
    if (data.price !== undefined) {
      fields.push('price = ?');
      params.push(data.price);
    }

    if (fields.length === 0) return false;

    params.push(id);
    const result = this.db
      .prepare(`UPDATE licenses SET ${fields.join(', ')} WHERE id = ?`)
      .run(...params);

    return result.changes > 0;
  }

  updateStatus(id: number, status: string): boolean {
    const result = this.db
      .prepare('UPDATE licenses SET status = ? WHERE id = ?')
      .run(status, id);

    return result.changes > 0;
  }

  incrementUsedProjects(id: number): boolean {
    const result = this.db
      .prepare('UPDATE licenses SET used_projects = used_projects + 1 WHERE id = ?')
      .run(id);

    return result.changes > 0;
  }

  findAllByUserId(userId: number): License[] {
    const rows = this.db
      .prepare('SELECT * FROM licenses WHERE user_id = ? ORDER BY purchase_date DESC')
      .all(userId) as any[];

    return rows.map((row) => this.mapRowToLicense(row));
  }
}
