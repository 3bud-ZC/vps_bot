import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { logger } from '../utils/logger';

export class SecurityService {
  private static tailProcess: ChildProcessWithoutNullStreams | null = null;

  static startSshMonitor(sendMessage: (msg: string) => Promise<void>) {
    if (this.tailProcess) {
      this.tailProcess.kill();
    }

    const logFile = '/var/log/auth.log';
    logger.info(`Starting SSH monitor on ${logFile}`);
    
    this.tailProcess = spawn('tail', ['-F', logFile]);

    this.tailProcess.stdout.on('data', async (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.includes('Accepted password') || line.includes('Accepted publickey')) {
          const match = line.match(/Accepted (password|publickey) for (.+) from ([0-9\.]+) port/);
          if (match) {
            const method = match[1];
            const user = match[2];
            const ip = match[3];
            await sendMessage(`🚨 *تنبيه أمني: تسجيل دخول SSH*\n\nالمستخدم: \`${user}\`\nالطريقة: \`${method}\`\nالـ IP: \`${ip}\``);
          } else {
            await sendMessage(`🚨 *تنبيه أمني: تسجيل دخول SSH*\n\n\`${line}\``);
          }
        }
      }
    });

    this.tailProcess.stderr.on('data', (data) => {
      logger.error(`SSH Monitor Error: ${data}`);
    });

    this.tailProcess.on('close', (code) => {
      logger.info(`SSH Monitor exited with code ${code}`);
    });
  }

  static stopSshMonitor() {
    if (this.tailProcess) {
      this.tailProcess.kill();
      this.tailProcess = null;
      logger.info('SSH monitor stopped.');
    }
  }
}
