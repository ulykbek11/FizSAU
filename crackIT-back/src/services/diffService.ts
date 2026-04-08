import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export class DiffService {
  static async computeDiff(starterPath: string, targetPath: string): Promise<string> {
    try {

      const command = `git diff --no-index --unified=3 ${starterPath} ${targetPath}`;

      const { stdout } = await execPromise(command);
      return stdout;
    } catch (error: any) {

      if (error.stdout) {
        return error.stdout;
      }
      console.error('Diff computation failed:', error);
      throw error;
    }
  }
}

