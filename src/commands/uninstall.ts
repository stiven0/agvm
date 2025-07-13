import { uninstallVersion } from '../core/version-manager';

export const uninstallCommand = async (version: string) => {
  return await uninstallVersion(version);
};
