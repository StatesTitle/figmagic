import fs from 'fs';
import * as path from 'path';
import { write } from './write';

export const writeIndexFile = () => {
  const TOKEN_PATH = path.join(__dirname, '../tokens/');
  let content = '';
  fs.readdir(TOKEN_PATH, (err, files) => {
    files.forEach((file) => {
      content += `export * from './${file.split('.')[0]}'\n`;
    });
    write(TOKEN_PATH + 'index.ts', content);
  });
};
