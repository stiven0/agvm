import { useVersion } from '../core/version-manager';

export const useCommand = async (version: string) => {
  return await useVersion(version);
};
