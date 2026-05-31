/**
 * Formats bytes into a human readable string.
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Ensures message doesn't exceed Telegram's length limit (4096 chars).
 * Splits if necessary, but here we just truncate or handle basic limiting.
 */
export const truncateMessage = (msg: string, limit = 4000): string => {
  if (msg.length <= limit) return msg;
  return msg.substring(0, limit) + '\n\n...[محتوى طويل جداً تم قطعه]';
};
