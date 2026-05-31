import { execCommand } from '../utils/shell';
import path from 'path';
import fs from 'fs/promises';

export class BackupService {
  static async createDatabaseBackup(dbType: 'mysql' | 'postgres', dbName: string): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = '/tmp';
      const fileName = `${dbType}_${dbName}_${timestamp}.sql.gz`;
      const filePath = path.join(backupDir, fileName);

      if (dbType === 'postgres') {
        await execCommand(`pg_dump ${dbName} | gzip > ${filePath}`);
      } else if (dbType === 'mysql') {
        await execCommand(`mysqldump ${dbName} | gzip > ${filePath}`);
      }

      return filePath;
    } catch (e: any) {
      throw new Error(`فشل إنشاء النسخة الاحتياطية: ${e.message}`);
    }
  }

  static async cleanupBackup(filePath: string) {
    try {
      await fs.unlink(filePath);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}
