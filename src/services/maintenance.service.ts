import { execCommand } from '../utils/shell';

export class MaintenanceService {
  static async clearRamCache(): Promise<string> {
    try {
      await execCommand('sync; echo 3 > /proc/sys/vm/drop_caches');
      return '✅ تم تفريغ الذاكرة العشوائية (RAM Cache) بنجاح.';
    } catch (e: any) {
      return `❌ فشل تفريغ الذاكرة: ${e.message}`;
    }
  }

  static async getUpgradablePackages(): Promise<string> {
    try {
      const output = await execCommand('apt list --upgradable 2>/dev/null');
      const lines = output.split('\n').filter(l => l.trim() !== '' && !l.includes('Listing...'));
      if (lines.length === 0) {
        return '✅ النظام محدث بالكامل، لا توجد حزم بحاجة للترقية.';
      }
      return `📦 يوجد ${lines.length} حزمة يمكن تحديثها.\n\n` + lines.slice(0, 10).join('\n') + (lines.length > 10 ? '\n...وغيرها' : '');
    } catch (e: any) {
      return `❌ فشل فحص التحديثات: ${e.message}`;
    }
  }
}
