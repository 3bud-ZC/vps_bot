import { config } from '../config';
import { SystemService } from './system.service';
import { logger } from '../utils/logger';

export class AlertsService {
  private static intervalId: NodeJS.Timeout | null = null;
  
  // Cooldown tracking (in milliseconds)
  private static readonly COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
  private static lastCpuAlert = 0;
  private static lastRamAlert = 0;
  private static lastDiskAlert = 0;

  static start(sendMessage: (msg: string) => Promise<void>) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    if (!config.alertsEnabled) {
      logger.info('Alerts are disabled in config.');
      return;
    }

    logger.info(`Starting alerts service with interval ${config.alertIntervalSeconds}s`);
    
    this.intervalId = setInterval(async () => {
      await this.checkResources(sendMessage);
    }, config.alertIntervalSeconds * 1000);
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Alerts service stopped.');
    }
  }

  static isRunning(): boolean {
    return this.intervalId !== null;
  }

  private static async checkResources(sendMessage: (msg: string) => Promise<void>) {
    try {
      const now = Date.now();

      // Check CPU
      const cpu = await SystemService.getCpuUsage();
      const cpuUsage = parseFloat(cpu.usagePercent);
      if (cpuUsage >= config.cpuLimit && (now - this.lastCpuAlert > this.COOLDOWN_MS)) {
        this.lastCpuAlert = now;
        await sendMessage(`⚠️ *تنبيه: استهلاك المعالج مرتفع*\n\nالاستهلاك الحالي: \`${cpuUsage}%\`\nالحد الأقصى: \`${config.cpuLimit}%\``);
      }

      // Check RAM
      const ram = SystemService.getRamUsage();
      const ramUsage = parseFloat(ram.usagePercent);
      if (ramUsage >= config.ramLimit && (now - this.lastRamAlert > this.COOLDOWN_MS)) {
        this.lastRamAlert = now;
        await sendMessage(`⚠️ *تنبيه: استهلاك الذاكرة مرتفع*\n\nالاستهلاك الحالي: \`${ramUsage}%\`\nالحد الأقصى: \`${config.ramLimit}%\``);
      }

      // Check Disk
      const disk = await SystemService.getDiskUsage('/');
      const diskUsage = parseFloat(disk.usagePercent);
      if (diskUsage >= config.diskLimit && (now - this.lastDiskAlert > this.COOLDOWN_MS)) {
        this.lastDiskAlert = now;
        await sendMessage(`⚠️ *تنبيه: مساحة القرص ممتلئة*\n\nالاستهلاك الحالي: \`${diskUsage}%\`\nالحد الأقصى: \`${config.diskLimit}%\``);
      }

      // Auto Healer & Uptime
      await this.runAutoHealer(sendMessage);
      const { UptimeService } = require('./uptime.service');
      UptimeService.checkUrls(sendMessage);

    } catch (e: any) {
      logger.error('Error in AlertsService.checkResources:', e);
    }
  }

  private static lastHealTime = 0;

  private static async runAutoHealer(sendMessage: (msg: string) => Promise<void>) {
    const now = Date.now();
    if (now - this.lastHealTime < 5 * 60 * 1000) return; // Cooldown 5 mins to prevent loop
    
    let healed = false;
    // 1. Nginx
    try {
      const { execCommand } = require('../utils/shell');
      const { NginxService } = require('./nginx.service');
      const nginxStatus = await execCommand('systemctl is-active nginx').catch(() => 'inactive');
      if (nginxStatus.trim() !== 'active') {
        const restartMsg = await NginxService.restart();
        await sendMessage(`🩺 *المعالج التلقائي (Auto-Healer)*\n\nاكتشفت توقف \`Nginx\` وحاولت إعادة تشغيله.\nالنتيجة: ${restartMsg}`);
        healed = true;
      }
    } catch (e) {}

    // 2. PM2
    try {
      const { Pm2Service } = require('./pm2.service');
      const pm2Apps = await Pm2Service.getAppList();
      for (const app of pm2Apps) {
        if (app.pm2_env.status !== 'online') {
          const restartMsg = await Pm2Service.restartApp(app.name);
          await sendMessage(`🩺 *المعالج التلقائي (Auto-Healer)*\n\nاكتشفت توقف تطبيق \`${app.name}\` وحاولت إعادة تشغيله.\nالنتيجة: ${restartMsg}`);
          healed = true;
        }
      }
    } catch (e) {}

    if (healed) this.lastHealTime = now;
  }
}
