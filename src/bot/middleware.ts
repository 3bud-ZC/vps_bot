import { Context } from 'telegraf';
import { config } from '../config';

/**
 * Middleware to restrict bot usage to the configured admin ID
 */
export const authMiddleware = async (ctx: Context, next: () => Promise<void>) => {
  const userId = ctx.from?.id;
  
  if (userId === config.adminId) {
    return next();
  }

  // Unauthorized user
  try {
    await ctx.reply('غير مصرح لك باستخدام هذا البوت.');
  } catch (e) {
    console.error(`Failed to send unauthorized message to ${userId}`, e);
  }
};
