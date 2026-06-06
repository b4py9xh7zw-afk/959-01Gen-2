import { getDb } from '../database';
import { User, UserRole } from '../../shared/types';

export class UserRepository {
  private db = getDb();

  findByEmailAndRole(email: string, role: UserRole): (User & { password_hash: string }) | undefined {
    const row = this.db
      .prepare(
        `SELECT id, email, password_hash, name, role, company, created_at as createdAt
         FROM users WHERE email = ? AND role = ?`
      )
      .get(email, role) as any;

    if (!row) return undefined;

    return {
      id: row.id,
      email: row.email,
      password_hash: row.password_hash,
      name: row.name,
      role: row.role as UserRole,
      company: row.company,
      createdAt: row.createdAt,
    };
  }

  findById(id: number): User | undefined {
    const row = this.db
      .prepare(
        `SELECT id, email, name, role, company, created_at as createdAt
         FROM users WHERE id = ?`
      )
      .get(id) as any;

    if (!row) return undefined;

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role as UserRole,
      company: row.company,
      createdAt: row.createdAt,
    };
  }
}
