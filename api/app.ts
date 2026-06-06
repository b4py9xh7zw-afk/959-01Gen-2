/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js';
import fontsRoutes from './routes/fonts.js';
import licensesRoutes from './routes/licenses.js';
import projectsRoutes from './routes/projects.js';
import downloadsRoutes from './routes/downloads.js';
import certificatesRoutes from './routes/certificates.js';
import statsRoutes from './routes/stats.js';

import { getDb } from './database.js';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load env
dotenv.config();

// 初始化数据库
getDb();

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/fonts', fontsRoutes);
app.use('/api/licenses', licensesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/downloads', downloadsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/stats', statsRoutes);

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
