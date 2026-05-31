import { execCommand } from '../utils/shell';

export class UfwService {
  static async getStatus(): Promise<string> {
    try {
      const output = await execCommand('ufw status');
      return output || 'UFW غير مفعل أو غير مثبت.';
    } catch (e: any) {
      return `❌ خطأ في جلب حالة UFW: ${e.message}`;
    }
  }
  
  static async enable(): Promise<string> {
    try {
      await execCommand('ufw --force enable');
      return '✅ تم تفعيل الجدار الناري بنجاح.';
    } catch(e: any) { return `❌ فشل التفعيل: ${e.message}`; }
  }

  static async disable(): Promise<string> {
    try {
      await execCommand('ufw disable');
      return '❌ تم إيقاف الجدار الناري بنجاح.';
    } catch(e: any) { return `❌ فشل الإيقاف: ${e.message}`; }
  }
}
