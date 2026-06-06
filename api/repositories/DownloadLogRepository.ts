import { getDb } from '../database';
import type { DownloadLog } from '../../shared/types';

export class DownloadLogRepository {
  private db = getDb();

  private mapRowToDownloadLog(row: any): DownloadLog {
    return {
      id: row.id,
      userId: row.user_id,
      fontId: row.font_id,
      projectId: row.project_id,
      weight: row.weight,
      downloadedAt: row.downloaded_at,
      ipAddress: row.ip_address,
    };
  }

  findByUserId(
    userId: number,
    options?: { page?: number; pageSize?: number }
  ): { data: DownloadLog[]; total: number } {
    const { page = 1, pageSize = 10 } = options || {};

    const totalRow = this.db
      .prepare('SELECT COUNT(*) as count FROM download_logs WHERE user_id = ?')
      .get(userId) as any;
    const total = totalRow.count;

    const offset = (page - 1) * pageSize;
    const rows = this.db
      .prepare(
        'SELECT * FROM download_logs WHERE user_id = ? ORDER BY downloaded_at DESC LIMIT ? OFFSET ?'
      )
      .all(userId, pageSize, offset) as any[];

    return {
      data: rows.map((row) => this.mapRowToDownloadLog(row)),
      total,
    };
  }

  create(data: Omit<DownloadLog, 'id' | 'downloadedAt'>): DownloadLog {
    const result = this.db
      .prepare(
        `INSERT INTO download_logs (user_id, font_id, project_id, weight, ip_address)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(data.userId, data.fontId, data.projectId, data.weight, data.ipAddress);

    const id = result.lastInsertRowid as number;
    const row = this.db.prepare('SELECT * FROM download_logs WHERE id = ?').get(id) as any;
    return this.mapRowToDownloadLog(row);
  }

  countByMonth(userId: number): number {
    const row = this.db
      .prepare(
        `SELECT COUNT(*) as count 
         FROM download_logs 
         WHERE user_id = ? 
         AND strftime('%Y-%m', downloaded_at) = strftime('%Y-%m', 'now')`
      )
      .get(userId) as any;

    return row.count;
  }

  countTotal(userId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) as count FROM download_logs WHERE user_id = ?')
      .get(userId) as any;

    return row.count;
  }

  countByUserIdAndMonth(userId: number, year: number, month: number): number {
    const row = this.db
      .prepare(
        `SELECT COUNT(*) as count FROM download_logs
         WHERE user_id = ? AND strftime('%Y', downloaded_at) = ? AND strftime('%m', downloaded_at) = ?`
      )
      .get(userId, String(year), String(month).padStart(2, '0')) as { count: number };
    return row.count;
  }

  countByUserId(userId: number): number {
    return this.countTotal(userId);
  }

  findRecentByUserId(userId: number, limit: number = 10): DownloadLog[] {
    const rows = this.db
      .prepare(
        `SELECT * FROM download_logs WHERE user_id = ?
         ORDER BY downloaded_at DESC
         LIMIT ?`
      )
      .all(userId, limit) as any[];

    return rows.map((row) => this.mapRowToDownloadLog(row));
  }
}
