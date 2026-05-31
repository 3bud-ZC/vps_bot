import os from 'os';
import { execCommand } from '../utils/shell';
import { formatBytes } from '../utils/formatter';

export class SystemService {
  /**
   * Get basic VPS status summarizing CPU, RAM, Disk, Uptime
   */
  static async getStatus(): Promise<string> {
    const uptime = this.getUptime();
    const cpu = await this.getCpuUsage();
    const ram = this.getRamUsage();
    const disk = await this.getDiskUsage('/');

    return `📊 *حالة الخادم (VPS Status)*\n` +
      `🌐 اسم المضيف: \`${os.hostname()}\`\n` +
      `💻 النظام: \`${os.type()} ${os.release()}\`\n` +
      `⏱ مدة التشغيل: \`${uptime}\`\n` +
      `⚙️ المعالج: \`${cpu.usagePercent}%\`\n` +
      `🧠 الذاكرة: \`${ram.usagePercent}%\`\n` +
      `💾 القرص: \`${disk.usagePercent}%\`\n` +
      `🕒 الوقت الحالي: \`${new Date().toLocaleString('ar-EG')}\``;
  }

  /**
   * Get comprehensive resources
   */
  static async getResources(): Promise<string> {
    const cpu = await this.getCpuUsage();
    const ram = this.getRamUsage();
    const disk = await this.getDiskUsage('/');
    
    return `📈 *استهلاك الموارد*\n\n` +
      `*المعالج (CPU)*\nالاستهلاك: \`${cpu.usagePercent}%\`\n\n` +
      `*الذاكرة (RAM)*\nالاستهلاك: \`${ram.usagePercent}%\`\n\n` +
      `*القرص الصلب (Disk)*\nالاستهلاك: \`${disk.usagePercent}%\`\n\n` +
      `*متوسط الحمل (Load Average)*\n\`${os.loadavg().map(v => v.toFixed(2)).join(', ')}\``;
  }

  static async getCpuInfo(): Promise<string> {
    const cpus = os.cpus();
    const cpu = await this.getCpuUsage();
    const model = cpus[0]?.model || 'Unknown';
    const cores = cpus.length;
    
    return `⚙️ *معلومات المعالج (CPU)*\n\n` +
      `النوع: \`${model}\`\n` +
      `الأنوية: \`${cores}\`\n` +
      `الاستهلاك الحالي: \`${cpu.usagePercent}%\`\n` +
      `متوسط الحمل (1, 5, 15 دقيقة): \`${os.loadavg().map(v => v.toFixed(2)).join(', ')}\``;
  }

  static getRamInfo(): string {
    const ram = this.getRamUsage();
    return `🧠 *معلومات الذاكرة (RAM)*\n\n` +
      `الإجمالي: \`${formatBytes(ram.total)}\`\n` +
      `المستخدم: \`${formatBytes(ram.used)}\`\n` +
      `المتاح: \`${formatBytes(ram.free)}\`\n` +
      `نسبة الاستهلاك: \`${ram.usagePercent}%\``;
  }

  static async getDiskInfo(): Promise<string> {
    try {
      // For Linux, get all major ext/xfs file systems
      const stdout = await execCommand('df -h --output=source,size,used,avail,pcent,target -x tmpfs -x devtmpfs');
      return `💾 *استهلاك الأقراص*\n\n\`\`\`\n${stdout}\n\`\`\``;
    } catch (e: any) {
      return `❌ خطأ في جلب بيانات القرص: ${e.message}`;
    }
  }

  static getUptimeInfo(): string {
    return `⏱ *مدة التشغيل (Uptime)*\n\n\`${this.getUptime()}\``;
  }

  static async getNetworkInfo(): Promise<string> {
    let publicIp = 'Unknown';
    try {
      publicIp = await execCommand('curl -s https://api.ipify.org || echo "Failed"');
    } catch (e) {
      publicIp = 'Failed';
    }

    const interfaces = os.networkInterfaces();
    let localIps = '';
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          continue;
        }
        localIps += `${name}: \`${iface.address}\`\n`;
      }
    }

    return `🌐 *معلومات الشبكة*\n\n` +
      `الـ IP العام: \`${publicIp}\`\n\n` +
      `الـ IP المحلي:\n${localIps || 'لا يوجد'}`;
  }

  static async getServicesStatus(): Promise<string> {
    const services = ['nginx', 'docker', 'ssh', 'ufw'];
    let result = '🛠 *حالة الخدمات*\n\n';

    for (const service of services) {
      try {
        const stdout = await execCommand(`systemctl is-active ${service}`);
        const isActive = stdout.trim() === 'active';
        result += `${service}: ${isActive ? '✅ يعمل' : '❌ متوقف'}\n`;
      } catch (e) {
        result += `${service}: ❌ غير مثبت أو متوقف\n`;
      }
    }
    return result;
  }

  // --- Helper Methods ---

  static getUptime(): string {
    const uptimeSeconds = os.uptime();
    const d = Math.floor(uptimeSeconds / (3600 * 24));
    const h = Math.floor(uptimeSeconds % (3600 * 24) / 3600);
    const m = Math.floor(uptimeSeconds % 3600 / 60);
    return `${d} أيام, ${h} ساعات, ${m} دقائق`;
  }

  static getRamUsage() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usagePercent = ((used / total) * 100).toFixed(2);
    return { total, used, free, usagePercent };
  }

  static async getCpuUsage(): Promise<{ usagePercent: string }> {
    return new Promise((resolve) => {
      const startMeasure = this.cpuAverage();
      setTimeout(() => {
        const endMeasure = this.cpuAverage();
        const idleDifference = endMeasure.idle - startMeasure.idle;
        const totalDifference = endMeasure.total - startMeasure.total;
        const percentageCpu = 100 - ~~(100 * idleDifference / totalDifference);
        resolve({ usagePercent: percentageCpu.toString() });
      }, 100);
    });
  }

  private static cpuAverage() {
    const cpus = os.cpus();
    let idleMs = 0;
    let totalMs = 0;
    for (const core of cpus) {
      for (const type in core.times) {
        totalMs += (core.times as any)[type];
      }
      idleMs += core.times.idle;
    }
    return {
      idle: idleMs / cpus.length,
      total: totalMs / cpus.length
    };
  }

  static async getDiskUsage(mountPoint: string = '/') {
    try {
      const stdout = await execCommand(`df -B1 ${mountPoint} | awk 'NR==2 {print $2, $3, $4, $5}'`);
      const [totalStr, usedStr, freeStr, percentStr] = stdout.split(' ');
      const total = parseInt(totalStr, 10);
      const used = parseInt(usedStr, 10);
      const free = parseInt(freeStr, 10);
      const usagePercent = percentStr.replace('%', '');
      return { total, used, free, usagePercent };
    } catch (e) {
      return { total: 0, used: 0, free: 0, usagePercent: '0' };
    }
  }
}
