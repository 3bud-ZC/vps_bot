import { exec } from 'child_process';

/**
 * Safely executes a shell command with a timeout.
 * @param command The shell command to execute
 * @param timeoutMs Timeout in milliseconds (default 10000ms)
 * @returns Promise that resolves with standard output or rejects with an error
 */
export const execCommand = (command: string, timeoutMs: number = 10000): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: timeoutMs }, (error, stdout, stderr) => {
      if (error) {
        if (error.killed) {
          return reject(new Error(`Command timed out after ${timeoutMs}ms: ${command}`));
        }
        return reject(new Error(stderr || error.message));
      }
      resolve(stdout.trim());
    });
  });
};
