import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/userService'
import type { UserCreate, UserUpdate } from '../types'

const QUERY_KEY = ['users']

export function useUsers(params?: Record<string, unknown>, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => userService.list(params),
    ...options,
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => userService.getById(id),
    enabled: id > 0,
  })
}

export function useCertifiedUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'certified'],
    queryFn: () => userService.getCertified(),
    ...options,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UserCreate) => userService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpdateUser(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UserUpdate) => userService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
