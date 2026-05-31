import { Telegraf } from 'telegraf';
import { config } from './config';
import { logger } from './utils/logger';
import { authMiddleware } from './bot/middleware';
import { setupCommands } from './bot/commands';
import { setupActions } from './bot/actions';
import { AlertsService } from './services/alerts.service';
import http from 'http';

const startApp = async () => {
  try {
    const bot = new Telegraf(config.botToken);

    // Setup Middleware
    bot.use(authMiddleware);

    // Setup Commands & Actions
    setupCommands(bot);
    setupActions(bot);

    // Start Bot
    bot.launch();
    logger.info(`Bot is up and running as admin ID: ${config.adminId}`);

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    // Start Alerts Service
    if (config.alertsEnabled) {
      AlertsService.start(async (msg: string) => {
        try {
          await bot.telegram.sendMessage(config.adminId, msg, { parse_mode: 'Markdown' });
        } catch (e) {
          logger.error('Failed to send alert message', e);
        }
      });
    }

    // Start a lightweight HTTP Server for Nginx proxy & Health Checks
    const server = http.createServer((req, res) => {
      if (req.url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    server.listen(config.port, '127.0.0.1', () => {
      logger.info(`Health check server listening on http://127.0.0.1:${config.port}`);
    });

  } catch (e) {
    logger.error('Error starting the application', e);
    process.exit(1);
  }
};

startApp();
