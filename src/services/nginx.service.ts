import { execCommand } from '../utils/shell';

export class NginxService {
  static async getStatus(): Promise<string> {
    try {
      const isConfigValid = await this.testConfig();
      const stdout = await execCommand('systemctl is-active nginx');
      const isActive = stdout.trim() === 'active';
      
      return `🌐 *حالة Nginx*\n\n` +
        `الحالة: ${isActive ? '✅ يعمل' : '❌ متوقف'}\n` +
        `اختبار الإعدادات (config test): ${isConfigValid ? '✅ صحيح' : '❌ يوجد خطأ'}`;
    } catch (e: any) {
      return `❌ خطأ في جلب حالة Nginx أو غير مثبت: ${e.message}`;
    }
  }

  static async reload(): Promise<string> {
    try {
      const isConfigValid = await this.testConfig();
      if (!isConfigValid) {
        return `❌ لا يمكن إعادة التحميل. يوجد خطأ في إعدادات Nginx (config test failed).`;
      }
      
      await execCommand('systemctl reload nginx');
      return `✅ تم إعادة تحميل Nginx بنجاح (Reloaded).`;
    } catch (e: any) {
      return `❌ خطأ أثناء إعادة تحميل Nginx: ${e.message}`;
    }
  }

  static async restart(): Promise<string> {
    try {
      const isConfigValid = await this.testConfig();
      if (!isConfigValid) {
        return `❌ لا يمكن إعاد التشغيل. يوجد خطأ في إعدادات Nginx (config test failed).`;
      }
      
      await execCommand('systemctl restart nginx');
      return `✅ تم إعادة تشغيل Nginx بنجاح (Restarted).`;
    } catch (e: any) {
      return `❌ خطأ أثناء إعادة تشغيل Nginx: ${e.message}`;
    }
  }

  private static async testConfig(): Promise<boolean> {
    try {
      // nginx -t outputs to stderr, so we might get an error thrown if it exits with 0 but writes to stderr.
      // However, exec typically resolves if exit code is 0.
      await execCommand('nginx -t');
      return true;
    } catch (e: any) {
      // If the command fails (exit code != 0), it's invalid.
      // Wait, 'nginx -t' usually writes successful tests to stderr but exits 0.
      if (e.message && e.message.includes('syntax is ok') && e.message.includes('test is successful')) {
          return true; // some wrappers might mistakenly reject on stderr
      }
      return false;
    }
  }
}
