import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export class DiffService {
  static async computeDiff(starterPath: string, targetPath: string): Promise<string> {
    try {
      // Use git diff to compare two directories.
      // --no-index allows comparing paths outside of a git repository.
      const command = `git diff --no-index --unified=3 ${starterPath} ${targetPath}`;
      
      const { stdout } = await execPromise(command);
      return stdout;
    } catch (error: any) {
      // git diff exits with code 1 if differences are found, so it will throw an error.
      // We can catch it and return stdout.
      if (error.stdout) {
        return error.stdout;
      }
      console.error('Diff computation failed:', error);
      throw error;
    }
  }
}
