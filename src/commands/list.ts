import { listVersions } from '../core/version-manager';

export const listCommand = async () => {
  return await listVersions();
};
