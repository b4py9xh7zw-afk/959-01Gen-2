import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/index';
import { generateToken } from '../middleware/auth';
import { User, UserRole } from '../../shared/types';

export class AuthService {
  private userRepository = new UserRepository();

  login(
    email: string,
    password: string,
    role: UserRole
  ): { token: string; user: User } | null {
    try {
      const userWithPassword = this.userRepository.findByEmailAndRole(email, role);

      if (!userWithPassword) {
        return null;
      }

      const isPasswordValid = bcrypt.compareSync(password, userWithPassword.password_hash);

      if (!isPasswordValid) {
        return null;
      }

      const user: User = {
        id: userWithPassword.id,
        email: userWithPassword.email,
        name: userWithPassword.name,
        role: userWithPassword.role,
        company: userWithPassword.company,
        createdAt: userWithPassword.createdAt,
      };

      const token = generateToken(user);

      return { token, user };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }
}
