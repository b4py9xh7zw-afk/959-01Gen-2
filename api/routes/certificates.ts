import { Router, type Response } from 'express';
import { CertificateService } from '../services/CertificateService.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();
const certificateService = new CertificateService();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = certificateService.getUserCertificates(userId, { page, pageSize });

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
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      error: '获取授权证明列表失败',
    });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id);
    const certificate = certificateService.getCertificateById(id, userId);

    if (!certificate) {
      res.status(404).json({
        success: false,
        error: '授权证明不存在',
      });
      return;
    }

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      success: false,
      error: '获取授权证明详情失败',
    });
  }
});

router.get('/:id/export', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id);
    const result = certificateService.exportCertificate(id, userId);

    if (!result.success) {
      res.status(404).json({
        success: false,
        error: '授权证明不存在',
      });
      return;
    }

    const certificate = JSON.parse(result.data);
    const fileName = `certificate-${certificate.certificateNumber}.json`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(result.data);
  } catch (error) {
    console.error('Export certificate error:', error);
    res.status(500).json({
      success: false,
      error: '导出授权证明失败',
    });
  }
});

export default router;
