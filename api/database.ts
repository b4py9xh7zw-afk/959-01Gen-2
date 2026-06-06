import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

let db: Database.Database | null = null;

const DB_PATH = path.join(process.cwd(), 'data', 'app.db');

export function getDb(): Database.Database {
  if (!db) {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(db: Database.Database) {
  const migrationTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'").get();
  
  if (!migrationTables) {
    createTables(db);
    seedData(db);
  }
}

function createTables(db: Database.Database) {
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('brand', 'designer')),
      company VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fonts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      family VARCHAR(100) NOT NULL,
      designer VARCHAR(100) NOT NULL,
      description TEXT,
      preview_text TEXT DEFAULT 'The quick brown fox jumps over the lazy dog',
      weights TEXT NOT NULL,
      languages TEXT NOT NULL,
      style VARCHAR(50) NOT NULL CHECK (style IN ('serif', 'sans-serif', 'display', 'monospace')),
      price DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'CNY',
      cover_image VARCHAR(255),
      sample_images TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      font_id INTEGER NOT NULL REFERENCES fonts(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expiring', 'expired')),
      allowed_project_types TEXT NOT NULL,
      max_projects INTEGER NOT NULL DEFAULT 1,
      used_projects INTEGER NOT NULL DEFAULT 0,
      price DECIMAL(10, 2) NOT NULL,
      transaction_id VARCHAR(100) UNIQUE NOT NULL,
      CHECK (start_date < end_date)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      type VARCHAR(50) NOT NULL CHECK (type IN ('website', 'app', 'packaging', 'advertising')),
      user_id INTEGER NOT NULL REFERENCES users(id),
      license_id INTEGER NOT NULL REFERENCES licenses(id),
      is_archived BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      start_date DATETIME NOT NULL,
      end_date DATETIME
    );

    CREATE TABLE IF NOT EXISTS download_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      font_id INTEGER NOT NULL REFERENCES fonts(id),
      project_id INTEGER NOT NULL REFERENCES projects(id),
      weight INTEGER NOT NULL,
      downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address VARCHAR(45)
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      license_id INTEGER NOT NULL REFERENCES licenses(id),
      font_id INTEGER NOT NULL REFERENCES fonts(id),
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      valid_from DATETIME NOT NULL,
      valid_to DATETIME NOT NULL,
      certificate_number VARCHAR(50) UNIQUE NOT NULL,
      digital_signature TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON licenses(user_id);
    CREATE INDEX IF NOT EXISTS idx_licenses_font_id ON licenses(font_id);
    CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_projects_license_id ON projects(license_id);
    CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
    CREATE INDEX IF NOT EXISTS idx_download_logs_user_id ON download_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_download_logs_font_id ON download_logs(font_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_project_id ON certificates(project_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_certificate_number ON certificates(certificate_number);

    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version VARCHAR(50) NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.exec(createTablesSQL);
  db.prepare("INSERT INTO migrations (version) VALUES (?)").run('1.0.0');
}

function seedData(db: Database.Database) {
  const passwordHash1 = bcrypt.hashSync('password123', 10);
  const passwordHash2 = bcrypt.hashSync('password123', 10);

  const insertUsers = db.prepare(`
    INSERT INTO users (email, password_hash, name, role, company) VALUES
    ('brand@example.com', ?, '品牌方管理员', 'brand', '某知名品牌公司'),
    ('designer@example.com', ?, '张设计师', 'designer', '某设计工作室')
  `);
  insertUsers.run(passwordHash1, passwordHash2);

  const insertFonts = db.prepare(`
    INSERT INTO fonts (name, family, designer, description, preview_text, weights, languages, style, price, currency, cover_image, sample_images) VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertFonts.run(
    'Montserrat Regular', 'Montserrat', 'Julieta Ulanovsky', 
    '一款现代几何无衬线字体，适合标题和正文使用。', 
    '敏捷的棕色狐狸跳过懒狗',
    JSON.stringify([300, 400, 500, 600, 700, 800, 900]),
    JSON.stringify(['中文', '英文', '日文']),
    'sans-serif', 2999.00, 'CNY', '/images/fonts/montserrat.jpg',
    JSON.stringify([]),

    'Playfair Display', 'Playfair Display', 'Claus Eggers Sørensen',
    '优雅的过渡衬线字体，具有高对比度和精致的衬线。',
    '敏捷的棕色狐狸跳过懒狗',
    JSON.stringify([400, 500, 600, 700, 800, 900]),
    JSON.stringify(['中文', '英文']),
    'serif', 3999.00, 'CNY', '/images/fonts/playfair.jpg',
    JSON.stringify([]),

    'JetBrains Mono', 'JetBrains Mono', 'JetBrains',
    '专为开发者设计的等宽字体，具有清晰的字符辨识度。',
    'The quick brown fox jumps over the lazy dog',
    JSON.stringify([100, 200, 300, 400, 500, 600, 700, 800]),
    JSON.stringify(['英文']),
    'monospace', 1999.00, 'CNY', '/images/fonts/jetbrains.jpg',
    JSON.stringify([]),

    'Bebas Neue', 'Bebas Neue', 'Ryoichi Tsunekawa',
    '大胆的无衬线字体，非常适合大标题和海报设计。',
    'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG',
    JSON.stringify([400]),
    JSON.stringify(['英文']),
    'display', 1599.00, 'CNY', '/images/fonts/bebas.jpg',
    JSON.stringify([]),

    'Noto Serif SC', 'Noto Serif SC', 'Google',
    '谷歌推出的开源中文衬线字体，覆盖完整的中文简体字符集。',
    '敏捷的棕色狐狸跳过懒狗',
    JSON.stringify([200, 300, 400, 500, 600, 700, 900]),
    JSON.stringify(['中文', '英文']),
    'serif', 4999.00, 'CNY', '/images/fonts/noto-serif.jpg',
    JSON.stringify([])
  );

  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setFullYear(futureDate.getFullYear() + 2);

  const soonDate = new Date(now);
  soonDate.setMonth(soonDate.getMonth() + 1);

  const pastDate = new Date(now);
  pastDate.setFullYear(pastDate.getFullYear() - 1);
  const pastEndDate = new Date(pastDate);
  pastEndDate.setMonth(pastEndDate.getMonth() + 11);

  const insertLicenses = db.prepare(`
    INSERT INTO licenses (font_id, user_id, start_date, end_date, status, allowed_project_types, max_projects, used_projects, price, transaction_id) VALUES
    (1, 1, ?, ?, 'active', ?, 10, 3, 2999.00, 'TXN202501010001'),
    (2, 1, ?, ?, 'expiring', ?, 5, 2, 3999.00, 'TXN202506010002'),
    (3, 1, ?, ?, 'expired', ?, 3, 2, 1999.00, 'TXN202401010003')
  `);

  insertLicenses.run(
    now.toISOString(), futureDate.toISOString(),
    JSON.stringify(['website', 'app', 'advertising']),

    now.toISOString(), soonDate.toISOString(),
    JSON.stringify(['packaging', 'advertising']),

    pastDate.toISOString(), pastEndDate.toISOString(),
    JSON.stringify(['website'])
  );

  const project1Start = new Date(now);
  project1Start.setMonth(project1Start.getMonth() - 3);
  const project1End = new Date(project1Start);
  project1End.setMonth(project1End.getMonth() + 6);

  const project2Start = new Date(now);
  project2Start.setMonth(project2Start.getMonth() - 2);

  const project3Start = new Date(now);
  project3Start.setMonth(project3Start.getMonth() - 1);
  const project3End = new Date(project3Start);
  project3End.setMonth(project3End.getMonth() + 3);

  const project4Start = new Date(now);
  const project4End = new Date(project4Start);
  project4End.setMonth(project4End.getMonth() + 4);

  const project5Start = new Date(now);
  project5Start.setMonth(project5Start.getMonth() - 1);
  const project5End = new Date(project5Start);
  project5End.setMonth(project5End.getMonth() + 4);

  const project6Start = new Date(pastDate);
  project6Start.setMonth(project6Start.getMonth() + 2);
  const project6End = new Date(project6Start);
  project6End.setMonth(project6End.getMonth() + 10);

  const insertProjects = db.prepare(`
    INSERT INTO projects (name, description, type, user_id, license_id, start_date, end_date) VALUES
    (?, ?, 'website', 1, 1, ?, ?),
    (?, ?, 'app', 1, 1, ?, NULL),
    (?, ?, 'advertising', 1, 1, ?, ?),
    (?, ?, 'packaging', 1, 2, ?, ?),
    (?, ?, 'advertising', 1, 2, ?, ?),
    (?, ?, 'website', 1, 3, ?, ?)
  `);

  insertProjects.run(
    '品牌官网改版', '2025年度品牌官方网站全面升级项目',
    project1Start.toISOString(), project1End.toISOString(),

    '移动端 App 设计', 'iOS 和 Android 双端应用界面设计项目',
    project2Start.toISOString(),

    '夏季促销活动', '2025年夏季促销广告活动视觉设计',
    project3Start.toISOString(), project3End.toISOString(),

    '节日礼盒包装', '2025年节日限定产品包装设计',
    project4Start.toISOString(), project4End.toISOString(),

    '线下广告牌', '城市核心商圈户外广告牌设计',
    project5Start.toISOString(), project5End.toISOString(),

    '历史官网项目', '2024年旧版官网项目（历史存档）',
    project6Start.toISOString(), project6End.toISOString()
  );

  const generateCertNum = (date: Date, id: number) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `CERT-${year}${month}${day}-${String(id).padStart(4, '0')}`;
  };

  const generateSignature = () => {
    const chars = '0123456789abcdef';
    let sig = 'SIG-0x';
    for (let i = 0; i < 40; i++) {
      sig += chars[Math.floor(Math.random() * chars.length)];
    }
    return sig;
  };

  const insertCertificate = db.prepare(`
    INSERT INTO certificates (project_id, license_id, font_id, valid_from, valid_to, certificate_number, digital_signature)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const certConfigs = [
    { projectId: 1, licenseId: 1, fontId: 1, startDate: project1Start, endDate: futureDate },
    { projectId: 2, licenseId: 1, fontId: 1, startDate: project2Start, endDate: futureDate },
    { projectId: 3, licenseId: 1, fontId: 1, startDate: project3Start, endDate: futureDate },
    { projectId: 4, licenseId: 2, fontId: 2, startDate: project4Start, endDate: soonDate },
    { projectId: 5, licenseId: 2, fontId: 2, startDate: project5Start, endDate: soonDate },
    { projectId: 6, licenseId: 3, fontId: 3, startDate: pastDate, endDate: pastEndDate },
  ];

  certConfigs.forEach((config, index) => {
    insertCertificate.run(
      config.projectId,
      config.licenseId,
      config.fontId,
      config.startDate.toISOString(),
      config.endDate.toISOString(),
      generateCertNum(config.startDate, index + 1),
      generateSignature()
    );
  });

  const insertDownloadLogs = db.prepare(`
    INSERT INTO download_logs (user_id, font_id, project_id, weight, ip_address) VALUES
    (2, 1, 1, 400, '192.168.1.101'),
    (2, 1, 1, 700, '192.168.1.101'),
    (2, 1, 2, 400, '192.168.1.102'),
    (2, 1, 2, 600, '192.168.1.102'),
    (2, 2, 4, 700, '192.168.1.103')
  `);
  insertDownloadLogs.run();
}
