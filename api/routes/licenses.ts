import { Router, type Response } from 'express';
import { LicenseService } from '../services/LicenseService.js';
import { authMiddleware, requireRole, type AuthRequest } from '../middleware/auth.js';
import type { License } from '../../shared/types.js';

const router = Router();
const licenseService = new LicenseService();

router.get('/', authMiddleware, requireRole('brand'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const status = req.query.status as string | undefined;

    const result = licenseService.getUserLicenses(userId, { page, pageSize, status });

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize),
      },
    });
  } catch (error) {
    console.error('Get licenses error:', error);
    res.status(500).json({
      success: false,
      error: '获取授权列表失败',
    });
  }
});

router.get('/:id', authMiddleware, requireRole('brand'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id);
    const license = licenseService.getLicenseById(id, userId);

    if (!license) {
      res.status(404).json({
        success: false,
        error: '授权不存在',
      });
      return;
    }

    res.json({
      success: true,
      data: license,
    });
  } catch (error) {
    console.error('Get license error:', error);
    res.status(500).json({
      success: false,
      error: '获取授权详情失败',
    });
  }
});

router.put('/:id', authMiddleware, requireRole('brand'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id);
    const { allowedProjectTypes, endDate } = req.body as Partial<License>;

    const success = licenseService.updateLicense(id, userId, {
      allowedProjectTypes,
      endDate,
    });

    if (!success) {
      res.status(404).json({
        success: false,
        error: '授权不存在或更新失败',
      });
      return;
    }

    res.json({
      success: true,
      message: '授权信息已更新',
    });
  } catch (error) {
    console.error('Update license error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || '更新授权失败',
    });
  }
});

router.post('/:id/renew', authMiddleware, requireRole('brand'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id);
    const { durationMonths } = req.body;

    if (!durationMonths) {
      res.status(400).json({
        success: false,
        error: '请指定续期时长',
      });
      return;
    }

    const success = licenseService.renewLicense(id, userId, durationMonths);

    if (!success) {
      res.status(404).json({
        success: false,
        error: '授权不存在或续期失败',
      });
      return;
    }

    res.json({
      success: true,
      message: '授权续期成功',
    });
  } catch (error) {
    console.error('Renew license error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || '续期失败',
    });
  }
});

export default router;
