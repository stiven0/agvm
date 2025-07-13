import path from 'node:path';

import { fileExists } from '../core/version-manager';
import { Config } from '../types/config';
import { readFileUTF8, writeFile } from '../utils/fs';
import { angularDir } from '../utils/paths';

const configFile = path.join(angularDir, 'versions.json');

/**
 * Retrieves the configuration for AGVM from a JSON file.
 *
 * If the configuration file does not exist, it creates a default configuration
 * file with empty values and saves it.
 *
 * @returns The parsed configuration object or null if an error occurs.
 */
export const getConfig = async (): Promise<null | Config> => {
  try {
    if (!(await fileExists(configFile))) {
      const config: Config = { active: '', installed: [], versionGlobalUser: '' };
      await writeFile(configFile, JSON.stringify(config, null, 2), {});
    }
    const config = await readFileUTF8(configFile);
    return JSON.parse(config);
  } catch {
    return null;
  }
};

/**
 * Saves the given configuration to the AGVM configuration file.
 *
 * @param config the configuration to save
 * @returns true if the configuration was saved successfully, false otherwise
 */
export const saveConfig = async (config: Config): Promise<boolean> => {
  try {
    await writeFile(configFile, JSON.stringify(config, null, 2), {});
    return true;
  } catch {
    return false;
  }
};
