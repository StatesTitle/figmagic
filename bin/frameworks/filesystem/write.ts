import fs from 'fs';

import { ErrorWrite } from '../errors/errors';

/**
 * @description Helper that writes files. Prefer using the writeFile function since that is hooked for up for any pre-processing.
 */
export function write(filePath: string, fileContent: string): void {
  try {
    if (!filePath || !fileContent) throw Error(ErrorWrite);
    fs.writeFileSync(filePath, fileContent, 'utf-8');
  } catch (error: any) {
    throw Error(error);
  }
}
