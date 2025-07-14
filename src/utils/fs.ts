import { Mode, PathLike, promises as fsp, WriteFileOptions } from 'node:fs';
import { FileHandle } from 'node:fs/promises';

import { DataWriteFile } from '../types/fs';

export const unlink = (path: string) => fsp.unlink(path);
export const access = (path: string) => fsp.access(path);
export const readFileUTF8 = (path: string) => fsp.readFile(path, 'utf8');
export const mkdir = (path: string, options?: { recursive?: boolean }) => fsp.mkdir(path, options);
export const rm = (path: string, options?: { recursive?: boolean; force?: boolean }) => fsp.rm(path, options);
export const chmod = (path: PathLike, mode: Mode) => fsp.chmod(path, mode);
export const rename = (oldPath: PathLike, newPath: PathLike) => fsp.rename(oldPath, newPath);
export const writeFile = (path: PathLike | FileHandle, data: DataWriteFile, options: WriteFileOptions) => {
  return fsp.writeFile(path, data, options);
};
