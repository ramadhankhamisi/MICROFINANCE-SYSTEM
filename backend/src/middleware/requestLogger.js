import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms\n`;

    const logFile = path.join(logsDir, `app-${formatDate(new Date())}.log`);
    fs.appendFile(logFile, logMessage, (err) => {
      if (err) console.error('Failed to write log:', err);
    });
  });

  next();
};
