import { execCommand } from '../utils/shell';

export class DockerService {
  static async getStatus(): Promise<string> {
    try {
      // Check if docker exists
      await execCommand('docker --version');
      
      const psOutput = await execCommand('docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"');
      const allCountStr = await execCommand('docker ps -a -q | wc -l');
      const runningCountStr = await execCommand('docker ps -q | wc -l');
      
      const allCount = parseInt(allCountStr.trim(), 10) || 0;
      const runningCount = parseInt(runningCountStr.trim(), 10) || 0;
      const stoppedCount = allCount - runningCount;

      return `🐳 *حالة Docker*\n\n` +
        `✅ الحاويات التي تعمل: \`${runningCount}\`\n` +
        `🛑 الحاويات المتوقفة: \`${stoppedCount}\`\n\n` +
        `*الحاويات التي تعمل حالياً:*\n\`\`\`\n${psOutput || 'لا يوجد حاويات تعمل'}\n\`\`\``;
    } catch (e: any) {
      if (e.message.includes('command not found') || e.message.includes('not recognized')) {
        return `❌ Docker غير مثبت على هذا الخادم.`;
      }
      return `❌ خطأ في جلب حالة Docker: ${e.message}`;
    }
  }

  static async pruneSystem(): Promise<string> {
    try {
      const output = await execCommand('docker system prune -f');
      return `✅ تم تنظيف Docker بنجاح:\n\n\`\`\`\n${output}\n\`\`\``;
    } catch (e: any) {
      return `❌ فشل التنظيف: ${e.message}`;
    }
  }

  static async restartContainer(containerId: string): Promise<string> {
    try {
      await execCommand(`docker restart ${containerId}`);
      return `✅ تم إعادة تشغيل الحاوية ${containerId}.`;
    } catch (e: any) {
      return `❌ فشل إعادة تشغيل الحاوية: ${e.message}`;
    }
  }

  static async getContainers(): Promise<any[]> {
    try {
      const output = await execCommand('docker ps -a --format "{{.Names}}|{{.ID}}|{{.Status}}"');
      if (!output) return [];
      return output.split('\n').filter(l => l.trim() !== '').map(l => {
        const [name, id, status] = l.split('|');
        return { name, id, status };
      });
    } catch {
      return [];
    }
  }
}
