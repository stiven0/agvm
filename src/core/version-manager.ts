import { execSync } from 'child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { satisfies } from 'semver';

import { ErrorCode } from '../errors/codes';
import { AGVMError } from '../errors/handle-error';
import { angularNodeCompat } from '../utils/angular-node-compat';
import { access, chmod, mkdir, readFileUTF8, rename, rm, writeFile } from '../utils/fs';
import { angularDir, backupPath, getFileExecutableNG, getVersionPath, userBin, wrapperPath } from '../utils/paths';
import { getConfig, saveConfig } from './config';
import { removeWrapperAndRestoreGlobal } from './wrapper-manager';

/**
 * Verifies if a given path (for an Angular CLI version) exists.
 * @param versionPath path to the version folder
 * @returns true if the path exists, false otherwise
 */
export const fileExists = async (versionPath: string): Promise<boolean> => {
  try {
    await access(versionPath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sets the active version of Angular CLI.
 * @param versionActive the version to set as active
 * @param versions the list of all installed versions
 * @throws AGVMError if the version is not found or if there is an error writing the active version
 */
export const setActiveVersion = async (versionActive: string, versions: string[]) => {
  const config = await getConfig();

  if (config) {
    const fileExecutableNG = getFileExecutableNG(versionActive);
    const ngScriptPath: string = path.join(angularDir, versionActive, 'node_modules', '@angular', 'cli', 'bin', fileExecutableNG);

    if (!existsSync(ngScriptPath)) {
      throw new AGVMError(
        ErrorCode.ScriptNotFound,
        `The main script for the version was not found ${versionActive} in ${ngScriptPath}.
      `,
      );
    }

    const npmPrefix = execSync('npm prefix -g', { encoding: 'utf8' }).trim();
    const globalNgPath = process.platform === 'win32' ? path.join(npmPrefix, 'ng.cmd') : path.join(npmPrefix, 'bin', 'ng');

    try {
      let wrapperContent: string;
      if (process.platform === 'win32') {
        wrapperContent = `@echo off\r\nnode "${ngScriptPath}" %*\r\n`;
      } else {
        wrapperContent = `#!/bin/sh\nnode "${ngScriptPath}" "$@"\n`;
      }

      if (process.platform === 'win32') {
        await writeFile(globalNgPath, wrapperContent, { encoding: 'utf8' });
      } else {
        await writeFile(globalNgPath, wrapperContent, { encoding: 'utf8', mode: 0o755 });
      }

      config.active = versionActive;
      config.installed = versions;
      await saveConfig(config);
      console.log(`Active version switched to Angular CLI v${versionActive}`);
    } catch {
      throw new AGVMError(ErrorCode.UseFail, `Error changing the active version`);
    }
  }
};

/**
 * Checks if there is an active version of Angular CLI and if there are any
 * versions installed. If not, throws an error with instructions on how to
 * resolve the issue.
 */
const validateConfiguration = async () => {
  const config = await getConfig();
  if (!config?.active && config?.installed.length === 0) {
    throw new AGVMError(
      ErrorCode.AngularVersionAGVMNotFound,
      `❌ No active version. Execute:\n` + `   agvm install <version>\n` + `   agvm use <version>\n`,
    );
  }
};

/**
 * Checks if the current 'ng' command wrapper is intact and correctly pointing to the
 * active version of Angular CLI managed by AGVM.
 *
 * @returns {Promise<boolean>} - Returns `true` if the wrapper is intact and points to
 * the expected Angular CLI script; otherwise, returns `false`.
 */
const isWrapperIntact = async (): Promise<boolean> => {
  const config = await getConfig();
  if (!config || !config.active) return false;

  const npmPrefix = execSync('npm prefix -g', { encoding: 'utf8' }).trim();
  const globalNgPath = process.platform === 'win32' ? path.join(npmPrefix, 'ng.cmd') : path.join(npmPrefix, 'bin', 'ng');

  if (!existsSync(globalNgPath)) {
    return false;
  }

  let shellNgPath: string;
  try {
    const cmd = process.platform === 'win32' ? 'where ng' : 'which ng';
    shellNgPath = execSync(cmd, { encoding: 'utf8' }).split(/\r?\n/)[0].trim();
  } catch {
    return false;
  }

  if (
    path.normalize(shellNgPath) !== path.normalize(globalNgPath) &&
    path.normalize(`${shellNgPath}.cmd`) !== path.normalize(globalNgPath)
  ) {
    return false;
  }

  const content = await readFileUTF8(globalNgPath);

  const fileExecutableNG = getFileExecutableNG(config.active);
  const expectedScriptPath = path.join(angularDir, config.active, 'node_modules', '@angular', 'cli', 'bin', fileExecutableNG);

  const regex = /node\s+"([^"]+ng(?:\.js)?)"/i;
  const match = content.match(regex);

  if (match && match[1]) {
    const actualScriptPath = path.normalize(match[1]);
    const expectedNormalized = path.normalize(expectedScriptPath);
    return actualScriptPath === expectedNormalized;
  }

  return false;
};

/**
 * Installs a specific version of Angular CLI.
 * @param version the version to install, e.g. 13.2.3
 * @throws AGVMError if the version does not exist or if there is an error during installation
 */
export const installVersion = async (version: string) => {
  const versionPath = getVersionPath(version);
  if (await fileExists(versionPath)) {
    console.log(`Version ${version} it is already installed.`);
    return;
  }

  console.log(`Installing Angular CLI v${version}...`);

  await mkdir(versionPath, { recursive: true });
  try {
    execSync(`npm install @angular/cli@${version} --prefix "${versionPath}"`, { stdio: 'inherit' });
  } catch {
    if (await fileExists(versionPath)) await rm(versionPath, { recursive: true, force: true });
    throw new AGVMError(
      ErrorCode.InstallFail,
      `Failed to install Angular CLI v${version}. Check if the version exists or if you have an internet connection.`,
    );
  }

  const config = await getConfig();

  if (config) {
    if (!config.installed.includes(version)) {
      config.installed.push(version);
      await saveConfig(config);
      console.log(`Angular CLI v${version} installed`);
      console.log('Run the command "agvm use <version>" to use it.');
    }
  }
};

/**
 * Lists all installed versions of Angular CLI managed by AGVM, and indicates the active version.
 * Validates the configuration before proceeding. If the current Angular CLI version is not managed
 * by AGVM, updates the configuration accordingly. Displays a warning if the current version is external
 * and shows the external version if available.
 *
 * - If no versions are installed, provides guidance on installing a version.
 * - If the wrapper managing the `ng` command is not intact, attempts to retrieve and save the external
 *   Angular CLI version.
 *
 * @throws AGVMError if there's an issue with the configuration validation.
 */
export const listVersions = async () => {
  await validateConfiguration();

  const config = await getConfig();

  let externalVersion = '';
  const wrapperIntact = await isWrapperIntact();

  if (!wrapperIntact && config && config.installed.length > 0) {
    console.log('⚠️ The current version of Angular is not being handled by AGVM.');
    console.log('Run the command "agvm use <version>" to change it.');
    config.active = '';
    await saveConfig(config);
  }

  if (!wrapperIntact) {
    let output = '';

    try {
      output = execSync('ng version', { stdio: 'pipe', encoding: 'utf8' });
    } catch {
      /* empty */
    }

    if (output) {
      const match = output.match(/Angular CLI:\s*([\d.]+)/);
      if (match) {
        externalVersion = match[1];
        if (config) {
          config.versionGlobalUser = externalVersion;
          if (!config.installed.includes(externalVersion)) {
            config.active = '';
          }
          await saveConfig(config);
        }
      }
    } else {
      if (config?.versionGlobalUser) {
        config.versionGlobalUser = '';
        await saveConfig(config);
      }
    }
  }

  if (config && config.installed.length > 0) {
    console.log('\nInstalled versions (AGVM):');
    for (const version of config.installed) {
      const activeMark = config.active === version ? '* (active)' : '';
      console.log(`- ${version} ${activeMark}`);
    }
  } else {
    console.log('\nThere are no versions installed with AGVM.');
    console.log('Run the command "agvm install <version>" to install a version.');
  }

  if (!wrapperIntact && externalVersion) {
    console.log(`\n Currently active (external): ${externalVersion}`);
  }
};

/**
 * Sets the active version of Angular CLI.
 * @param version the version to set as active
 * @throws AGVMError if the version is not found or if there is an error writing the active version
 */
export const useVersion = async (version: string) => {
  const config = await getConfig();
  if (config) {
    if (!config.installed.includes(version)) {
      throw new AGVMError(ErrorCode.VersionNotFound, `Version ${version} is not installed.`);
    }

    if ((await isWrapperIntact()) && config.active === version) {
      console.log(`Active version Angular CLI v${version}`);
      return;
    }

    const fileExecutableNG = getFileExecutableNG(version);
    const ngScriptPath: string = path.join(angularDir, version, 'node_modules', '@angular', 'cli', 'bin', fileExecutableNG);

    if (!existsSync(ngScriptPath)) {
      throw new AGVMError(ErrorCode.ScriptNotFound, `The main script for the version was not found ${version} in ${ngScriptPath}.`);
    }

    if (process.platform !== 'win32') {
      if (await fileExists(wrapperPath)) {
        const content = await readFileUTF8(wrapperPath);
        if (!content.includes('.angular-versions')) {
          await rename(wrapperPath, backupPath);
        }
      }
    }

    const npmPrefix = execSync('npm prefix -g', { encoding: 'utf8' }).trim();
    const globalNgPath = process.platform === 'win32' ? path.join(npmPrefix, 'ng.cmd') : path.join(npmPrefix, 'bin', 'ng');

    let wrapperContent: string;
    if (process.platform === 'win32') {
      wrapperContent = `@echo off\r\nnode "${ngScriptPath}" %*\r\n`;
    } else {
      wrapperContent = `#!/bin/sh\nnode "${ngScriptPath}" "$@"\n`;
    }
    await writeFile(globalNgPath, wrapperContent, {});

    if (process.platform !== 'win32') await chmod(globalNgPath, 0o755);

    config.active = version;
    await saveConfig(config);
    console.log(`Active version switched to Angular CLI v${version}`);
  }
};

/**
 * Uninstalls a specific version of Angular CLI.
 * @param version the version to uninstall, e.g. 13.2.3
 * @throws AGVMError if the version does not exist
 */
export const uninstallVersion = async (version: string) => {
  const versionPath = getVersionPath(version);
  if (!existsSync(versionPath)) {
    throw new AGVMError(ErrorCode.VersionNotFound, `Version ${version} is not installed.`);
  }

  await rm(versionPath, { recursive: true, force: true });

  const config = await getConfig();
  if (config) {
    config.installed = config.installed.filter((vrs: string) => vrs !== version);
    if (config.active === version) {
      if (config.installed.length > 0) {
        const newActive = config.installed[0];
        await setActiveVersion(newActive, config.installed);
      } else {
        await removeWrapperAndRestoreGlobal();
        config.active = '';
        await saveConfig(config);
      }
    } else {
      await saveConfig(config);
    }

    console.log(`Version ${version} successfully uninstalled.`);
  }
};

/**
 * Analyzes the AGVM configuration and the current environment and provides information and
 * warnings about potential issues.
 *
 * It checks the following:
 * - 1. Existence of the AGVM configuration
 * - 2. Integrity of the 'ng' command
 * - 3. Paths of the 'ng' command in the PATH environment variable
 * - 4. Installed versions of Angular CLI with AGVM
 * - 5. Quick command test of AGVM
 * - 6. Presence of the user's AGVM wrapper folder in the PATH environment variable
 * - 7. Compatibility between the active version of Angular CLI and Node.js
 *
 * If you see ⚠️ or ❌, correct as directed.
 */
export const doctor = async () => {
  // 1. Check AGVM config
  const config = await getConfig();
  if (!config) {
    console.warn('Configuration not found. Have you installed any version?');
  } else {
    console.log('✅ Successful configuration:', config);
  }

  // 2. Integrity of wrapper 'ng'
  const intact = await isWrapperIntact();
  console.log(
    intact ? '\n✅ `ng` command points to AGVM version.' : '\n❌ Command `ng` DOES NOT point to AGVM, check your PATH or use `agvm use`.',
  );

  // 3. ng Paths on Windows/Linux
  try {
    const where = execSync(process.platform === 'win32' ? 'where ng' : 'which -a ng', { encoding: 'utf8' });
    console.log('\n✅ Found paths for command ng:\n' + where.trim());
  } catch {
    console.log('\n⚠️ Not found `ng` in PATH.');
  }

  // 4. Installed versions
  if (config?.installed?.length) {
    console.log('\n✅ Installed versions with AGVM:');
    config.installed.forEach((v) => console.log(`  - ${v}${v === config.active ? ' (active)' : ''}`));
  }

  // 5. Quick command test
  try {
    const version = execSync('agvm --version', { encoding: 'utf8' }).trim();
    const agvmInfoVersion = version.split('\n');
    const currentVersion = agvmInfoVersion[agvmInfoVersion.length - 1].trim();
    console.log(`\n✅ AGVM responds correctly - version: ${currentVersion}`);
  } catch {
    console.warn('\n❌ Could not execute `agvm --version`.');
  }

  // 6. PATH
  const pathEnv = process.env.PATH || '';
  const pathParts = pathEnv.split(path.delimiter);

  if (!pathParts.includes(userBin)) {
    console.warn(`\n⚠️ Your wrapper folder (${userBin}) is *not* in PATH.`);
  } else {
    console.log(`\n✅ ${userBin} present in PATH.`);
  }

  // 7. Check compatibility between Angular CLI version and Node.js
  if (config?.active) {
    try {
      const nodeVersionRaw = execSync('node --version', { encoding: 'utf8' }).trim();
      const nodeVersion = nodeVersionRaw.startsWith('v') ? nodeVersionRaw.slice(1) : nodeVersionRaw;
      const angularMajor = config.active.split('.')[0];

      const compatibleRange = angularNodeCompat[angularMajor];
      if (!compatibleRange) {
        console.warn(`\n⚠️ There is no compatibility information for Angular CLI. v${config.active}.`);
        return;
      }

      if (satisfies(nodeVersion, compatibleRange)) {
        console.log(`\n✅ The Node.js version (${nodeVersion}) is supported by Angular CLI v${config.active}.`);
      } else {
        console.warn(
          `❌ Node.js v${nodeVersion} is not supported by Angular CLI v${config.active}.` +
            `\n Supported range: ${compatibleRange}, install a compatible version.`,
        );
      }
    } catch {
      console.warn('❌ Could not run `node --version` or process the version.');
    }
  }

  console.log('\n🔧 Doctor completed. If you see ⚠️ or ❌, correct as directed.');
};
