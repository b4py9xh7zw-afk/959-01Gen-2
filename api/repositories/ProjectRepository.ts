import { getDb } from '../database';
import type { Project, License, Font, ProjectType } from '../../shared/types';

export class ProjectRepository {
  private db = getDb();

  private mapRowToProject(row: any): Project {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      userId: row.user_id,
      licenseId: row.license_id,
      isArchived: Boolean(row.is_archived),
      createdAt: row.created_at,
      startDate: row.start_date,
      endDate: row.end_date,
    };
  }

  private mapRowToProjectWithLicense(row: any): Project & { license: License & { font: Font } } {
    return {
      ...this.mapRowToProject(row),
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
      },
    };
  }

  findAllByUserId(userId: number): Project[] {
    const rows = this.db
      .prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId) as any[];

    return rows.map((row) => this.mapRowToProject(row));
  }

  findByUserId(
    userId: number,
    options?: { type?: string; isArchived?: boolean; page?: number; pageSize?: number }
  ): { data: Project[]; total: number } {
    const { page = 1, pageSize = 10, type, isArchived } = options || {};

    const whereClauses: string[] = ['user_id = ?'];
    const params: any[] = [userId];

    if (type) {
      whereClauses.push('type = ?');
      params.push(type);
    }

    if (isArchived !== undefined) {
      whereClauses.push('is_archived = ?');
      params.push(isArchived ? 1 : 0);
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

    const totalRow = this.db
      .prepare(`SELECT COUNT(*) as count FROM projects ${whereSql}`)
      .get(...params) as any;
    const total = totalRow.count;

    const offset = (page - 1) * pageSize;
    const rows = this.db
      .prepare(`SELECT * FROM projects ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .all(...params, pageSize, offset) as any[];

    return {
      data: rows.map((row) => this.mapRowToProject(row)),
      total,
    };
  }

  findById(id: number, userId?: number): Project | undefined {
    const whereClauses: string[] = ['id = ?'];
    const params: any[] = [id];

    if (userId !== undefined) {
      whereClauses.push('user_id = ?');
      params.push(userId);
    }

    const row = this.db
      .prepare(`SELECT * FROM projects WHERE ${whereClauses.join(' AND ')}`)
      .get(...params) as any;

    if (!row) return undefined;

    return this.mapRowToProject(row);
  }

  findByIdAndUserId(
    id: number,
    userId: number
  ): (Project & { license: License & { font: Font } }) | undefined {
    const row = this.db
      .prepare(
        `SELECT p.*,
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
         FROM projects p
         INNER JOIN licenses l ON p.license_id = l.id
         INNER JOIN fonts f ON l.font_id = f.id
         WHERE p.id = ? AND p.user_id = ?`
      )
      .get(id, userId) as any;

    if (!row) return undefined;

    return this.mapRowToProjectWithLicense(row);
  }

  findByIdWithLicense(
    id: number,
    userId?: number
  ): (Project & { license: License & { font: Font } }) | undefined {
    const whereClauses: string[] = ['p.id = ?'];
    const params: any[] = [id];

    if (userId !== undefined) {
      whereClauses.push('p.user_id = ?');
      params.push(userId);
    }

    const row = this.db
      .prepare(
        `SELECT p.*,
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
         FROM projects p
         INNER JOIN licenses l ON p.license_id = l.id
         INNER JOIN fonts f ON l.font_id = f.id
         WHERE ${whereClauses.join(' AND ')}`
      )
      .get(...params) as any;

    if (!row) return undefined;

    return this.mapRowToProjectWithLicense(row);
  }

  create(data: Omit<Project, 'id' | 'createdAt'>): Project {
    const result = this.db
      .prepare(
        `INSERT INTO projects (name, description, type, user_id, license_id, is_archived, start_date, end_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.name,
        data.description,
        data.type,
        data.userId,
        data.licenseId,
        data.isArchived ? 1 : 0,
        data.startDate,
        data.endDate || null
      );

    const id = result.lastInsertRowid as number;
    const project = this.findById(id);
    return project!;
  }

  update(id: number, data: Partial<Project>): boolean {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description);
    }
    if (data.type !== undefined) {
      fields.push('type = ?');
      params.push(data.type);
    }
    if (data.licenseId !== undefined) {
      fields.push('license_id = ?');
      params.push(data.licenseId);
    }
    if (data.isArchived !== undefined) {
      fields.push('is_archived = ?');
      const archivedValue = data.isArchived ? 1 : 0;
      params.push(archivedValue);
    }
    if (data.startDate !== undefined) {
      fields.push('start_date = ?');
      params.push(data.startDate);
    }
    if (data.endDate !== undefined) {
      fields.push('end_date = ?');
      params.push(data.endDate || null);
    }

    if (fields.length === 0) return false;

    params.push(id);
    const result = this.db
      .prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`)
      .run(...params);

    return result.changes > 0;
  }

  archive(id: number): boolean {
    const result = this.db
      .prepare('UPDATE projects SET is_archived = 1 WHERE id = ?')
      .run(id);

    return result.changes > 0;
  }
}
