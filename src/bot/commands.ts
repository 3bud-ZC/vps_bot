import { Telegraf, Context } from 'telegraf';
import { SystemService } from '../services/system.service';
import { DockerService } from '../services/docker.service';
import { Pm2Service } from '../services/pm2.service';
import { NginxService } from '../services/nginx.service';
import { FilesService } from '../services/files.service';
import { AlertsService } from '../services/alerts.service';
import { truncateMessage } from '../utils/formatter';
import { config } from '../config';
import { Menus } from './menus';

export const setupCommands = (bot: Telegraf) => {
  // 1. /start
  bot.command('start', async (ctx: Context) => {
    const welcomeMsg = `أهلاً بك في بوت إدارة الخادم (VPS Manager Bot) 🤖\n\n` +
      `الرجاء اختيار القسم المطلوب من القائمة أدناه:`;
    await ctx.reply(welcomeMsg, { ...Menus.main() });
  });

  // 2. /help
  bot.command('help', async (ctx: Context) => {
    const helpMsg = `📖 *القائمة الرئيسية:*\n\nالرجاء استخدام الأزرار أدناه للتنقل وإدارة الخادم.`;
    await ctx.reply(helpMsg, { parse_mode: 'Markdown', ...Menus.main() });
  });

  // 3. /status
  bot.command('status', async (ctx: Context) => {
    const msg = await SystemService.getStatus();
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 4. /resources
  bot.command('resources', async (ctx: Context) => {
    const msg = await SystemService.getResources();
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 5. /cpu
  bot.command('cpu', async (ctx: Context) => {
    const msg = await SystemService.getCpuInfo();
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 6. /ram
  bot.command('ram', async (ctx: Context) => {
    const msg = SystemService.getRamInfo();
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 7. /disk
  bot.command('disk', async (ctx: Context) => {
    const msg = await SystemService.getDiskInfo();
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 8. /uptime
  bot.command('uptime', async (ctx: Context) => {
    const msg = SystemService.getUptimeInfo();
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 9. /network
  bot.command('network', async (ctx: Context) => {
    const msg = await SystemService.getNetworkInfo();
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 10. /services
  bot.command('services', async (ctx: Context) => {
    const msg = await SystemService.getServicesStatus();
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 11. /pm2
  bot.command('pm2', async (ctx: Context) => {
    const msg = await Pm2Service.getStatus();
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 12. /docker
  bot.command('docker', async (ctx: Context) => {
    const msg = await DockerService.getStatus();
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 13. /nginx
  bot.command('nginx', async (ctx: Context) => {
    const msg = await NginxService.getStatus();
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 14. /reload_nginx
  bot.command('reload_nginx', async (ctx: Context) => {
    const msg = await NginxService.reload();
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 15. /restart_nginx
  bot.command('restart_nginx', async (ctx: Context) => {
    const msg = await NginxService.restart();
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 16. /files
  bot.command('files', async (ctx: Context) => {
    const msg = FilesService.getBasePaths();
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 17. /pwd
  bot.command('pwd', async (ctx: Context) => {
    const msg = FilesService.getPwd();
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 18. /ls
  bot.command('ls', async (ctx: Context) => {
    const msgText = (ctx.message as any).text;
    const parts = msgText.split(' ');
    const targetPath = parts.slice(1).join(' ') || (config.allowedPaths[0] || '');
    
    if (!targetPath) {
      return ctx.reply('❌ يرجى تحديد مسار، أو التأكد من إعداد ALLOWED_PATHS');
    }
    
    const msg = await FilesService.listDirectory(targetPath);
    await ctx.reply(truncateMessage(msg), { parse_mode: 'Markdown' });
  });

  // 19. /cat
  bot.command('cat', async (ctx: Context) => {
    const msgText = (ctx.message as any).text;
    const parts = msgText.split(' ');
    const targetPath = parts.slice(1).join(' ');
    
    if (!targetPath) {
      return ctx.reply('❌ يرجى تحديد مسار الملف. مثال: /cat /var/www/index.html');
    }
    
    const msg = await FilesService.readFile(targetPath);
    await ctx.reply(truncateMessage(msg), { parse_mode: 'Markdown' });
  });

  // 21. /alerts
  bot.command('alerts', async (ctx: Context) => {
    const msg = `🔔 *إعدادات التنبيهات*\n\n` +
      `الحالة: ${AlertsService.isRunning() ? '✅ مفعلة' : '❌ متوقفة'}\n` +
      `حد المعالج: \`${config.cpuLimit}%\`\n` +
      `حد الذاكرة: \`${config.ramLimit}%\`\n` +
      `حد القرص: \`${config.diskLimit}%\`\n` +
      `الفاصل الزمني للفحص: \`${config.alertIntervalSeconds} ثانية\``;
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 22. /alerts_on & /alerts_off
  bot.command('alerts_on', async (ctx: Context) => {
    if (AlertsService.isRunning()) {
      return ctx.reply('✅ التنبيهات مفعلة مسبقاً.');
    }
    AlertsService.start(async (msg) => {
      await bot.telegram.sendMessage(config.adminId, msg, { parse_mode: 'Markdown' });
    });
    await ctx.reply('✅ تم تفعيل التنبيهات بنجاح.');
  });

  bot.command('alerts_off', async (ctx: Context) => {
    if (!AlertsService.isRunning()) {
      return ctx.reply('❌ التنبيهات متوقفة مسبقاً.');
    }
    AlertsService.stop();
    await ctx.reply('❌ تم إيقاف التنبيهات بنجاح.');
  });

  // 23, 24, 25. /set_limits
  bot.command('set_cpu_limit', async (ctx: Context) => {
    const val = parseInt((ctx.message as any).text.split(' ')[1], 10);
    if (isNaN(val) || val < 1 || val > 100) return ctx.reply('❌ يرجى إدخال رقم صحيح بين 1 و 100');
    config.cpuLimit = val;
    await ctx.reply(`✅ تم تحديث حد تنبيه المعالج إلى: \`${val}%\``, { parse_mode: 'Markdown' });
  });

  bot.command('set_ram_limit', async (ctx: Context) => {
    const val = parseInt((ctx.message as any).text.split(' ')[1], 10);
    if (isNaN(val) || val < 1 || val > 100) return ctx.reply('❌ يرجى إدخال رقم صحيح بين 1 و 100');
    config.ramLimit = val;
    await ctx.reply(`✅ تم تحديث حد تنبيه الذاكرة إلى: \`${val}%\``, { parse_mode: 'Markdown' });
  });

  bot.command('set_disk_limit', async (ctx: Context) => {
    const val = parseInt((ctx.message as any).text.split(' ')[1], 10);
    if (isNaN(val) || val < 1 || val > 100) return ctx.reply('❌ يرجى إدخال رقم صحيح بين 1 و 100');
    config.diskLimit = val;
    await ctx.reply(`✅ تم تحديث حد تنبيه القرص إلى: \`${val}%\``, { parse_mode: 'Markdown' });
  });

  // 26. /backup
  bot.command('backup', async (ctx: Context) => {
    const msgText = (ctx.message as any).text;
    const parts = msgText.split(' ');
    
    if (parts.length < 3) {
      return ctx.reply('❌ الاستخدام الصحيح:\n`/backup mysql db_name`\n`/backup postgres db_name`', { parse_mode: 'Markdown' });
    }

    const type = parts[1].toLowerCase();
    const dbName = parts[2];

    if (type !== 'mysql' && type !== 'postgres') {
      return ctx.reply('❌ نوع قاعدة البيانات غير مدعوم. استخدم `mysql` أو `postgres`', { parse_mode: 'Markdown' });
    }

    const m = await ctx.reply(`⏳ جاري إنشاء النسخة الاحتياطية لـ ${dbName}...`);
    try {
      const BackupService = require('../services/backup.service').BackupService;
      const filePath = await BackupService.createDatabaseBackup(type, dbName);
      
      await ctx.replyWithDocument({ source: filePath }, { caption: `✅ تم إنشاء النسخة الاحتياطية بنجاح.` });
      await BackupService.cleanupBackup(filePath);
      await ctx.deleteMessage(m.message_id);
    } catch (e: any) {
      await ctx.telegram.editMessageText(ctx.chat?.id, m.message_id, undefined, `❌ حدث خطأ:\n${e.message}`);
    }
  });

  // 27. /sh (Interactive Terminal)
  bot.command('sh', async (ctx: Context) => {
    const msgText = (ctx.message as any).text;
    const commandToRun = msgText.replace('/sh', '').trim();
    
    if (!commandToRun) {
      return ctx.reply('❌ الاستخدام: `/sh <command>`', { parse_mode: 'Markdown' });
    }

    const { execCommand } = require('../utils/shell');
    const m = await ctx.reply(`⏳ جاري التنفيذ...`);
    try {
      const output = await execCommand(commandToRun);
      const text = output.trim() || '✅ تم التنفيذ بدون مخرجات.';
      if (text.length > 4000) {
        // Send as file if too long
        const fs = require('fs');
        const tmpFile = `/tmp/sh_output_${Date.now()}.txt`;
        fs.writeFileSync(tmpFile, text);
        await ctx.replyWithDocument({ source: tmpFile, filename: 'output.txt' });
        fs.unlinkSync(tmpFile);
        await ctx.deleteMessage(m.message_id);
      } else {
        await ctx.telegram.editMessageText(ctx.chat?.id, m.message_id, undefined, `💻 *المخرجات:*\n\`\`\`bash\n${text}\n\`\`\``, { parse_mode: 'Markdown' });
      }
    } catch (e: any) {
      await ctx.telegram.editMessageText(ctx.chat?.id, m.message_id, undefined, `❌ حدث خطأ أثناء التنفيذ:\n\`\`\`bash\n${e.message}\n\`\`\``, { parse_mode: 'Markdown' });
    }
  });

  // 28. /dashboard (Live Dashboard)
  bot.command('dashboard', async (ctx: Context) => {
    const msg = await SystemService.getStatus();
    const m = await ctx.reply(`📊 *لوحة التحكم الحية*\n(يتم التحديث كل 5 ثوانٍ لمدة دقيقة)...\n\n${msg}`, { parse_mode: 'Markdown' });
    
    let ticks = 0;
    const maxTicks = 12; // 1 minute (12 * 5s)
    
    const interval = setInterval(async () => {
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        await ctx.telegram.editMessageText(ctx.chat?.id, m.message_id, undefined, `📊 *لوحة التحكم الحية (انتهى التحديث)*\n\n${await SystemService.getStatus()}`, { parse_mode: 'Markdown' });
        return;
      }
      try {
        const newMsg = await SystemService.getStatus();
        await ctx.telegram.editMessageText(ctx.chat?.id, m.message_id, undefined, `📊 *لوحة التحكم الحية (نشط 🟢)*\n\n${newMsg}`, { parse_mode: 'Markdown' });
      } catch (e) {
        // Ignore edit message errors (e.g. if content is exactly the same)
      }
    }, 5000);
  });

  // 29. /chart
  bot.command('chart', async (ctx: Context) => {
    const { ChartsService } = require('../services/charts.service');
    const m = await ctx.reply('⏳ جاري رسم الموارد...');
    try {
      const url = await ChartsService.generateResourceChartUrl();
      await ctx.replyWithPhoto(url, { caption: '📊 الموارد الحالية للنظام' });
      await ctx.deleteMessage(m.message_id);
    } catch (e: any) {
      await ctx.telegram.editMessageText(ctx.chat?.id, m.message_id, undefined, `❌ حدث خطأ:\n${e.message}`);
    }
  });
};
