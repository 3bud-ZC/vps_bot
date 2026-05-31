import { execCommand } from '../utils/shell';

export class LogsService {
  static async getLogLines(filePath: string, lines: number = 50): Promise<string> {
    try {
      const output = await execCommand(`tail -n ${lines} ${filePath}`);
      return output || 'لا يوجد محتوى في هذا السجل.';
    } catch (e: any) {
      return `❌ حدث خطأ أثناء قراءة السجل: ${e.message}`;
    }
  }
}
