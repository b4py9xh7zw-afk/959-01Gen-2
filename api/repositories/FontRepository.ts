import { getDb } from '../database';
import { Font } from '../../shared/types';

export class FontRepository {
  private db = getDb();

  private mapRowToFont(row: any): Font {
    return {
      id: row.id,
      name: row.name,
      family: row.family,
      designer: row.designer,
      description: row.description,
      previewText: row.preview_text,
      weights: JSON.parse(row.weights),
      languages: JSON.parse(row.languages),
      style: row.style,
      price: row.price,
      currency: row.currency,
      coverImage: row.cover_image,
      sampleImages: JSON.parse(row.sample_images || '[]'),
      createdAt: row.created_at,
    };
  }

  findAll(options?: { page?: number; pageSize?: number; style?: string; search?: string }): {
    data: Font[];
    total: number;
  } {
    const { page = 1, pageSize = 10, style, search } = options || {};

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (style) {
      whereClauses.push('style = ?');
      params.push(style);
    }

    if (search) {
      whereClauses.push('(name LIKE ? OR family LIKE ? OR designer LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const totalRow = this.db
      .prepare(`SELECT COUNT(*) as count FROM fonts ${whereSql}`)
      .get(...params) as any;
    const total = totalRow.count;

    const offset = (page - 1) * pageSize;
    const rows = this.db
      .prepare(`SELECT * FROM fonts ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .all(...params, pageSize, offset) as any[];

    return {
      data: rows.map((row) => this.mapRowToFont(row)),
      total,
    };
  }

  findById(id: number): Font | undefined {
    const row = this.db.prepare('SELECT * FROM fonts WHERE id = ?').get(id) as any;

    if (!row) return undefined;

    return this.mapRowToFont(row);
  }
}
