import { Router, type Response } from 'express';
import { DownloadService } from '../services/DownloadService.js';
import { authMiddleware, requireRole, type AuthRequest } from '../middleware/auth.js';

const router = Router();
const downloadService = new DownloadService();

router.get('/', authMiddleware, requireRole('designer'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const result = downloadService.getDownloadableFonts(userId);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: 1,
        pageSize: result.total,
        total: result.total,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error('Get downloadable fonts error:', error);
    res.status(500).json({
      success: false,
      error: '获取可下载字体列表失败',
    });
  }
});

router.get('/:id', authMiddleware, requireRole('designer'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const fontId = parseInt(req.params.id);
    const { FontRepository } = await import('../repositories/FontRepository.js');
    const repo = new FontRepository();
    const font = repo.findById(fontId);

    if (!font) {
      res.status(404).json({
        success: false,
        error: '字体不存在',
      });
      return;
    }

    const downloadableFonts = downloadService.getDownloadableFonts(userId);
    const fontInfo = downloadableFonts.data.find(f => f.id === fontId);

    if (!fontInfo) {
      res.status(403).json({
        success: false,
        error: '您没有该字体的下载权限',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        ...font,
        availableScenes: fontInfo.availableScenes,
        endDate: fontInfo.endDate,
        license: fontInfo.license,
        project: fontInfo.project,
      },
    });
  } catch (error) {
    console.error('Get font detail error:', error);
    res.status(500).json({
      success: false,
      error: '获取字体详情失败',
    });
  }
});

router.post('/:id', authMiddleware, requireRole('designer'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const fontId = parseInt(req.params.id);
    const { projectId, weight } = req.body;

    if (!projectId || !weight) {
      res.status(400).json({
        success: false,
        error: '请选择项目和字重',
      });
      return;
    }

    const ipAddress = (req.headers['x-forwarded-for'] as string) || 
                      (req.socket.remoteAddress as string) || 
                      '127.0.0.1';

    const result = downloadService.downloadFont(userId, fontId, projectId, weight, ipAddress);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.message,
      });
      return;
    }

    res.json({
      success: true,
      message: result.message,
      data: {
        downloadUrl: `/api/downloads/${fontId}/file?weight=${weight}&projectId=${projectId}`,
        filename: `${fontId}-${weight}.ttf`,
      },
    });
  } catch (error) {
    console.error('Download font error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || '下载失败',
    });
  }
});

router.get('/:id/file', authMiddleware, requireRole('designer'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fontId = parseInt(req.params.id);
    const weight = parseInt(req.query.weight as string);

    const { FontRepository } = await import('../repositories/FontRepository.js');
    const repo = new FontRepository();
    const font = repo.findById(fontId);

    if (!font) {
      res.status(404).json({
        success: false,
        error: '字体不存在',
      });
      return;
    }

    const fileName = `${font.family}-${weight}.ttf`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'font/ttf');
    
    const placeholderContent = Buffer.from(`This is a placeholder for ${font.name} weight ${weight}. In production, this would be the actual font file.`);
    res.send(placeholderContent);
  } catch (error) {
    console.error('Download font file error:', error);
    res.status(500).json({
      success: false,
      error: '下载字体文件失败',
    });
  }
});

export default router;
