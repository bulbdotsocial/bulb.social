import { useWalletContract } from './useWalletContract';

export interface CreateProfileParams {
  username: string;
  profilePicture: string;
  description: string;
}

export const useContractWrite = () => {
  const { createProfile, isLoading, error } = useWalletContract();

  return {
    createProfile,
    isLoading,
    error,
  };
};
