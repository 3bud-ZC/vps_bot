import dotenv from 'dotenv';
import path from 'path';

// Load environment variables based on NODE_ENV, but default to .env
dotenv.config();

export const config = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  adminId: parseInt(process.env.TELEGRAM_ADMIN_ID || '0', 10),
  alertsEnabled: process.env.ALERTS_ENABLED === 'true',
  cpuLimit: parseInt(process.env.CPU_ALERT_LIMIT || '85', 10),
  ramLimit: parseInt(process.env.RAM_ALERT_LIMIT || '85', 10),
  diskLimit: parseInt(process.env.DISK_ALERT_LIMIT || '90', 10),
  alertIntervalSeconds: parseInt(process.env.ALERT_INTERVAL_SECONDS || '60', 10),
  allowedPaths: (process.env.ALLOWED_PATHS || '').split(',').map(p => p.trim()),
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3110', 10),
  monitorUrls: (process.env.MONITOR_URLS || '').split(',').map(u => u.trim()).filter(u => u.length > 0)
};

// Validate critical config
if (!config.botToken) {
  console.error("TELEGRAM_BOT_TOKEN is missing from environment variables.");
  process.exit(1);
}
if (!config.adminId) {
  console.error("TELEGRAM_ADMIN_ID is missing from environment variables.");
  process.exit(1);
}
