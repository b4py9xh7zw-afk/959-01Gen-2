import { Router, type Request, type Response } from 'express';
import { FontService } from '../services/FontService.js';
import { authMiddleware, requireRole, type AuthRequest } from '../middleware/auth.js';

const router = Router();
const fontService = new FontService();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 12;
    const style = req.query.style as string | undefined;
    const search = req.query.search as string | undefined;

    const result = fontService.getFonts({ page, pageSize, style, search });

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
    console.error('Get fonts error:', error);
    res.status(500).json({
      success: false,
      error: '获取字体列表失败',
    });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const font = fontService.getFontById(id);

    if (!font) {
      res.status(404).json({
        success: false,
        error: '字体不存在',
      });
      return;
    }

    res.json({
      success: true,
      data: font,
    });
  } catch (error) {
    console.error('Get font error:', error);
    res.status(500).json({
      success: false,
      error: '获取字体详情失败',
    });
  }
});

router.post('/:id/purchase', authMiddleware, requireRole('brand'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const fontId = parseInt(req.params.id);
    const { durationMonths, allowedProjectTypes, maxProjects } = req.body;

    if (!durationMonths || !allowedProjectTypes || !maxProjects) {
      res.status(400).json({
        success: false,
        error: '请填写完整的购买信息',
      });
      return;
    }

    const { LicenseService } = await import('../services/LicenseService.js');
    const service = new LicenseService();
    const license = service.purchaseLicense(userId, fontId, {
      durationMonths,
      allowedProjectTypes,
      maxProjects,
    });

    res.json({
      success: true,
      data: license,
      message: '购买成功',
    });
  } catch (error) {
    console.error('Purchase font error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || '购买失败，请稍后重试',
    });
  }
});

export default router;
