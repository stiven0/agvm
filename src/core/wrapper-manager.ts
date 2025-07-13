import { execSync } from 'child_process';
import { existsSync } from 'node:fs';
import path from 'path';

import { ErrorCode } from '../errors/codes';
import { AGVMError } from '../errors/handle-error';
import { mkdir, rename, unlink, writeFile } from '../utils/fs';
import { backupPath, getFileExecutableNG, getGlobalNgBin, wrapperPath } from '../utils/paths';
import { getConfig } from './config';
import { fileExists } from './version-manager';

/**
 * Remove the AGVM wrapper and restore the global `ng` command (if it was
 * previously backed up).
 *
 * @throws AGVMError if there's an issue reading the configuration or
 * executing the `which ng` command.
 */
export const removeWrapperAndRestoreGlobal = async () => {
  try {
    await unlink(wrapperPath);
  } catch {
    /* empty */
  }

  const config = await getConfig();
  if (!config) throw new AGVMError(ErrorCode.ConfigRead, 'Could not read AGVM configuration.');

  if (process.platform === 'win32') {
    if (config.versionGlobalUser) {
      const globalNgBin = getGlobalNgBin(config.versionGlobalUser);
      const wrapperContent = `@echo off\r\nnode "${globalNgBin}" %*\r\n`;
      await mkdir(path.dirname(wrapperPath), { recursive: true });
      await writeFile(wrapperPath, wrapperContent, { encoding: 'utf8' });
    }
    return;
  }

  if (await fileExists(backupPath)) {
    await rename(backupPath, wrapperPath);
    return;
  }

  let realGlobalNg: string;
  try {
    const lines = execSync('which ng', { encoding: 'utf8' })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    realGlobalNg = lines.find((l) => path.resolve(l) !== path.resolve(wrapperPath))!;
  } catch {
    console.log("The 'ng' command will not be available until you install or activate a version with AGVM.");
    return;
  }
  if (!realGlobalNg) {
    console.log("The 'ng' command will not be available until you install or activate a version with AGVM.");
    return;
  }

  const prefixDir = realGlobalNg.replace(/\/bin\/ng$/, '');
  const candidateJs = path.join(prefixDir, 'lib', 'node_modules', '@angular', 'cli', 'bin', getFileExecutableNG(config.versionGlobalUser));

  if (!existsSync(candidateJs)) {
    console.log("The 'ng' command will not be available until you install or activate a version with AGVM.");
    return;
  }

  const wrapperContent = `#!/bin/sh\nnode "${candidateJs}" "$@"\n`;
  await mkdir(path.dirname(wrapperPath), { recursive: true });
  await writeFile(wrapperPath, wrapperContent, {
    encoding: 'utf8',
    mode: 0o755,
  });
};
