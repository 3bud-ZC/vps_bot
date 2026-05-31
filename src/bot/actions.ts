import { Telegraf, Context } from 'telegraf';
import { Menus } from './menus';
import { SystemService } from '../services/system.service';
import { DockerService } from '../services/docker.service';
import { Pm2Service } from '../services/pm2.service';
import { NginxService } from '../services/nginx.service';
import { FilesService } from '../services/files.service';
import { AlertsService } from '../services/alerts.service';
import { SecurityService } from '../services/security.service';
import { LogsService } from '../services/logs.service';
import { MaintenanceService } from '../services/maintenance.service';
import { config } from '../config';

export const setupActions = (bot: Telegraf) => {
  
  // --- Menu Navigation Actions ---
  bot.action('menu_main', async (ctx: Context) => {
    await ctx.editMessageText('القائمة الرئيسية للإدارة 🤖\nالرجاء اختيار القسم المطلوب:', Menus.main());
  });

  bot.action('menu_resources', async (ctx: Context) => {
    await ctx.editMessageText('📈 *قسم الموارد*\nاختر المورد الذي تود تفحصه:', { parse_mode: 'Markdown', ...Menus.resources() });
  });

  bot.action('menu_services', async (ctx: Context) => {
    await ctx.editMessageText('🛠 *قسم الخدمات*\nاختر الخدمة لمعرفة حالتها أو التحكم بها:', { parse_mode: 'Markdown', ...Menus.services() });
  });

  bot.action('menu_files', async (ctx: Context) => {
    const info = `📂 *قسم إدارة الملفات*\nتصفح وتنزيل الملفات بأمان.`;
    await ctx.editMessageText(info, { parse_mode: 'Markdown', ...Menus.files() });
  });

  bot.action('menu_alerts', async (ctx: Context) => {
    const info = `🔔 *قسم التنبيهات والأمان*`;
    await ctx.editMessageText(info, { parse_mode: 'Markdown', ...Menus.alerts() });
  });

  bot.action('menu_logs', async (ctx: Context) => {
    await ctx.editMessageText('📜 *السجلات (Logs)*\nاختر السجل الذي تود قراءته:', { parse_mode: 'Markdown', ...Menus.logs() });
  });

  bot.action('menu_advanced', async (ctx: Context) => {
    await ctx.editMessageText('⚡ *أدوات متقدمة*\nاحذر عند استخدام هذه الأدوات:', { parse_mode: 'Markdown', ...Menus.advanced() });
  });

  const sendActionResponse = async (ctx: Context, text: string, markup: any) => {
    try {
      await ctx.editMessageText(text, { parse_mode: 'Markdown', ...markup });
    } catch (e) {
      // Ignored if same text
    }
    await ctx.answerCbQuery();
  };

  const loading = async (ctx: Context) => {
    try {
      await ctx.editMessageText('⏳ جاري معالجة الطلب...');
    } catch {}
  };

  // --- System Actions ---
  bot.action('action_status', async (ctx: Context) => {
    await loading(ctx);
    const msg = await SystemService.getStatus();
    await sendActionResponse(ctx, msg, Menus.main());
  });

  bot.action('action_cpu', async (ctx: Context) => {
    await loading(ctx);
    const msg = await SystemService.getCpuInfo();
    await sendActionResponse(ctx, msg, Menus.resources());
  });

  bot.action('action_ram', async (ctx: Context) => {
    const msg = SystemService.getRamInfo();
    await sendActionResponse(ctx, msg, Menus.resources());
  });

  bot.action('action_disk', async (ctx: Context) => {
    await loading(ctx);
    const msg = await SystemService.getDiskInfo();
    await sendActionResponse(ctx, msg, Menus.resources());
  });

  bot.action('action_network', async (ctx: Context) => {
    await loading(ctx);
    const msg = await SystemService.getNetworkInfo();
    await sendActionResponse(ctx, msg, Menus.resources());
  });

  bot.action('action_uptime', async (ctx: Context) => {
    const msg = SystemService.getUptimeInfo();
    await sendActionResponse(ctx, msg, Menus.resources());
  });

  // --- Services Actions ---
  bot.action('action_docker', async (ctx: Context) => {
    await loading(ctx);
    const msg = await DockerService.getStatus();
    await sendActionResponse(ctx, msg, Menus.services());
  });

  bot.action('action_pm2', async (ctx: Context) => {
    await loading(ctx);
    const msg = await Pm2Service.getStatus();
    await sendActionResponse(ctx, msg, Menus.services());
  });

  bot.action('action_nginx_status', async (ctx: Context) => {
    await loading(ctx);
    const msg = await NginxService.getStatus();
    await sendActionResponse(ctx, msg, Menus.services());
  });

  // --- Logs Actions ---
  bot.action('log_nginx_access', async (ctx: Context) => {
    await loading(ctx);
    const msg = await LogsService.getLogLines('/var/log/nginx/access.log', 50);
    await sendActionResponse(ctx, `🌐 *Nginx Access Log*\n\n\`\`\`text\n${msg}\n\`\`\``, Menus.logs());
  });

  bot.action('log_nginx_error', async (ctx: Context) => {
    await loading(ctx);
    const msg = await LogsService.getLogLines('/var/log/nginx/error.log', 50);
    await sendActionResponse(ctx, `❌ *Nginx Error Log*\n\n\`\`\`text\n${msg}\n\`\`\``, Menus.logs());
  });

  bot.action('log_auth', async (ctx: Context) => {
    await loading(ctx);
    const msg = await LogsService.getLogLines('/var/log/auth.log', 50);
    await sendActionResponse(ctx, `🔐 *Auth Log*\n\n\`\`\`text\n${msg}\n\`\`\``, Menus.logs());
  });

  bot.action('log_syslog', async (ctx: Context) => {
    await loading(ctx);
    const msg = await LogsService.getLogLines('/var/log/syslog', 50);
    await sendActionResponse(ctx, `🖥 *Syslog*\n\n\`\`\`text\n${msg}\n\`\`\``, Menus.logs());
  });

  // --- Advanced Actions ---
  bot.action('action_clear_ram', async (ctx: Context) => {
    await loading(ctx);
    const msg = await MaintenanceService.clearRamCache();
    await sendActionResponse(ctx, msg, Menus.advanced());
  });

  bot.action('action_apt_update', async (ctx: Context) => {
    await loading(ctx);
    const msg = await MaintenanceService.getUpgradablePackages();
    await sendActionResponse(ctx, msg, Menus.advanced());
  });

  bot.action('action_docker_prune', async (ctx: Context) => {
    await loading(ctx);
    const msg = await DockerService.pruneSystem();
    await sendActionResponse(ctx, msg, Menus.advanced());
  });

  const handleBackup = async (ctx: Context, type: 'mysql' | 'postgres') => {
    await loading(ctx);
    try {
      await sendActionResponse(ctx, `⚠️ يرجى استخدام الأمر المباشر لعمل النسخ الاحتياطي:\n\nلـ Postgres:\n\`/backup postgres dbname\`\n\nلـ MySQL:\n\`/backup mysql dbname\``, Menus.advanced());
    } catch(e) {}
  };

  bot.action('action_backup_mysql', async (ctx: Context) => handleBackup(ctx, 'mysql'));
  bot.action('action_backup_postgres', async (ctx: Context) => handleBackup(ctx, 'postgres'));

  bot.action('menu_ufw', async (ctx: Context) => {
    await ctx.editMessageText('🛡️ *جدار الحماية (UFW)*\nاختر الإجراء المطلوب:', { parse_mode: 'Markdown', ...Menus.ufw() });
  });

  bot.action('action_ufw_status', async (ctx: Context) => {
    await loading(ctx);
    const { UfwService } = require('../services/ufw.service');
    const msg = await UfwService.getStatus();
    await sendActionResponse(ctx, `🛡️ *حالة جدار الحماية*\n\n\`\`\`text\n${msg}\n\`\`\``, Menus.ufw());
  });

  bot.action('action_ufw_enable', async (ctx: Context) => {
    await loading(ctx);
    const { UfwService } = require('../services/ufw.service');
    const msg = await UfwService.enable();
    await sendActionResponse(ctx, msg, Menus.ufw());
  });

  bot.action('action_ufw_disable', async (ctx: Context) => {
    await loading(ctx);
    const { UfwService } = require('../services/ufw.service');
    const msg = await UfwService.disable();
    await sendActionResponse(ctx, msg, Menus.ufw());
  });

  bot.action('action_chart', async (ctx: Context) => {
    await loading(ctx);
    try {
      const { ChartsService } = require('../services/charts.service');
      const url = await ChartsService.generateResourceChartUrl();
      await ctx.editMessageText('✅ تم توليد الرسم البياني:', { parse_mode: 'Markdown', ...Menus.resources() });
      await ctx.replyWithPhoto(url, { caption: '📊 الموارد الحالية للنظام' });
      await ctx.answerCbQuery();
    } catch(e) {
      await sendActionResponse(ctx, '❌ خطأ أثناء توليد الرسم.', Menus.resources());
    }
  });

  bot.action('action_cron', async (ctx: Context) => {
    await loading(ctx);
    const { CronService } = require('../services/cron.service');
    const msg = await CronService.getJobs();
    await sendActionResponse(ctx, `⏰ *المهام المجدولة*\n\n\`\`\`text\n${msg}\n\`\`\``, Menus.advanced());
  });

  // --- File Explorer Actions ---
  bot.action('action_files_explorer', async (ctx: Context) => {
    await loading(ctx);
    const defaultPath = config.allowedPaths.length > 0 ? config.allowedPaths[0] : '/';
    FilesService.cachePath(defaultPath);
    const markup = await FilesService.getDirectoryInlineKeyboard(defaultPath, 0);
    if (markup) {
      await sendActionResponse(ctx, `📂 *متصفح الملفات:*\n\`${defaultPath}\``, markup);
    } else {
      await sendActionResponse(ctx, `❌ فشل فتح المتصفح.`, Menus.files());
    }
  });

  bot.action(/^fs_dir_(.+)_(.+)$/, async (ctx: Context) => {
    await loading(ctx);
    const hash = (ctx as any).match[1];
    const page = parseInt((ctx as any).match[2], 10) || 0;
    const targetPath = FilesService.getPathFromCache(hash);
    if (!targetPath) {
      await sendActionResponse(ctx, `❌ المسار غير صالح أو انتهت صلاحيته.`, Menus.files());
      return;
    }
    const markup = await FilesService.getDirectoryInlineKeyboard(targetPath, page);
    if (markup) {
      await sendActionResponse(ctx, `📂 *متصفح الملفات:*\n\`${targetPath}\``, markup);
    } else {
      await sendActionResponse(ctx, `❌ فشل فتح المجلد \`${targetPath}\``, Menus.files());
    }
  });

  bot.action(/^fs_file_(.+)_(.+)$/, async (ctx: Context) => {
    await loading(ctx);
    const hash = (ctx as any).match[1];
    const targetPath = FilesService.getPathFromCache(hash);
    if (!targetPath) {
      await sendActionResponse(ctx, `❌ الملف غير صالح أو انتهت صلاحيته.`, Menus.files());
      return;
    }
    const msg = await FilesService.readFile(targetPath);
    const parentHash = FilesService.cachePath(require('path').dirname(targetPath));
    const markup = { inline_keyboard: [[{ text: '⬆️ رجوع للمجلد', callback_data: `fs_dir_${parentHash}_0` }]] };
    await sendActionResponse(ctx, msg, markup);
  });

  // --- Alerts Actions ---
  bot.action('action_alerts_status', async (ctx: Context) => {
    const isSshOn = (SecurityService as any).tailProcess !== null && (SecurityService as any).tailProcess !== undefined;
    const msg = `🔔 *إعدادات التنبيهات*\n\nالموارد: ${AlertsService.isRunning() ? '✅' : '❌'}\nSSH: ${isSshOn ? '✅' : '❌'}`;
    await sendActionResponse(ctx, msg, Menus.alerts());
  });

  bot.action('action_alerts_on', async (ctx: Context) => {
    if (!AlertsService.isRunning()) AlertsService.start(async (m) => { await bot.telegram.sendMessage(config.adminId, m, { parse_mode: 'Markdown' }); });
    await sendActionResponse(ctx, '✅ تم تفعيل تنبيهات الموارد.', Menus.alerts());
  });

  bot.action('action_alerts_off', async (ctx: Context) => {
    AlertsService.stop();
    await sendActionResponse(ctx, '❌ تم إيقاف تنبيهات الموارد.', Menus.alerts());
  });

  bot.action('action_ssh_on', async (ctx: Context) => {
    SecurityService.startSshMonitor(async (m) => { await bot.telegram.sendMessage(config.adminId, m, { parse_mode: 'Markdown' }); });
    await sendActionResponse(ctx, '🛡️ تم تفعيل مراقبة SSH.', Menus.alerts());
  });

  bot.action('action_ssh_off', async (ctx: Context) => {
    SecurityService.stopSshMonitor();
    await sendActionResponse(ctx, '🛑 تم إيقاف مراقبة SSH.', Menus.alerts());
  });
};
