import { execCommand } from '../utils/shell';

export class Pm2Service {
  static async getStatus(): Promise<string> {
    try {
      // Check if pm2 exists
      await execCommand('pm2 -v');
      
      const stdout = await execCommand('pm2 jlist');
      const list = JSON.parse(stdout);
      
      if (list.length === 0) {
        return `🤖 *حالة PM2*\n\nلا يوجد تطبيقات تعمل حالياً.`;
      }

      let result = `🤖 *حالة تطبيقات PM2*\n\n`;
      list.forEach((app: any) => {
        const name = app.name;
        const status = app.pm2_env.status; // online, stopped, errored
        const restarts = app.pm2_env.restart_time;
        const cpu = app.monit ? app.monit.cpu : 0;
        const memory = app.monit ? Math.round(app.monit.memory / (1024 * 1024)) : 0; // MB
        
        const statusIcon = status === 'online' ? '🟢' : (status === 'stopped' ? '🔴' : '🟡');
        
        result += `${statusIcon} *${name}*\n` +
          `الحالة: \`${status}\` | إعادة التشغيل: \`${restarts}\`\n` +
          `المعالج: \`${cpu}%\` | الذاكرة: \`${memory} MB\`\n\n`;
      });
      
      return result;
    } catch (e: any) {
      if (e.message.includes('command not found') || e.message.includes('not recognized')) {
        return `❌ PM2 غير مثبت على هذا الخادم.`;
      }
      return `❌ خطأ في جلب حالة PM2: ${e.message}`;
    }
  }

  static async restartApp(appName: string): Promise<string> {
    try {
      await execCommand(`pm2 restart ${appName}`);
      return `✅ تم إعادة تشغيل ${appName} بنجاح.`;
    } catch (e: any) {
      return `❌ فشل إعادة تشغيل ${appName}: ${e.message}`;
    }
  }

  static async getAppList(): Promise<any[]> {
    try {
      const stdout = await execCommand('pm2 jlist');
      return JSON.parse(stdout);
    } catch {
      return [];
    }
  }
}
