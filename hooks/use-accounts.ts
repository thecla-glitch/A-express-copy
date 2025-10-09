import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAccounts as apiGetAccounts,
  createAccount as apiCreateAccount,
  updateAccount as apiUpdateAccount,
  deleteAccount as apiDeleteAccount,
} from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';

export interface Account {
  id: number;
  name: string;
  balance: string; // Assuming balance is a string representation of a decimal
  created_by: {
    id: number;
    full_name: string;
  };
  created_at: string;
}

export function useAccounts() {
  const queryClient = useQueryClient();

  const { data: accounts, isLoading: isLoadingAccounts } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await apiGetAccounts();
      return response.data;
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: apiCreateAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({ title: 'Success', description: 'Account created successfully.' });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.name?.[0] || 'Failed to create account.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) => apiUpdateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({ title: 'Success', description: 'Account updated successfully.' });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.name?.[0] || 'Failed to update account.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: apiDeleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({ title: 'Success', description: 'Account deleted successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete account.', variant: 'destructive' });
    },
  });

  return {
    accounts: accounts || [],
    isLoadingAccounts,
    createAccount: createAccountMutation.mutateAsync,
    updateAccount: updateAccountMutation.mutateAsync,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isCreating: createAccountMutation.isPending,
    isUpdating: updateAccountMutation.isPending,
    isDeleting: deleteAccountMutation.isPending,
  };
}
