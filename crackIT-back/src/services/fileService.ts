import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

export class FileService {
  static async unzipFile(filePath: string, prefix: string): Promise<string> {
    const zip = new AdmZip(filePath);
    const extractPath = path.join(__dirname, '..', '..', 'tmp', `${prefix}_${Date.now()}`);

    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }

    zip.extractAllTo(extractPath, true);
    return extractPath;
  }

  static cleanup(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }
}

