import { installVersion } from '../core/version-manager';

export const installCommand = async (version: string) => {
  return await installVersion(version);
};
