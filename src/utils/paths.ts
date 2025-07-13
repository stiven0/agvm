import { execSync } from 'node:child_process';
import path from 'node:path';
import os from 'os';

import { wrapperName } from './shell';

export const npmPrefix = () => execSync('npm config get prefix', { encoding: 'utf8' }).trim();
export const getVersionPath = (version: string) => path.join(angularDir, version);
export const getFileExecutableNG = (version: string) => (+version.split('.')[0] >= 13 ? 'ng.js' : 'ng');

/**
 * Constructs the global path to the Angular CLI executable for a specified version.
 *
 * Depending on the operating system, this function generates the path to the `ng` or `ng.js` script
 * within the globally installed Angular CLI package. On Windows, it assumes the package is located
 * under `node_modules`, while on Unix-like systems, it assumes the package is under `lib/node_modules`.
 *
 * @param version - The Angular CLI version for which to retrieve the executable path.
 * @returns The path to the Angular CLI executable for the specified version.
 */
export const getGlobalNgBin = (version: string) =>
  process.platform === 'win32'
    ? path.join(npmPrefix(), 'node_modules', '@angular', 'cli', 'bin', getFileExecutableNG(version))
    : path.join(npmPrefix(), 'lib', 'node_modules', '@angular', 'cli', 'bin', getFileExecutableNG(version));

export const angularDir = path.join(process.env.HOME || process.env.USERPROFILE || '', '.angular-versions');
export const userBin: string = process.platform === 'win32' ? npmPrefix() : path.join(os.homedir(), '.local', 'bin');
export const wrapperPath = path.join(userBin, wrapperName);
export const backupPath = wrapperPath + '.global';
