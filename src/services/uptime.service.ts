import { config } from '../config';
import { logger } from '../utils/logger';
import http from 'http';
import https from 'https';

export class UptimeService {
  static checkUrls(sendMessage: (msg: string) => Promise<void>) {
    if (!config.monitorUrls || config.monitorUrls.length === 0) return;

    for (const urlStr of config.monitorUrls) {
      const isHttps = urlStr.startsWith('https');
      const client = isHttps ? https : http;
      
      const req = client.get(urlStr, (res) => {
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 400)) {
          sendMessage(`⚠️ *تنبيه مراقب المواقع*\n\nالموقع: \`${urlStr}\`\nالحالة: \`${res.statusCode}\``).catch(e => logger.error(e));
        }
      });

      req.on('error', (e) => {
        sendMessage(`⚠️ *تنبيه مراقب المواقع*\n\nالموقع: \`${urlStr}\`\nالخطأ: \`${e.message}\``).catch(err => logger.error(err));
      });

      req.setTimeout(5000, () => {
        req.destroy();
        sendMessage(`⚠️ *تنبيه مراقب المواقع*\n\nالموقع: \`${urlStr}\`\nالخطأ: \`Timeout (5s)\``).catch(err => logger.error(err));
      });
    }
  }
}
