import { Router, type Response } from 'express';
import { ProjectService } from '../services/ProjectService.js';
import { authMiddleware, requireRole, type AuthRequest } from '../middleware/auth.js';
import type { Project, ProjectType } from '../../shared/types.js';

const router = Router();
const projectService = new ProjectService();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const type = req.query.type as ProjectType | undefined;
    const isArchived = req.query.isArchived === 'true';

    const result = projectService.getUserProjects(userId, { page, pageSize, type, isArchived });

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
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: '获取项目列表失败',
    });
  }
});

router.post('/', authMiddleware, requireRole('brand'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, description, type, licenseId, startDate, endDate } = req.body as Omit<Project, 'id' | 'userId' | 'createdAt' | 'isArchived'>;

    if (!name || !type || !licenseId || !startDate) {
      res.status(400).json({
        success: false,
        error: '请填写完整的项目信息',
      });
      return;
    }

    const project = projectService.createProject(userId, {
      name,
      description,
      type,
      licenseId,
      startDate,
      endDate,
    });

    res.json({
      success: true,
      data: project,
      message: '项目创建成功',
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || '创建项目失败',
    });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id);
    const project = projectService.getProjectById(id, userId);

    if (!project) {
      res.status(404).json({
        success: false,
        error: '项目不存在',
      });
      return;
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: '获取项目详情失败',
    });
  }
});

router.post('/:id/archive', authMiddleware, requireRole('brand'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { ProjectRepository } = await import('../repositories/ProjectRepository.js');
    const repo = new ProjectRepository();
    const success = repo.archive(id);

    if (!success) {
      res.status(404).json({
        success: false,
        error: '项目不存在或归档失败',
      });
      return;
    }

    res.json({
      success: true,
      message: '项目已归档',
    });
  } catch (error) {
    console.error('Archive project error:', error);
    res.status(500).json({
      success: false,
      error: '归档项目失败',
    });
  }
});

export default router;
