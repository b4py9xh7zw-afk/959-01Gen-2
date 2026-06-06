import { Router, type Response } from 'express';
import { StatsService } from '../services/StatsService.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();
const statsService = new StatsService();

router.get('/dashboard', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const stats = statsService.getDashboardStats(userId, role);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: '获取统计数据失败',
    });
  }
});

export default router;
