import { Router, type Request, type Response } from 'express';
import { AuthService } from '../services/AuthService.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';
import type { LoginRequest } from '../../shared/types.js';

const router = Router();
const authService = new AuthService();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body as LoginRequest;

    if (!email || !password || !role) {
      res.status(400).json({
        success: false,
        error: '请填写完整的登录信息',
      });
      return;
    }

    const result = authService.login(email, password, role);

    if (!result) {
      res.status(401).json({
        success: false,
        error: '邮箱、密码或角色不正确',
      });
      return;
    }

    res.json({
      success: true,
      data: result,
      message: '登录成功',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: '登录失败，请稍后重试',
    });
  }
});

router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: '未登录',
      });
      return;
    }

    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: '获取用户信息失败',
    });
  }
});

router.post('/logout', (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: '已退出登录',
  });
});

export default router;
