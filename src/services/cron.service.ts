import { execCommand } from '../utils/shell';

export class CronService {
  static async getJobs(): Promise<string> {
    try {
      const output = await execCommand('crontab -l');
      const lines = output.split('\n').filter(l => !l.startsWith('#') && l.trim() !== '');
      if (lines.length === 0) return 'لا يوجد مهام مجدولة حالياً.';
      return lines.join('\n');
    } catch (e: any) {
      if (e.message.includes('no crontab for')) return 'لا يوجد مهام مجدولة حالياً.';
      return `❌ خطأ في جلب المهام: ${e.message}`;
    }
  }
}
