import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';

export class FilesService {
  /**
   * Normalize path and check if it strictly falls inside ALLOWED_PATHS
   */
  private static isPathAllowed(targetPath: string): boolean {
    const normalized = path.resolve(targetPath);
    return config.allowedPaths.some(allowedPath => {
      const normalizedAllowed = path.resolve(allowedPath);
      // Path must be exactly the allowed path or a sub-directory of it
      return normalized === normalizedAllowed || normalized.startsWith(normalizedAllowed + path.sep);
    });
  }

  /**
   * Check if a file is dangerous based on name
   */
  private static isDangerousFile(fileName: string): boolean {
    const dangerousNames = ['.env', 'id_rsa', 'shadow', 'passwd', 'authorized_keys'];
    const dangerousExtensions = ['.pem', '.key'];
    
    const name = path.basename(fileName);
    if (dangerousNames.includes(name)) return true;
    for (const ext of dangerousExtensions) {
      if (name.endsWith(ext)) return true;
    }
    return false;
  }

  static getBasePaths(): string {
    if (config.allowedPaths.length === 0 || (config.allowedPaths.length === 1 && config.allowedPaths[0] === '')) {
      return `❌ لا يوجد مسارات مسموحة في الإعدادات (ALLOWED_PATHS).`;
    }
    const paths = config.allowedPaths.map(p => `\`${p}\``).join('\n');
    return `📂 *المسارات المسموح الوصول إليها:*\n\n${paths}`;
  }

  static getPwd(): string {
    if (config.allowedPaths.length > 0 && config.allowedPaths[0] !== '') {
      return `📁 المسار الافتراضي المسموح:\n\`${config.allowedPaths[0]}\``;
    }
    return `❌ لا يوجد مسار افتراضي محدد.`;
  }

  static async listDirectory(targetPath: string): Promise<string> {
    try {
      if (!this.isPathAllowed(targetPath)) {
        return `❌ المسار غير مسموح به. الرجاء استخدام مسار ضمن المسارات المسموحة فقط.`;
      }

      const stats = await fs.stat(targetPath);
      if (!stats.isDirectory()) {
        return `❌ المسار المطلوب ليس مجلداً (Directory).`;
      }

      const items = await fs.readdir(targetPath, { withFileTypes: true });
      if (items.length === 0) {
        return `📂 المجلد فارغ: \`${targetPath}\``;
      }

      // Sort: Directories first, then files
      items.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

      // Truncate if too many items (e.g. max 50)
      const maxItems = 50;
      const displayItems = items.slice(0, maxItems);
      
      let result = `📂 *محتويات المجلد:*\n\`${targetPath}\`\n\n`;
      displayItems.forEach(item => {
        const icon = item.isDirectory() ? '📁' : '📄';
        result += `${icon} \`${item.name}\`\n`;
      });

      if (items.length > maxItems) {
        result += `\n... و ${items.length - maxItems} عنصر آخر مخفي.`;
      }

      return result;
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        return `❌ المسار غير موجود.`;
      }
      return `❌ خطأ في قراءة المجلد: ${e.message}`;
    }
  }

  static async readFile(targetPath: string): Promise<string> {
    try {
      if (!this.isPathAllowed(targetPath)) {
        return `❌ المسار غير مسموح به. الرجاء استخدام مسار ضمن المسارات المسموحة فقط.`;
      }

      if (this.isDangerousFile(targetPath)) {
        return `❌ عذراً، قراءة هذا الملف غير مسموحة لأسباب أمنية.`;
      }

      const stats = await fs.stat(targetPath);
      if (!stats.isFile()) {
        return `❌ المسار المطلوب ليس ملفاً (File).`;
      }

      // Max 100 KB
      const MAX_SIZE = 100 * 1024;
      if (stats.size > MAX_SIZE) {
        return `❌ حجم الملف كبير جداً (${Math.round(stats.size / 1024)} KB). الحد الأقصى هو 100 KB.`;
      }

      const content = await fs.readFile(targetPath, 'utf8');
      
      // Limit to ~3000 chars to fit in Telegram message safely
      const charLimit = 3000;
      let displayContent = content;
      let truncatedInfo = '';
      if (content.length > charLimit) {
        displayContent = content.substring(0, charLimit);
        truncatedInfo = `\n\n...[تم قطع المحتوى، حجم الملف كبير]`;
      }

      return `📄 *محتوى الملف:*\n\`${targetPath}\`\n\n\`\`\`text\n${displayContent}\n\`\`\`${truncatedInfo}`;
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        return `❌ الملف غير موجود.`;
      }
      return `❌ خطأ في قراءة الملف: ${e.message}`;
    }
  }

  private static pathCache = new Map<string, string>();

  static cachePath(targetPath: string): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(targetPath).digest('hex').substring(0, 8);
    this.pathCache.set(hash, targetPath);
    return hash;
  }

  static getPathFromCache(hash: string): string | undefined {
    return this.pathCache.get(hash);
  }

  static async getDirectoryInlineKeyboard(targetPath: string, page: number = 0): Promise<any> {
    try {
      if (!this.isPathAllowed(targetPath)) return null;
      const items = await fs.readdir(targetPath, { withFileTypes: true });
      items.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

      const ITEMS_PER_PAGE = 20;
      const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
      const safePage = Math.max(0, Math.min(page, totalPages - 1));
      
      const displayItems = items.slice(safePage * ITEMS_PER_PAGE, (safePage + 1) * ITEMS_PER_PAGE);
      const buttons = displayItems.map(item => {
        const fullPath = path.join(targetPath, item.name);
        const hash = this.cachePath(fullPath);
        const icon = item.isDirectory() ? '📁' : '📄';
        return [{ text: `${icon} ${item.name}`, callback_data: `fs_${item.isDirectory() ? 'dir' : 'file'}_${hash}_0` }];
      });

      // Pagination row
      const paginationRow = [];
      const currentHash = this.cachePath(targetPath);
      if (safePage > 0) {
        paginationRow.push({ text: '⬅️ السابق', callback_data: `fs_dir_${currentHash}_${safePage - 1}` });
      }
      if (safePage < totalPages - 1) {
        paginationRow.push({ text: 'التالي ➡️', callback_data: `fs_dir_${currentHash}_${safePage + 1}` });
      }
      if (paginationRow.length > 0) {
        buttons.push(paginationRow);
      }

      if (targetPath !== '/' && this.isPathAllowed(path.dirname(targetPath))) {
        const parentHash = this.cachePath(path.dirname(targetPath));
        buttons.unshift([{ text: '⬆️ رجوع للخلف', callback_data: `fs_dir_${parentHash}_0` }]);
      }

      return { inline_keyboard: buttons };
    } catch {
      return null;
    }
  }
}
