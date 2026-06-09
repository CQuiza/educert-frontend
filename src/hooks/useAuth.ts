import { useMutation, useQuery } from '@tanstack/react-query'
import { authService } from '../services/authService'
import type { LoginRequest } from '../types'

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
  })
}

export function useGetMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.getMe(),
    retry: false,
  })
}
